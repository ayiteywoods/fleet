#!/usr/bin/env node
/**
 * End-to-end tracking check:
 *   node scripts/test-tracking-flow.js --id=<identifier> --password=<pwd> [--base=http://localhost:3000]
 * identifier can be email | phone | username (name)
 */

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  for (const a of args) {
    const [k, v] = a.split('=')
    if (k && v) out[k.replace(/^--/, '')] = v
  }
  return out
}

async function main() {
  const { id, password, base } = parseArgs()
  const BASE = base || 'http://localhost:3000'
  if (!id || !password) {
    console.error('Usage: node scripts/test-tracking-flow.js --id=<identifier> --password=<pwd> [--base=http://localhost:3000]')
    process.exit(1)
  }

  // 1) Login to get token
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: id, password })
  })
  const loginBody = await loginRes.json().catch(() => ({}))
  if (!loginRes.ok || !loginBody?.token) {
    console.error('Login failed:', loginBody)
    process.exit(2)
  }
  const token = loginBody.token
  console.log('Login OK as:', loginBody?.user?.name || id)

  // 2) Self-check /api/auth/me
  const meRes = await fetch(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const me = await meRes.json().catch(() => ({}))
  console.log('Before check hasLiveTracking =', me?.user?.hasLiveTracking)

  // 3) Run tracking check (debug)
  const chkRes = await fetch(`${BASE}/api/auth/check-tracking?debug=1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ password })
  })
  const chk = await chkRes.json().catch(() => ({}))
  console.log('Check result:', JSON.stringify(chk, null, 2))

  // 4) Fetch /api/auth/me again to see updated flag
  const me2Res = await fetch(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const me2 = await me2Res.json().catch(() => ({}))
  console.log('After check hasLiveTracking =', me2?.user?.hasLiveTracking)

  process.exit(chk?.hasLiveTracking ? 0 : 3)
}

main().catch((e) => {
  console.error('Fatal:', e?.message || e)
  process.exit(1)
})


