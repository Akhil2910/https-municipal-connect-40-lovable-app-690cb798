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

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { ...headers, ...options.headers } })
  const text = await response.text()
  let body = null
  if (text) {
    try { body = JSON.parse(text) } catch { body = text }
  }
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed (${response.status}): ${typeof body === 'string' ? body : JSON.stringify(body)}`)
  }
  return body
}

async function listUsers() {
  const users = []
  for (let page = 1; ; page += 1) {
    const result = await request(`/auth/v1/admin/users?page=${page}&per_page=1000`)
    const batch = Array.isArray(result) ? result : (result?.users ?? [])
    users.push(...batch)
    if (batch.length < 1000) return users
  }
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

  const existing = new Set((await listUsers()).map((user) => user.email?.toLowerCase()).filter(Boolean))
  let created = 0
  let skipped = 0

  for (const account of desired) {
    if (existing.has(account.email)) {
      console.log(`SKIP   ${account.email}`)
      skipped += 1
      continue
    }
    await request('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: account.email,
        password: account.password,
        email_confirm: true,
        app_metadata: { provider: 'email', providers: ['email'] },
      }),
    })
    console.log(`CREATE ${account.email}`)
    existing.add(account.email)
    created += 1
  }

  console.log(`User provisioning complete: ${created} created, ${skipped} already existed.`)
}

main().catch((error) => {
  console.error(`User provisioning failed: ${error.message}`)
  process.exitCode = 1
})