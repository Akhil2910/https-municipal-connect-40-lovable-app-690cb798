#!/usr/bin/env node
import { execFileSync } from 'node:child_process'

for (const name of ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY']) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`)
}

const baseUrl = process.env.SUPABASE_URL.replace(/\/$/, '')
const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY

function sql(query) {
  return execFileSync(
    'docker',
    ['exec', 'portal-db', 'psql', '-U', 'postgres', '-d', 'postgres', '-At', '-c', query],
    { encoding: 'utf8' },
  ).trim()
}

async function login(email, password) {
  const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: publicKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.access_token) {
    throw new Error(`Login failed for ${email} (${response.status}): ${body.msg ?? body.error_description ?? body.error ?? 'unknown error'}`)
  }
}

function check(label, condition, details) {
  if (!condition) throw new Error(`${label}: ${details}`)
  console.log(`✓ ${label}`)
}

async function main() {
  const counts = sql(`
    SELECT
      (SELECT count(*) FROM public.ulbs),
      (SELECT count(*) FROM auth.users WHERE lower(email) = 'superadmin@portal.local'),
      (SELECT count(*) FROM auth.users au JOIN public.ulbs u ON lower(au.email) = lower(replace(u.slug, '-', '')) || 'admin@portal.local'),
      (SELECT count(*) FROM public.user_roles r JOIN auth.users u ON u.id = r.user_id WHERE r.role = 'super_admin' AND lower(u.email) = 'superadmin@portal.local'),
      (SELECT count(*) FROM public.user_roles r JOIN auth.users au ON au.id = r.user_id JOIN public.ulbs u ON lower(au.email) = lower(replace(u.slug, '-', '')) || 'admin@portal.local' WHERE r.role = 'admin'),
      (SELECT count(*) FROM public.ulb_admins a JOIN auth.users au ON au.id = a.user_id JOIN public.ulbs u ON u.id = a.ulb_id AND lower(au.email) = lower(replace(u.slug, '-', '')) || 'admin@portal.local'),
      (SELECT count(*) FROM public.ulb_admins a LEFT JOIN auth.users au ON au.id = a.user_id WHERE au.id IS NULL),
      (SELECT count(*) FROM public.user_roles r LEFT JOIN auth.users au ON au.id = r.user_id WHERE au.id IS NULL),
      (SELECT count(*) FROM auth.users WHERE confirmation_token IS NULL OR recovery_token IS NULL OR email_change_token_current IS NULL OR email_change_token_new IS NULL OR email_change IS NULL OR phone_change_token IS NULL OR phone_change IS NULL OR reauthentication_token IS NULL);
  `).split('|').map(Number)
  const [ulbs, superUsers, municipalUsers, superRoles, adminRoles, mappings, orphanMappings, orphanRoles, malformedUsers] = counts

  check('Super Admin exists', superUsers === 1, `expected 1, found ${superUsers}`)
  check('Municipality Admins exist', municipalUsers === ulbs, `expected ${ulbs}, found ${municipalUsers}`)
  check('Super Admin role exists', superRoles === 1, `expected 1, found ${superRoles}`)
  check('Municipality Admin roles exist', adminRoles === ulbs, `expected ${ulbs}, found ${adminRoles}`)
  check('ULB mappings exist', mappings === ulbs, `expected ${ulbs}, found ${mappings}`)
  check('No orphan ULB mappings exist', orphanMappings === 0, `found ${orphanMappings}`)
  check('No orphan roles exist', orphanRoles === 0, `found ${orphanRoles}`)
  check('No malformed auth users exist', malformedUsers === 0, `found ${malformedUsers}`)

  await login('superadmin@portal.local', 'superadmin@321')
  console.log('✓ Super Admin login succeeds')
  const allAdminLogins = sql("SELECT lower(replace(slug, '-', '')) FROM public.ulbs ORDER BY slug").split('\n').filter(Boolean)
  for (const slug of allAdminLogins) await login(`${slug}admin@portal.local`, `${slug}@123`)
  console.log(`✓ All ${allAdminLogins.length} municipality logins succeed`)
  console.log('Deployment verification passed.')
}

main().catch((error) => {
  console.error(`Deployment verification failed: ${error.message}`)
  process.exitCode = 1
})