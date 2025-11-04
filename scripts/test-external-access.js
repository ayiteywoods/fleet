#!/usr/bin/env node
/*
  Usage:
    TOKEN=ey... PASSWORD=your_pwd node scripts/test-external-access.js

  Optional:
    BASE=http://localhost:3000 node scripts/test-external-access.js
*/

const BASE = process.env.BASE || 'http://localhost:3000'
const TOKEN = process.env.TOKEN
const PASSWORD = process.env.PASSWORD

if (!TOKEN || !PASSWORD) {
  console.error('Missing TOKEN or PASSWORD env variables.')
  process.exit(1)
}

async function main() {
  const res = await fetch(`${BASE}/api/auth/check-tracking?debug=1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ password: PASSWORD })
  })
  const data = await res.json()
  console.log(JSON.stringify(data, null, 2))
  if (res.ok && data?.hasLiveTracking) {
    console.log('Live tracking access: TRUE (flag persisted if not already).')
    process.exit(0)
  } else {
    console.log('Live tracking access: FALSE')
    process.exit(2)
  }
}

main().catch((e) => {
  console.error('Request failed:', e?.message || e)
  process.exit(1)
})


