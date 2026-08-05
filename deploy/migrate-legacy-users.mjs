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

function ensureBackupTable() {
  sql(`
    CREATE SCHEMA IF NOT EXISTS deployment;
    CREATE TABLE IF NOT EXISTS deployment.auth_migration_backup (
      old_user_id uuid NOT NULL,
      email text NOT NULL,
      role text,
      ulb_id uuid,
      label text
    );
    CREATE UNIQUE INDEX IF NOT EXISTS auth_migration_backup_assignment_idx
      ON deployment.auth_migration_backup (
        old_user_id,
        COALESCE(role, ''),
        COALESCE(ulb_id::text, ''),
        COALESCE(label, '')
      );
  `)
}

function readLegacyUsers() {
  const output = sql(`
    SELECT id::text, lower(email)
    FROM auth.users u
    WHERE u.email IS NOT NULL
      AND (
        lower(u.email) = 'superadmin@portal.local'
        OR lower(u.email) IN (
          SELECT lower(replace(slug, '-', '')) || 'admin@portal.local'
          FROM public.ulbs
        )
      )
      AND (
        u.confirmation_token IS NULL
        OR u.recovery_token IS NULL
        OR u.email_change_token_current IS NULL
        OR u.email_change_token_new IS NULL
        OR u.email_change IS NULL
        OR u.phone_change_token IS NULL
        OR u.phone_change IS NULL
        OR u.reauthentication_token IS NULL
        OR EXISTS (
          SELECT 1
          FROM deployment.auth_migration_backup b
          WHERE b.old_user_id = u.id
        )
      )
    ORDER BY u.email;
  `)
  if (!output) return []
  return output.split('\n').map((line) => {
    const [id, email] = line.split('\t')
    return { id, email }
  })
}

function normalizeMalformedAuthRows() {
  const count = Number(sql(`
    SELECT count(*)
    FROM auth.users
    WHERE confirmation_token IS NULL
       OR recovery_token IS NULL
       OR email_change_token_current IS NULL
       OR email_change_token_new IS NULL
       OR email_change IS NULL
       OR phone_change_token IS NULL
       OR phone_change IS NULL
       OR reauthentication_token IS NULL;
  `))

  if (count === 0) return 0

  sql(`
    UPDATE auth.users
    SET confirmation_token = COALESCE(confirmation_token, ''),
        recovery_token = COALESCE(recovery_token, ''),
        email_change_token_current = COALESCE(email_change_token_current, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        email_change = COALESCE(email_change, ''),
        phone_change_token = COALESCE(phone_change_token, ''),
        phone_change = COALESCE(phone_change, ''),
        reauthentication_token = COALESCE(reauthentication_token, '');
  `)
  return count
}

function prepareMigration(legacyUsers) {
  const ids = legacyUsers.map(({ id }) => `'${id}'::uuid`).join(', ')
  sql(`
    INSERT INTO deployment.auth_migration_backup
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
    WHERE u.id IN (${ids})
    ON CONFLICT DO NOTHING;

    -- Some old installations added restrictive auth-user foreign keys. Remove
    -- only the staged public assignments before asking GoTrue to delete users;
    -- 03-roles.sql restores them against the newly created IDs.
    DELETE FROM public.ulb_admins WHERE user_id IN (${ids});
    DELETE FROM public.user_roles WHERE user_id IN (${ids});
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
      'The compatibility repair and assignment backup are safe to rerun; see deploy/README.md.',
  )
}

async function main() {
  ensureBackupTable()
  const legacyUsers = readLegacyUsers()
  if (legacyUsers.length > 0) {
    console.log(`Legacy auth migration: found ${legacyUsers.length} portal account(s) to recreate.`)
    console.log('Saving role and municipality assignments before GoTrue removes the old accounts.')
    prepareMigration(legacyUsers)
  }

  // GoTrue checks the users table while creating an account. A malformed row
  // for any email can therefore break creation of every portal account. Repair
  // all nullable legacy string fields before making any Admin API request.
  const normalized = normalizeMalformedAuthRows()
  console.log(`Legacy auth migration: normalized ${normalized} malformed auth row(s).`)

  if (legacyUsers.length === 0) {
    console.log('Legacy auth migration: no portal accounts require recreation.')
    return
  }

  for (const user of legacyUsers) {
    await deleteUser(user.id)
    console.log(`DELETE ${user.email} (GoTrue Admin API)`)
  }

  console.log('Legacy auth migration complete. Portal accounts can now be recreated through the GoTrue Admin API.')
}

main().catch((error) => {
  console.error(`Legacy auth migration failed: ${error.message}`)
  process.exitCode = 1
})