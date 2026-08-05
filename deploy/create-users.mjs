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

function readSlugs() {
  const output = execFileSync(
    'docker',
    ['exec', 'portal-db', 'psql', '-U', 'postgres', '-d', 'postgres', '-At', '-c', 'SELECT slug FROM public.ulbs ORDER BY slug'],
    { encoding: 'utf8' },
  )
  return output.split('\n').map((value) => value.trim()).filter(Boolean)
}

async function createUser(account) {
  const response = await fetch(`${baseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: account.email,
      password: account.password,
      email_confirm: true,
      app_metadata: { provider: 'email', providers: ['email'] },
    }),
  })
  const text = await response.text()
  let body = null
  if (text) {
    try { body = JSON.parse(text) } catch { body = text }
  }
  const code = typeof body === 'object' && body ? (body.error_code ?? body.code) : null
  if (code === 'email_exists' || code === 'user_already_exists') return null
  if (!response.ok) {
    throw new Error(`POST /auth/v1/admin/users failed (${response.status}): ${typeof body === 'string' ? body : JSON.stringify(body)}`)
  }
  return body
}

async function listUsers() {
  const users = []
  for (let page = 1; ; page += 1) {
    const response = await fetch(`${baseUrl}/auth/v1/admin/users?page=${page}&per_page=1000`, { headers })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(`GET /auth/v1/admin/users failed (${response.status}): ${JSON.stringify(body)}`)
    const batch = Array.isArray(body) ? body : (body.users ?? [])
    users.push(...batch)
    if (batch.length < 1000) return users
  }
}

async function updateUser(id, account) {
  const response = await fetch(`${baseUrl}/auth/v1/admin/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      email: account.email,
      password: account.password,
      email_confirm: true,
      app_metadata: { provider: 'email', providers: ['email'] },
    }),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`PUT /auth/v1/admin/users/${id} failed (${response.status}): ${text || 'unknown error'}`)
}

async function main() {
  const slugs = readSlugs()
  if (slugs.length === 0) throw new Error('No municipalities found. Run deploy/02-seed.sql first.')

  const desired = [
    { email: 'superadmin@portal.local', password: 'superadmin@321' },
    ...slugs.map((slug) => {
      const loginSlug = slug.toLowerCase().replaceAll('-', '')
      return { email: `${loginSlug}admin@portal.local`, password: `${loginSlug}@123` }
    }),
  ]

  const users = await listUsers()
  const existingByEmail = new Map(
    users.filter((user) => user.id && user.email).map((user) => [user.email.toLowerCase(), user]),
  )
  let created = 0
  let updated = 0

  for (const account of desired) {
    const existing = existingByEmail.get(account.email)
    if (existing) {
      await updateUser(existing.id, account)
      console.log(`UPDATE ${account.email}`)
      updated += 1
      continue
    }
    const result = await createUser(account)
    if (!result) {
      const refreshed = await listUsers()
      const matched = refreshed.find((user) => user.email?.toLowerCase() === account.email)
      if (!matched?.id) throw new Error(`Account ${account.email} already exists but could not be loaded`)
      await updateUser(matched.id, account)
      console.log(`UPDATE ${account.email}`)
      updated += 1
      continue
    }
    console.log(`CREATE ${account.email}`)
    created += 1
  }

  console.log(`User provisioning complete: ${created} created, ${updated} updated through GoTrue.`)
}

main().catch((error) => {
  console.error(`User provisioning failed: ${error.message}`)
  process.exitCode = 1
})