/**
 * Best-effort check against the external tracking app.
 * Attempts a credential POST to the login endpoint and infers success
 * by observing a redirect to ReturnUrl or a 200 without error markers.
 */
export async function checkExternalAccess(username: string, password: string): Promise<boolean> {
  if (!username || !password) return false;

  try {
    const base = 'https://neragpstracking.com'
    const url = base + '/Account/LogOn?ReturnUrl=/';

    // 1) Preload login page to obtain initial cookies and potential anti-forgery token
    const pre = await fetch(url, { method: 'GET', redirect: 'manual' } as any)
    const preSetCookie = pre.headers.get('set-cookie') || ''
    const initialCookie = preSetCookie
      .split(',')
      .map(p => p.split(';')[0])
      .filter(Boolean)
      .join('; ')
    const preHtml = await (async () => { try { return await pre.text() } catch { return '' } })()
    // Attempt to extract ASP.NET anti-forgery token commonly named __RequestVerificationToken
    const tokenMatch = preHtml.match(/name=["']__RequestVerificationToken["']\s+type=["']hidden["']\s+value=["']([^"']+)["']/i)
    const antiForgeryToken = tokenMatch ? tokenMatch[1] : undefined

    // Try multiple common field name variants
    const attempts: Array<Record<string, string>> = [
      { Username: username, Password: password, RememberMe: 'false', ReturnUrl: '/' },
      { UserName: username, Password: password, RememberMe: 'false', ReturnUrl: '/' },
      { username: username, password: password, rememberMe: 'false', ReturnUrl: '/' },
      { Login: username, Password: password, RememberMe: 'false', ReturnUrl: '/' },
      { email: username, password: password, rememberMe: 'false', ReturnUrl: '/' },
      { Email: username, Password: password, RememberMe: 'false', ReturnUrl: '/' },
      { User: username, Password: password, RememberMe: 'false', ReturnUrl: '/' },
      { UserId: username, Password: password, RememberMe: 'false', ReturnUrl: '/' },
    ];

    for (const fields of attempts) {
      const body = new URLSearchParams();
      for (const [k, v] of Object.entries(fields)) body.set(k, v);
      if (antiForgeryToken) body.set('__RequestVerificationToken', antiForgeryToken)

      const response = await fetch(url, {
        method: 'POST',
        redirect: 'manual',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'NeraFleet/1.0 (+https://nerafleet-app)',
          ...(initialCookie ? { Cookie: initialCookie } : {})
        },
        body: body.toString(),
      } as any);

      const status = response.status;
      const location = response.headers.get('location') || '';
      const setCookie = response.headers.get('set-cookie') || '';
      const hasAnyCookie = !!setCookie;
      // Include provided external auth cookie name
      const looksAspNetCookie = /ASP\.NET_SessionId|\.ASPXAUTH|\.AspNet|n5yt02f04ot4dyw3gcfg4j1b/i.test(setCookie);

      // Safe debug logs (status and presence-only)
      console.log('[externalAuth] Attempt with fields:', Object.keys(fields).join(','), 'status:', status, 'location:', location, 'hasCookie:', hasAnyCookie, 'aspnetCookie:', looksAspNetCookie);

      // Check if the initial redirect location indicates success or failure
      // /Config is the dashboard - successful login redirects here
      // /Account/LogOn means redirect back to login (failed auth)
      const redirectsToLogin = /Account\/LogOn/i.test(location) || /LogOn/i.test(location) || /LogIn/i.test(location)
      const redirectsToDashboard = /\/Config/i.test(location) || location === '/'
      
      // If redirecting to login page, definitely failed
      if (redirectsToLogin) {
        console.log('[externalAuth] ❌ Redirects to login page - access denied')
        continue // Try next field combination
      }
      
      // If redirecting to dashboard (/Config) WITH cookies, this is a strong success indicator
      // But we should still probe to confirm (don't trust redirect alone without cookies)
      if (redirectsToDashboard && status === 302 && (hasAnyCookie || looksAspNetCookie)) {
        console.log('[externalAuth] ✅ Redirects to /Config with cookies - likely success, probing to confirm')
        // Don't return immediately - still probe to verify
      }

      // Build combined cookie header for follow-up probe
      // Include both initial cookies from preload and cookies from login response
      const allCookies = [initialCookie, setCookie]
        .filter(Boolean)
        .join(',')
      
      // Parse cookies properly - handle multiple Set-Cookie headers
      const cookieParts = allCookies
        .split(',')
        .map(p => {
          // Extract cookie name=value (before first semicolon)
          const cookieStr = p.trim().split(';')[0].trim()
          return cookieStr
        })
        .filter(Boolean)
        .filter((cookie, index, arr) => {
          // Remove duplicates (same cookie name)
          const cookieName = cookie.split('=')[0]
          return arr.findIndex(c => c.split('=')[0] === cookieName) === index
        })
      
      const combinedCookie = cookieParts.join('; ')
      
      console.log('[externalAuth] Cookie extraction:', {
        initialCookie,
        setCookie,
        combinedCookie: combinedCookie.substring(0, 200),
        cookieCount: cookieParts.length
      })

      // If we have either cookies or a redirect target, probe to confirm auth
      // Even if redirecting to /Config, we need to verify with a probe
      if ((status >= 300 && status < 400) || hasAnyCookie || looksAspNetCookie) {
        const targetPath = location || '/'
        console.log('[externalAuth] Probing:', base + targetPath, 'with cookies:', combinedCookie ? 'yes' : 'no')
        const probe = await fetch(base + targetPath, {
          method: 'GET',
          headers: combinedCookie ? { Cookie: combinedCookie } : undefined,
          redirect: 'manual'
        } as any)
        const probeText = await (async () => { try { return await probe.text() } catch { return '' } })()
        const probeLocation = probe.headers.get('location') || ''
        
        console.log('[externalAuth] Probe result:', {
          status: probe.status,
          location: probeLocation,
          textLength: probeText.length,
          hasLocation: !!probeLocation
        })
        
        // Check for redirect back to login page (strongest indicator of failed auth)
        const probeRedirectsToLogin = /Account\/LogOn/i.test(probeLocation) || /LogOn/i.test(probeLocation) || /LogIn/i.test(probeLocation)
        
        // Check for strong indicators of login page in HTML content
        const showsLogin = 
          /Forgot your password\s*\?/i.test(probeText) || 
          (/Account\/LogOn/i.test(probeText) && /ReturnUrl/i.test(probeText)) ||
          (/<form[^>]*>[\s\S]{0,500}Log\s*In[\s\S]{0,500}password/i.test(probeText) && /<form[^>]*>[\s\S]{0,500}password/i.test(probeText)) ||
          (/name=["'](?:UserName|Username|Email|Login)["']/i.test(probeText) && /name=["']Password["']/i.test(probeText) && /type=["']submit["'][^>]*value=["']Log\s*In/i.test(probeText))
        
        // Success conditions (in priority order):
        // 1. Redirect to /Config - this is the strongest success indicator
        //    The external app ONLY redirects to /Config after successful authentication
        //    Even if probe fails (redirects to login due to missing cookies), trust the redirect
        if (redirectsToDashboard && status === 302) {
          // If probe also succeeds, that's ideal
          if (!probeRedirectsToLogin && !showsLogin && (probe.status === 200 || (probe.status >= 300 && probe.status < 400 && !probeRedirectsToLogin))) {
            console.log('[externalAuth] ✅ External access confirmed (redirect to /Config, probe succeeds)')
            return true
          }
          // Even if probe redirects to login (due to missing cookies), trust the redirect to /Config
          // The external app wouldn't redirect there on failed login - the redirect itself proves success
          console.log('[externalAuth] ✅ External access confirmed (redirect to /Config - trusted as success, probe may fail without cookies)')
          return true
        }
        
        // 2. If probe redirects to login or shows login page AND initial redirect wasn't to /Config, failed
        // Only deny if we didn't get the /Config redirect (which indicates success)
        if (probeRedirectsToLogin || showsLogin) {
          console.log('[externalAuth] ❌ Probe shows login page or redirects to login - access denied', {
            probeRedirectsToLogin,
            showsLogin,
            probeStatus: probe.status,
            probeLocation: probeLocation.substring(0, 100),
            initialRedirect: location,
            hadConfigRedirect: redirectsToDashboard
          })
          continue // Try next field combination
        }
        
        // 3. If we have cookies AND probe succeeds, success
        if ((hasAnyCookie || looksAspNetCookie) && !showsLogin && !probeRedirectsToLogin) {
          if (probe.status === 200) {
            console.log('[externalAuth] ✅ External access confirmed via probe (200 status, cookies present, no login page)')
            return true
          } else if (probe.status >= 300 && probe.status < 400 && !probeRedirectsToLogin) {
            console.log('[externalAuth] ✅ External access confirmed via probe (redirect with cookies, not to login)')
            return true
          }
        }
        
        // If we get here, we couldn't confirm success
        console.log('[externalAuth] ❌ Could not confirm external access - access denied', {
          status: probe.status,
          location: location,
          redirectsToDashboard,
          showsLogin,
          probeRedirectsToLogin,
          probeLocation: probeLocation.substring(0, 100),
          hasCookie: hasAnyCookie || looksAspNetCookie
        })
        continue // Try next field combination
      }
    }

    // Other statuses consider as failure
    return false;
  } catch {
    return false;
  }
}

export async function checkExternalAccessDebug(username: string, password: string) {
  const base = 'https://neragpstracking.com'
  const url = base + '/Account/LogOn?ReturnUrl=/';
  const out: any[] = []
  const result = await (async () => {
    try {
      const pre = await fetch(url, { method: 'GET', redirect: 'manual' } as any)
      const preSetCookie = pre.headers.get('set-cookie') || ''
      const initialCookie = preSetCookie
        .split(',')
        .map(p => p.split(';')[0])
        .filter(Boolean)
        .join('; ')
      const preHtml = await (async () => { try { return await pre.text() } catch { return '' } })()
      const tokenMatch = preHtml.match(/name=["']__RequestVerificationToken["']\s+type=["']hidden["']\s+value=["']([^"']+)["']/i)
      const antiForgeryToken = tokenMatch ? tokenMatch[1] : undefined
      const attempts: Array<Record<string, string>> = [
        { Username: username, Password: password, RememberMe: 'false' },
        { UserName: username, Password: password, RememberMe: 'false' },
        { username: username, password: password, rememberMe: 'false' },
      ];
      for (const fields of attempts) {
        const body = new URLSearchParams();
        for (const [k, v] of Object.entries(fields)) body.set(k, v);
        if (antiForgeryToken) body.set('__RequestVerificationToken', antiForgeryToken)
        const response = await fetch(url, {
          method: 'POST',
          redirect: 'manual',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'NeraFleet/1.0 (+https://nerafleet-app)',
            ...(initialCookie ? { Cookie: initialCookie } : {})
          },
          body: body.toString(),
        } as any);
        const status = response.status;
        const location = response.headers.get('location') || '';
        const setCookie = response.headers.get('set-cookie') || '';
        const hasAnyCookie = !!setCookie;
        const looksAspNetCookie = /ASP\.NET_SessionId|\.ASPXAUTH|\.AspNet/i.test(setCookie);
        out.push({ status, location, hasAnyCookie, looksAspNetCookie })
        if (status >= 300 && status < 400 && hasAnyCookie) {
          return { ok: true, steps: out }
        }
        if (status === 200 && looksAspNetCookie) {
          return { ok: true, steps: out }
        }
      }
      return { ok: false, steps: out }
    } catch (e: any) {
      return { ok: false, error: e?.message, steps: out }
    }
  })()
  return result
}


