'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TrackingRedirectPage() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [manualPw, setManualPw] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const actionUrl = useMemo(() => 'https://neragpstracking.com/Account/LogOn?ReturnUrl=/Config', [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setIsLoading(true)
        console.log('[tracking-page] ====== STARTING ======', window.location.href)
        
        // If redirected back from proxy due to missing session
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search)
          console.log('[tracking-page] URL params:', Object.fromEntries(params))
          if (params.get('auth') === 'needed') {
            setIsLoading(false)
            setError('Live Tracking session expired. Please re-enter your password to continue.')
            return
          }
        }
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const lastPw = typeof window !== 'undefined' ? sessionStorage.getItem('lastLoginPassword') : null
        if (!token) {
          setIsLoading(false)
          setError('Not authenticated. Please log in again.')
          return
        }
        // Get username from token via /api/auth/me
        const me = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
        const externalUser = me?.user?.name || ''
        if (!externalUser) {
          setIsLoading(false)
          setError('Cannot resolve username for external login.')
          return
        }
        if (!lastPw) {
          setIsLoading(false)
          setError('Missing session password. Please enter password to proceed or log out and log in again.')
          setUsername(externalUser)
          return
        }
        if (cancelled) return
        setUsername(externalUser)
        setPassword(lastPw)
        
        // No anti-forgery token needed - external app form doesn't include it
        console.log('[tracking-page] Preparing form submission (no token required)...')
        
        // Small delay to ensure React state is updated, then submit form
        setTimeout(() => {
          if (cancelled) return
          if (formRef.current && lastPw && externalUser) {
            console.log('[tracking-page] Submitting form to external app...', {
              username: externalUser,
              hasPassword: !!lastPw
            })
            
            // Directly set form values to ensure they're present
            const form = formRef.current
            const userNameInput = form.querySelector('input[name="username"]') as HTMLInputElement
            const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement
            if (userNameInput) {
              userNameInput.value = externalUser
              console.log('[tracking-page] Set username:', userNameInput.value)
            }
            if (passwordInput) {
              passwordInput.value = lastPw
              console.log('[tracking-page] Set password:', '***')
            }
            
            // No anti-forgery token needed - external app doesn't use it based on form structure
            console.log('[tracking-page] Form ready (no token required)')
            
            // Log all form fields before submission
            const formData = new FormData(form)
            const formEntries: Record<string, string> = {}
            formData.forEach((value, key) => {
              formEntries[key] = key === 'password' ? '***' : value.toString()
            })
            console.log('[tracking-page] Form data to submit:', formEntries)
            
            // Submit form to open external app in new tab
            form.submit()
            
            // Redirect current tab to dashboard after a brief delay
            setTimeout(() => {
              router.push('/')
            }, 500)
          } else {
            console.error('[tracking-page] Form not ready:', { form: !!formRef.current, password: !!lastPw, user: !!externalUser })
            setIsLoading(false)
            setError('Unable to prepare login form. Please try again.')
          }
        }, 200)
      } catch (e: any) {
        if (cancelled) return
        console.error('[tracking-page] ====== ERROR ======', e?.message, e?.stack)
        setIsLoading(false)
        setError(`Unable to start external login: ${e?.message || 'Unknown error'}`)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <form ref={formRef} action={actionUrl} method="POST" target="_blank" className="hidden">
        {/* External app uses lowercase username and password */}
        <input type="hidden" name="username" defaultValue={username} />
        <input type="hidden" name="password" defaultValue={password} />
        <input type="hidden" name="action" value="log on" />
        <input type="hidden" name="LanguageOptionId" value="67" />
      </form>

      {isLoading || !error ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting you securely to Live Tracking…</p>
        </div>
      ) : (
        <div className="w-full max-w-md text-center">
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <div className="bg-white border rounded-md p-4 shadow-sm text-left">
            <label className="block text-sm text-gray-700 mb-1">Username</label>
            <input className="w-full border rounded px-3 py-2 mb-3" value={username} readOnly />
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              className="w-full border rounded px-3 py-2 mb-4"
              type="password"
              value={manualPw}
              onChange={(e) => setManualPw(e.target.value)}
              placeholder="Enter your password"
            />
            <button
              className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50"
              disabled={!manualPw}
              onClick={(e) => {
                e.preventDefault()
                setPassword(manualPw)
                setError('')
                setTimeout(() => { 
                  try { 
                    formRef.current?.submit()
                    // Redirect to dashboard after form submission
                    setTimeout(() => {
                      router.push('/')
                    }, 500)
                  } catch {} 
                }, 0)
              }}
            >
              Proceed to Live Tracking
            </button>
          </div>
          <p className="mt-3 text-gray-600 text-sm">Alternatively, log out and log in again to auto-fill your session, then retry the Live Tracking link.</p>
        </div>
      )}
    </div>
  )
}


