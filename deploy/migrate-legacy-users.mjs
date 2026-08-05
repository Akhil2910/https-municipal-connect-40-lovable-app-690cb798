#!/usr/bin/env node
import { execFileSync } from 'node:child_process'

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`)
}

const baseUrl = process.env.SUPABASE_URL.replace(/\/$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  'Content-Type': 'application/json',
}

function sql(query) {
  return execFileSync(
    'docker',
    ['exec', 'portal-db', 'psql', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'postgres', '-At', '-F', '\t', '-c', query],
    { encoding: 'utf8' },
  ).trim()
}

function readLegacyUsers() {
  const output = sql(`
    SELECT id::text, lower(email)
    FROM auth.users
    WHERE email IS NOT NULL
      AND (
        confirmation_token IS NULL
        OR recovery_token IS NULL
        OR email_change_token_current IS NULL
        OR email_change_token_new IS NULL
        OR email_change IS NULL
        OR phone_change_token IS NULL
        OR phone_change IS NULL
        OR reauthentication_token IS NULL
      )
    ORDER BY email;
  `)
  if (!output) return []
  return output.split('\n').map((line) => {
    const [id, email] = line.split('\t')
    return { id, email }
  })
}

function prepareMigration(legacyUsers) {
  const ids = legacyUsers.map(({ id }) => `'${id}'::uuid`).join(', ')
  sql(`
    CREATE TABLE IF NOT EXISTS public._deployment_auth_migration_backup (
      old_user_id uuid NOT NULL,
      email text NOT NULL,
      role text,
      ulb_id uuid,
      label text
    );

    DELETE FROM public._deployment_auth_migration_backup
    WHERE old_user_id IN (${ids});

    INSERT INTO public._deployment_auth_migration_backup
      (old_user_id, email, role, ulb_id, label)
    SELECT
      u.id,
      lower(u.email),
      r.role::text,
      a.ulb_id,
      a.label
    FROM auth.users u
    LEFT JOIN public.user_roles r ON r.user_id = u.id
    LEFT JOIN public.ulb_admins a ON a.user_id = u.id
    WHERE u.id IN (${ids});

    UPDATE auth.users
    SET confirmation_token = COALESCE(confirmation_token, ''),
        recovery_token = COALESCE(recovery_token, ''),
        email_change_token_current = COALESCE(email_change_token_current, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        email_change = COALESCE(email_change, ''),
        phone_change_token = COALESCE(phone_change_token, ''),
        phone_change = COALESCE(phone_change, ''),
        reauthentication_token = COALESCE(reauthentication_token, '')
    WHERE id IN (${ids});
  `)
}

async function deleteUser(id) {
  const response = await fetch(`${baseUrl}/auth/v1/admin/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  })
  if (response.ok || response.status === 404) return
  const text = await response.text()
  throw new Error(
    `GoTrue could not delete legacy user ${id} (${response.status}): ${text || 'unknown error'}. ` +
      'No auth table was changed. Restore from backup if needed and see deploy/README.md.',
  )
}

async function main() {
  const legacyUsers = readLegacyUsers()
  if (legacyUsers.length === 0) {
    console.log('Legacy auth migration: no incompatible users found.')
    return
  }

  console.log(`Legacy auth migration: found ${legacyUsers.length} incompatible user(s).`)
  console.log('Saving role/mapping assignments and applying the GoTrue nullable-token compatibility repair.')
  prepareMigration(legacyUsers)

  for (const user of legacyUsers) {
    await deleteUser(user.id)
    console.log(`DELETE ${user.email} (GoTrue Admin API)`)
  }

  console.log('Legacy auth migration complete. Users can now be recreated through the GoTrue Admin API.')
}

main().catch((error) => {
  console.error(`Legacy auth migration failed: ${error.message}`)
  process.exitCode = 1
})