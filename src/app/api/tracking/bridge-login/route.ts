import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { setUserCookies } from '@/lib/proxySession'

// GET handler to fetch anti-forgery token from external login page
export async function GET(request: NextRequest) {
  console.log('[bridge-login] ====== FETCHING TOKEN (GET) ======')
  try {
    const loginUrl = 'https://neragpstracking.com/Account/LogOn?ReturnUrl=/Config'
    
    const response = await fetch(loginUrl, { 
      method: 'GET',
      redirect: 'manual'
    } as any)
    
    console.log('[bridge-login] Token fetch response status:', response.status)
    const html = await response.text()
    console.log('[bridge-login] HTML length:', html.length)
    
    // Extract anti-forgery token with more comprehensive patterns
    let antiForgeryToken: string | undefined
    
    // First, try to find the token input tag with multiple patterns
    const tokenPatterns = [
      // Standard format: <input name="__RequestVerificationToken" type="hidden" value="..." />
      /<input[^>]*name\s*=\s*["']__RequestVerificationToken["'][^>]*value\s*=\s*["']([^"']+)["'][^>]*>/i,
      // Reverse order: value first, then name
      /<input[^>]*value\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']__RequestVerificationToken["'][^>]*>/i,
      // With different quote styles
      /<input[^>]*name=["']__RequestVerificationToken["'][^>]*value=["']([^"']+)["']/i,
      /<input[^>]*name=['"]__RequestVerificationToken['"'][^>]*value=['"]([^'"]+)['"]/i,
      // With whitespace variations
      /name\s*=\s*["']__RequestVerificationToken["'][^>]*value\s*=\s*["']([^"']+)["']/i,
      // Very loose pattern
      /__RequestVerificationToken[^>]*value\s*=\s*["']([^"']{20,})["']/i,
    ]
    
    for (let i = 0; i < tokenPatterns.length; i++) {
      const pattern = tokenPatterns[i]
      const match = html.match(pattern)
      if (match && match[1] && match[1].length > 10) {
        antiForgeryToken = match[1]
        console.log(`[bridge-login] Token found with pattern ${i + 1}`)
        break
      }
    }
    
    // Also try searching all input tags line by line
    if (!antiForgeryToken) {
      console.log('[bridge-login] Trying input tag search...')
      const inputMatches = Array.from(html.matchAll(/<input[^>]*>/gi))
      console.log(`[bridge-login] Found ${inputMatches.length} input tags`)
      
      // Log first 10 input tags for debugging
      console.log('[bridge-login] First 10 input tags:')
      inputMatches.slice(0, 10).forEach((input, idx) => {
        console.log(`[bridge-login] Input ${idx + 1}:`, input[0].substring(0, 150))
      })
      
      for (const input of inputMatches) {
        const inputTag = input[0]
        
        // Check for various token field name variations
        const tokenVariations = [
          '__RequestVerificationToken',
          'RequestVerificationToken',
          '__RequestVerification',
          'RequestVerification',
          '__AntiForgeryToken',
          'AntiForgeryToken',
          'VerificationToken',
          '__CSRFToken',
          'CSRFToken'
        ]
        
        const hasTokenName = tokenVariations.some(variation => 
          inputTag.includes(variation)
        )
        
        if (hasTokenName) {
          console.log('[bridge-login] Found matching input tag:', inputTag)
          
          // Try multiple value extraction patterns
          const valuePatterns = [
            /value\s*=\s*["']([^"']+)["']/i,
            /value\s*=\s*["']([^"']+)["']/i,
            /value=["']([^"']+)["']/i,
            /value=['"]([^'"]+)['"]/i,
            /value\s*=\s*([A-Za-z0-9+/=]{20,})/i, // Without quotes
          ]
          
          for (const valuePattern of valuePatterns) {
            const valueMatch = inputTag.match(valuePattern)
            if (valueMatch && valueMatch[1] && valueMatch[1].length > 10) {
              antiForgeryToken = valueMatch[1]
              console.log('[bridge-login] Token extracted from input tag, length:', antiForgeryToken.length)
              break
            }
          }
          
          if (antiForgeryToken) break
        }
      }
    }
    
    // Last resort: search for any token-like value near the token name
    if (!antiForgeryToken) {
      console.log('[bridge-login] Trying proximity search...')
      const tokenNameIndex = html.indexOf('__RequestVerificationToken')
      if (tokenNameIndex > 0) {
        const snippet = html.substring(Math.max(0, tokenNameIndex - 500), Math.min(html.length, tokenNameIndex + 1000))
        console.log('[bridge-login] Snippet around token name:', snippet.substring(0, 500))
        
        // Look for value= in the snippet
        const valueMatch = snippet.match(/value\s*=\s*["']([A-Za-z0-9+/=]{20,})["']/i)
        if (valueMatch && valueMatch[1]) {
          antiForgeryToken = valueMatch[1]
          console.log('[bridge-login] Token found via proximity search')
        }
      }
    }
    
    if (antiForgeryToken) {
      console.log('[bridge-login] Token found, length:', antiForgeryToken.length)
      return NextResponse.json({ token: antiForgeryToken })
    }
    
    console.log('[bridge-login] Token not found - logging HTML sample')
    // Log a sample to help debug
    const sampleStart = html.indexOf('<form')
    const sample = sampleStart > 0 
      ? html.substring(sampleStart, Math.min(html.length, sampleStart + 2000))
      : html.substring(0, 2000)
    console.log('[bridge-login] HTML sample (around form or first 2000 chars):', sample.replace(/\s+/g, ' ').substring(0, 1000))
    
    return NextResponse.json({ error: 'Token not found', htmlSample: sample.substring(0, 500) }, { status: 404 })
  } catch (e: any) {
    console.error('[bridge-login] GET error:', e?.message)
    return NextResponse.json({ error: 'Failed to fetch token', details: e?.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('[bridge-login] ====== STARTING BRIDGE LOGIN ======')
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    console.log('[bridge-login] Token present:', !!token)
    if (!token) {
      console.log('[bridge-login] No token, returning 401')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const user = verifyToken(token)
    console.log('[bridge-login] User verified:', user ? user.id : 'none', user?.name)
    if (!user) {
      console.log('[bridge-login] Invalid token, returning 401')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const requestBody = await request.json()
    const { password } = requestBody
    console.log('[bridge-login] Password present:', !!password)
    if (!password) {
      console.log('[bridge-login] No password, returning 400')
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    const base = 'https://neragpstracking.com'
    const loginUrl = base + '/Account/LogOn?ReturnUrl=/Config'

    // Helper to extract all cookies from headers (handles multiple Set-Cookie headers)
    // Note: Node.js fetch may not expose Set-Cookie headers by default for security
    const extractCookies = (headers: Headers, rawResponse?: any): string => {
      const cookies: string[] = []
      
      // Try all possible ways to get Set-Cookie headers
      // Method 1: headers.forEach
      headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
          const cookieValue = value.split(';')[0].trim()
          if (cookieValue) cookies.push(cookieValue)
        }
      })
      
      // Method 2: Direct get
      const setCookieRaw = headers.get('set-cookie') || headers.get('Set-Cookie') || ''
      if (setCookieRaw) {
        setCookieRaw.split(/[,\n]/).forEach(cookie => {
          const trimmed = cookie.split(';')[0].trim()
          if (trimmed && !cookies.includes(trimmed)) cookies.push(trimmed)
        })
      }
      
      // Method 3: Check raw response headers (if available)
      if (rawResponse && rawResponse.headers) {
        const rawHeaders = rawResponse.headers
        if (rawHeaders['set-cookie']) {
          const setCookieArr = Array.isArray(rawHeaders['set-cookie']) 
            ? rawHeaders['set-cookie'] 
            : [rawHeaders['set-cookie']]
          setCookieArr.forEach((cookie: string) => {
            const trimmed = cookie.split(';')[0].trim()
            if (trimmed && !cookies.includes(trimmed)) cookies.push(trimmed)
          })
        }
      }
      
      // Log what we found
      if (cookies.length > 0) {
        console.log('[bridge-login] Extracted cookies:', cookies)
      }
      
      return cookies.join('; ')
    }
    
    // Debug helper to log all headers
    const logHeaders = (headers: Headers, label: string) => {
      const headerObj: Record<string, string> = {}
      headers.forEach((value, key) => {
        headerObj[key] = value
      })
      console.log(`[bridge-login] ${label} headers:`, JSON.stringify(headerObj, null, 2))
    }

    // Step 1: Fetch login page to get initial cookies and anti-forgery token
    // Use node-fetch if available for better cookie handling
    let fetchFn = fetch
    try {
      // Try to use node-fetch if available (better cookie support)
      const nodeFetch = await import('node-fetch')
      fetchFn = nodeFetch.default as any
    } catch {
      // Fall back to native fetch
    }
    
    const pre = await fetchFn(loginUrl, { method: 'GET', redirect: 'manual' } as any)
    logHeaders(pre.headers, 'Initial GET')
    
    // Try to access raw headers if available (node-fetch exposes this)
    if ((pre as any).headers?.raw) {
      const rawHeaders = (pre as any).headers.raw()
      console.log('[bridge-login] Raw headers (node-fetch):', JSON.stringify(rawHeaders, null, 2))
      if (rawHeaders['set-cookie']) {
        console.log('[bridge-login] Found Set-Cookie in raw headers:', rawHeaders['set-cookie'])
      }
    }
    
    const initialCookie = extractCookies(pre.headers, pre)
    const preHtml = await (async () => { try { return await pre.text() } catch { return '' } })()
    
    // Try multiple patterns to find anti-forgery token
    let antiForgeryToken: string | undefined
    const tokenPatterns = [
      /name=["']__RequestVerificationToken["']\s+type=["']hidden["']\s+value=["']([^"']+)["']/i,
      /name=["']__RequestVerificationToken["'][^>]*value=["']([^"']+)["']/i,
      /<input[^>]*name=["']__RequestVerificationToken["'][^>]*value=["']([^"']+)["']/i,
      /__RequestVerificationToken["'][^>]*value=["']([^"']+)["']/i
    ]
    
    for (const pattern of tokenPatterns) {
      const match = preHtml.match(pattern)
      if (match && match[1]) {
        antiForgeryToken = match[1]
        break
      }
    }
    
    // Also try to find it in a script tag or meta tag
    if (!antiForgeryToken) {
      const scriptMatch = preHtml.match(/__RequestVerificationToken["']?\s*[:=]\s*["']([^"']+)["']/i)
      if (scriptMatch && scriptMatch[1]) {
        antiForgeryToken = scriptMatch[1]
      }
    }
    
    console.log('[bridge-login] Initial cookies:', initialCookie || 'none', 'Anti-forgery token:', antiForgeryToken ? `found (${antiForgeryToken.substring(0, 20)}...)` : 'none')
    console.log('[bridge-login] HTML length:', preHtml.length, 'chars')

    // Step 2: POST credentials
    const formBody = new URLSearchParams()
    // Be strict: only send the most likely expected names
    formBody.set('UserName', user.name)
    formBody.set('Password', password)
    formBody.set('RememberMe', 'false')
    formBody.set('ReturnUrl', '/Config')
    if (antiForgeryToken) formBody.set('__RequestVerificationToken', antiForgeryToken)

    // Send more browser-like headers
    const res = await fetchFn(loginUrl, {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': base,
        'Referer': loginUrl,
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...(initialCookie ? { Cookie: initialCookie } : {})
      },
      body: formBody.toString()
    } as any)
    
    logHeaders(res.headers, 'POST response')
    
    // Check raw headers from node-fetch
    if ((res as any).headers?.raw) {
      const rawHeaders = (res as any).headers.raw()
      console.log('[bridge-login] POST raw headers (node-fetch):', JSON.stringify(rawHeaders, null, 2))
      if (rawHeaders['set-cookie']) {
        console.log('[bridge-login] Found Set-Cookie in POST raw headers:', rawHeaders['set-cookie'])
      }
    }

    // Extract all cookies from POST response
    const postCookies = extractCookies(res.headers, res)
    console.log('[bridge-login] POST cookies extracted:', postCookies || 'none')
    
    // Check POST response body for error messages or clues
    const postBody = await (async () => { try { return await res.text() } catch { return '' } })()
    if (postBody) {
      const hasError = /error|invalid|incorrect|failed/i.test(postBody)
      const hasSuccess = /success|welcome|dashboard/i.test(postBody)
      console.log('[bridge-login] POST response body analysis:', {
        length: postBody.length,
        hasError,
        hasSuccess,
        preview: postBody.substring(0, 200)
      })
    }
    
    // Combine initial and POST cookies, removing duplicates
    const allCookies = [initialCookie, postCookies].filter(Boolean)
    const cookieMap = new Map<string, string>()
    
    // Parse all cookies into a map to handle duplicates
    allCookies.forEach(cookieStr => {
      cookieStr.split(';').forEach(cookie => {
        const trimmed = cookie.trim()
        if (trimmed) {
          const [name, ...valueParts] = trimmed.split('=')
          if (name && valueParts.length > 0) {
            cookieMap.set(name.trim(), valueParts.join('='))
          }
        }
      })
    })
    
    // Rebuild cookie string
    let combinedCookie = Array.from(cookieMap.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ')
    
    console.log('[bridge-login] Combined cookies:', combinedCookie ? `${cookieMap.size} cookies` : 'none', Object.fromEntries(cookieMap))

    // Check the POST response status and location first
    const postStatus = res.status
    const postLocation = res.headers.get('location') || ''
    
    // If POST returns 302 redirect
    if (postStatus === 302) {
      // If redirecting to login page, login failed
      if (postLocation.includes('/Account/LogOn')) {
        console.log('[bridge-login] POST redirected to login page')
        return NextResponse.json({ ok: false, reason: 'post_redirect_to_login' }, { status: 200 })
      }
      
      // If redirecting to /Config, follow the redirect to capture any cookies set on redirect
      if (postLocation.includes('/Config')) {
        const redirectUrl = postLocation.startsWith('http') ? postLocation : base + postLocation
        console.log('[bridge-login] Following redirect to:', redirectUrl)
        
        // Follow redirect manually to capture cookies from redirect response
        const redirectRes = await fetchFn(redirectUrl, {
          method: 'GET',
          headers: combinedCookie ? { Cookie: combinedCookie } : undefined,
          redirect: 'manual'
        } as any)
        
        logHeaders(redirectRes.headers, 'Redirect response')
        
        // Check raw headers from node-fetch
        if ((redirectRes as any).headers?.raw) {
          const rawHeaders = (redirectRes as any).headers.raw()
          console.log('[bridge-login] Redirect raw headers (node-fetch):', JSON.stringify(rawHeaders, null, 2))
          if (rawHeaders['set-cookie']) {
            console.log('[bridge-login] Found Set-Cookie in redirect raw headers:', rawHeaders['set-cookie'])
          }
        }
        
        const redirectCookies = extractCookies(redirectRes.headers, redirectRes)
        console.log('[bridge-login] Redirect cookies extracted:', redirectCookies || 'none')
        
        // Merge redirect cookies with existing cookies
        if (redirectCookies) {
          redirectCookies.split(';').forEach(c => {
            const [name, ...valueParts] = c.trim().split('=')
            if (name && valueParts.length > 0) {
              cookieMap.set(name.trim(), valueParts.join('='))
            }
          })
          combinedCookie = Array.from(cookieMap.entries())
            .map(([name, value]) => `${name}=${value}`)
            .join('; ')
          console.log('[bridge-login] After redirect, cookies:', combinedCookie ? `${cookieMap.size} cookies` : 'none')
        }
        
        const target = base + '/Config'
        const probe = await fetchFn(target, {
          method: 'GET',
          headers: combinedCookie ? { Cookie: combinedCookie } : undefined,
          redirect: 'manual'
        } as any)
        const probeStatus = probe.status
        const probeLocation = probe.headers.get('location') || ''
        const html = await (async () => { try { return await probe.text() } catch { return '' } })()
        
        // Check for login page indicators
        const showsLogin = /Forgot your password\s*\?/i.test(html) || 
                          /Log\s*On/i.test(html) ||
                          /Account\/LogOn/i.test(html) ||
                          probeLocation.includes('/Account/LogOn')

        // If probe redirects to login, login failed
        if (probeLocation.includes('/Account/LogOn')) {
          console.log('[bridge-login] Probe redirected to login page')
          return NextResponse.json({ ok: false, reason: 'probe_redirect_to_login' }, { status: 200 })
        }

        // If we get here and it's not a login page, consider it successful
        if (!showsLogin && (probeStatus === 200 || (probeStatus >= 300 && probeStatus < 400 && !probeLocation.includes('/Account/LogOn')))) {
          // Also capture any additional cookies from probe response
          const probeCookies = extractCookies(probe.headers)
          let finalCookies = combinedCookie
          if (probeCookies) {
            const probeCookieMap = new Map<string, string>()
            combinedCookie.split(';').forEach(c => {
              const [name, ...valueParts] = c.split('=')
              if (name && valueParts.length > 0) {
                probeCookieMap.set(name.trim(), valueParts.join('='))
              }
            })
            probeCookies.split(';').forEach(c => {
              const [name, ...valueParts] = c.trim().split('=')
              if (name && valueParts.length > 0) {
                probeCookieMap.set(name.trim(), valueParts.join('='))
              }
            })
            finalCookies = Array.from(probeCookieMap.entries())
              .map(([name, value]) => `${name}=${value}`)
              .join('; ')
          }
          
          console.log('[bridge-login] Login successful, storing cookies')
          setUserCookies(user.id, finalCookies)
          // Set a lightweight httpOnly cookie so browser navigation to /tracking/bridge works
          const cookie = `nf_bridge_uid=${encodeURIComponent(user.id)}; Path=/tracking/bridge; HttpOnly; SameSite=Lax; Max-Age=3600`
          return new NextResponse(JSON.stringify({ ok: true }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': cookie,
            },
          })
        } else {
          console.log('[bridge-login] Probe shows login page or failed:', { showsLogin, probeStatus, probeLocation })
        }
      }
    }

    // If POST response is not a redirect, check the response body
    if (postStatus === 200) {
      const postHtml = await (async () => { try { return await res.text() } catch { return '' } })()
      const postShowsLogin = /Forgot your password\s*\?/i.test(postHtml) || 
                            /Log\s*On/i.test(postHtml) ||
                            /Account\/LogOn/i.test(postHtml)
      
      if (postShowsLogin) {
        console.log('[bridge-login] POST response contains login page')
        return NextResponse.json({ ok: false, reason: 'post_response_login_page' }, { status: 200 })
      }
      
      // If 200 and not login page, might be success - verify with probe
      const target = base + '/Config'
      const probe = await fetchFn(target, {
        method: 'GET',
        headers: combinedCookie ? { Cookie: combinedCookie } : undefined,
        redirect: 'manual'
      } as any)
      const probeStatus = probe.status
      const probeLocation = probe.headers.get('location') || ''
      const html = await (async () => { try { return await probe.text() } catch { return '' } })()
      
      const showsLogin = /Forgot your password\s*\?/i.test(html) || 
                        /Log\s*On/i.test(html) ||
                        probeLocation.includes('/Account/LogOn')
      
      if (!showsLogin && (probeStatus === 200 || (probeStatus >= 300 && probeStatus < 400 && !probeLocation.includes('/Account/LogOn')))) {
        // Capture any additional cookies from probe
        const probeCookies = extractCookies(probe.headers)
        let finalCookies = combinedCookie
        if (probeCookies) {
          const probeCookieMap = new Map<string, string>()
          combinedCookie.split(';').forEach(c => {
            const [name, ...valueParts] = c.split('=')
            if (name && valueParts.length > 0) {
              probeCookieMap.set(name.trim(), valueParts.join('='))
            }
          })
          probeCookies.split(';').forEach(c => {
            const [name, ...valueParts] = c.trim().split('=')
            if (name && valueParts.length > 0) {
              probeCookieMap.set(name.trim(), valueParts.join('='))
            }
          })
          finalCookies = Array.from(probeCookieMap.entries())
            .map(([name, value]) => `${name}=${value}`)
            .join('; ')
        }
        
        console.log('[bridge-login] Login successful (200 response), storing cookies')
        setUserCookies(user.id, finalCookies)
        const cookie = `nf_bridge_uid=${encodeURIComponent(user.id)}; Path=/tracking/bridge; HttpOnly; SameSite=Lax; Max-Age=3600`
        return new NextResponse(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookie,
          },
        })
      } else {
        console.log('[bridge-login] Probe shows login page or failed:', { showsLogin, probeStatus, probeLocation })
      }
    }

    console.log('[bridge-login] ====== FAILED: unknown reason ======', { postStatus, postLocation })
    return NextResponse.json({ ok: false, reason: 'unknown', status: postStatus, location: postLocation }, { status: 200 })
  } catch (e: any) {
    console.error('[bridge-login] ====== ERROR ======', e?.message, e?.stack)
    return NextResponse.json({ error: 'Internal error', details: e?.message }, { status: 500 })
  }
}


