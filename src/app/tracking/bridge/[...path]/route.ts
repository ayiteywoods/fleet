import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getUserCookies } from '@/lib/proxySession'

const BASE = 'https://neragpstracking.com'

function rewriteHtml(html: string, baseUrl: string): string {
  const proxyBase = baseUrl.replace(/\/tracking\/bridge.*$/, '/tracking/bridge')
  const externalDomain = 'https://neragpstracking.com'
  
  // Rewrite relative links to go through /tracking/bridge
  let rewritten = html
    .replace(/href=\"\/(?!\/)/g, 'href="/tracking/bridge/')
    .replace(/src=\"\/(?!\/)/g, 'src="/tracking/bridge/')
    .replace(/url\(["']?\/(?!\/)/g, 'url("/tracking/bridge/')
  
  // Rewrite absolute URLs to the external domain to go through proxy
  rewritten = rewritten.replace(
    new RegExp(externalDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
    proxyBase
  )
  
  // Rewrite href attributes with absolute URLs
  rewritten = rewritten.replace(
    /href=["'](https?:\/\/neragpstracking\.com[^"']*)["']/gi,
    (match, url) => {
      const path = url.replace(externalDomain, '')
      return `href="${proxyBase}${path}"`
    }
  )
  
  // Rewrite src attributes with absolute URLs
  rewritten = rewritten.replace(
    /src=["'](https?:\/\/neragpstracking\.com[^"']*)["']/gi,
    (match, url) => {
      const path = url.replace(externalDomain, '')
      return `src="${proxyBase}${path}"`
    }
  )
  
  // Prevent JavaScript redirects that might navigate away
  rewritten = rewritten.replace(
    /window\.location\s*[=.]\s*['"]([^'"]+)['"]/gi,
    (match, url) => {
      if (url.includes('neragpstracking.com')) {
        const path = url.replace(externalDomain, '').replace(/^https?:\/\//, '').replace(/^[^\/]+/, '')
        return match.replace(url, `${proxyBase}${path}`)
      }
      return match
    }
  )
  
  // Prevent meta refresh redirects
  rewritten = rewritten.replace(
    /<meta[^>]*http-equiv=["']refresh["'][^>]*>/gi,
    (match) => {
      return match.replace(/url=([^"'>\s]+)/gi, (urlMatch, url) => {
        if (url.includes('neragpstracking.com')) {
          const path = url.replace(externalDomain, '').replace(/^https?:\/\//, '').replace(/^[^\/]+/, '')
          return `url=${proxyBase}${path}`
        }
        return urlMatch
      })
    }
  )
  
  return rewritten
}

export async function GET(request: NextRequest, { params }: { params: { path?: string[] } }) {
  try {
    // Prefer cookie-based bridge session for browser navigation
    const bridgeUid = request.cookies.get('nf_bridge_uid')?.value
    let userId: string | undefined = bridgeUid

    // Fallback to Authorization for programmatic access
    if (!userId) {
      const token = request.headers.get('authorization')?.replace('Bearer ', '')
      if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      const user = verifyToken(token)
      if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      userId = user.id
    }

    const cookie = userId ? getUserCookies(userId) : undefined
    if (!cookie) {
      console.log('[bridge-proxy] No cookies found for user:', userId)
      return NextResponse.json({ error: 'No bridge session. Call /api/tracking/bridge-login first.' }, { status: 401 })
    }

    let rel = '/' + (params.path?.join('/') || '')
    if (rel === '/' || rel === '') rel = '/Config'
    const url = new URL(rel, BASE).toString()

    console.log('[bridge-proxy] Fetching:', url, 'with cookies:', cookie ? 'present' : 'none')
    const res = await fetch(url, { headers: { Cookie: cookie }, redirect: 'manual' } as any)
    console.log('[bridge-proxy] Response status:', res.status, 'location:', res.headers.get('location'))
    const contentType = res.headers.get('content-type') || ''
    const location = res.headers.get('location')

    if (location && res.status >= 300 && res.status < 400) {
      // If external app wants to send us to its login page, bounce back to /tracking to re-init login
      if (location.includes('/Account/LogOn')) {
        return NextResponse.redirect(new URL('/tracking?auth=needed', request.url))
      }
      const proxied = '/tracking/bridge' + (location.startsWith('/') ? location : '/' + location)
      return NextResponse.redirect(new URL(proxied, request.url))
    }

    const body = await res.text()
    
    // Check if the response is a login page (external app redirecting to login)
    if (contentType.includes('text/html')) {
      // More comprehensive login page detection
      const isLoginPage = /Log\s*On|Log\s*In|Forgot your password/i.test(body) || 
                         res.url?.includes('/Account/LogOn') ||
                         /Account\/LogOn/i.test(body) ||
                         /name=["']UserName["']|name=["']Password["']/i.test(body) && /Log\s*On/i.test(body)
      
      if (isLoginPage && (res.status === 200 || res.status === 302)) {
        // External app is showing login page - redirect back to our tracking page
        console.log('[bridge-proxy] Detected login page, redirecting to /tracking')
        return NextResponse.redirect(new URL('/tracking?auth=needed', request.url))
      }
      const rewritten = rewriteHtml(body, request.url)
      return new NextResponse(rewritten, { 
        status: res.status, 
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
          // Prevent navigation away from our domain
          'Content-Security-Policy': "frame-ancestors 'self'; form-action 'self'"
        } 
      })
    }
    return new NextResponse(body, { status: res.status, headers: { 'Content-Type': contentType || 'text/plain' } })
  } catch (e) {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 })
  }
}


