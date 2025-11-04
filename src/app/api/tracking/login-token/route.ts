import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('[login-token] ====== FETCHING TOKEN ======')
  try {
    const loginUrl = 'https://neragpstracking.com/Account/LogOn?ReturnUrl=/Config'
    
    const response = await fetch(loginUrl, { 
      method: 'GET',
      redirect: 'manual'
    } as any)
    
    console.log('[login-token] Response status:', response.status)
    const html = await response.text()
    console.log('[login-token] HTML length:', html.length)
    
    // Extract anti-forgery token with multiple patterns
    let antiForgeryToken: string | undefined
    const tokenPatterns = [
      /name=["']__RequestVerificationToken["']\s+type=["']hidden["']\s+value=["']([^"']+)["']/i,
      /name=["']__RequestVerificationToken["'][^>]*value=["']([^"']+)["']/i,
      /<input[^>]*name=["']__RequestVerificationToken["'][^>]*value=["']([^"']+)["']/i,
      /__RequestVerificationToken["'][^>]*value=["']([^"']+)["']/i,
      /value=["']([A-Za-z0-9+/=]{20,})["'][^>]*name=["']__RequestVerificationToken["']/i, // Reverse order
      /__RequestVerificationToken["'][^>]*value\s*=\s*["']([^"']+)["']/i
    ]
    
    for (const pattern of tokenPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        antiForgeryToken = match[1]
        console.log('[login-token] Found token with pattern:', pattern.toString().substring(0, 50))
        break
      }
    }
    
    // Try searching for the token in a different way - look for input tags
    if (!antiForgeryToken) {
      const inputMatches = html.matchAll(/<input[^>]*>/gi)
      for (const input of inputMatches) {
        if (input[0].includes('__RequestVerificationToken')) {
          const valueMatch = input[0].match(/value=["']([^"']+)["']/i)
          if (valueMatch && valueMatch[1]) {
            antiForgeryToken = valueMatch[1]
            console.log('[login-token] Found token in input tag')
            break
          }
        }
      }
    }
    
    if (antiForgeryToken) {
      console.log('[login-token] Token found:', antiForgeryToken.substring(0, 20) + '...')
      return NextResponse.json({ token: antiForgeryToken })
    }
    
    console.log('[login-token] Token not found in HTML')
    // Return a sample of the HTML to help debug
    const sample = html.substring(0, 1000).replace(/[\r\n]/g, ' ')
    console.log('[login-token] HTML sample:', sample)
    return NextResponse.json({ error: 'Token not found', htmlSample: sample.substring(0, 500) }, { status: 404 })
  } catch (e: any) {
    console.error('[login-token] Error:', e?.message, e?.stack)
    return NextResponse.json({ error: 'Failed to fetch token', details: e?.message }, { status: 500 })
  }
}

