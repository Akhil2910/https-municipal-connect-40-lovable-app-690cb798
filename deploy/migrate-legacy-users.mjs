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
  console.log('Public role and municipality mappings will be restored by deploy/03-roles.sql after recreation.')

  for (const user of legacyUsers) {
    await deleteUser(user.id)
    console.log(`DELETE ${user.email} (GoTrue Admin API)`)
  }

  console.log('Legacy auth migration complete. User provisioning can now recreate the accounts safely.')
}

main().catch((error) => {
  console.error(`Legacy auth migration failed: ${error.message}`)
  process.exitCode = 1
})