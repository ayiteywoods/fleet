'use client'

import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

export default function Footer() {
  const { themeMode } = useTheme()
  const currentYear = new Date().getFullYear()

  return (
    <footer className={`mt-auto py-6 px-4 ${
      themeMode === 'dark' 
        ? 'bg-navy-800 border-t border-navy-700' 
        : 'bg-white border-t border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <div className={`text-sm ${
            themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            ©{currentYear} NeraFleet. All Rights Reserved.
          </div>

          {/* Links */}
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/support" className={`text-sm hover:text-brand-500 transition-colors ${
              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Support
            </Link>
            <Link href="/license" className={`text-sm hover:text-brand-500 transition-colors ${
              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              License
            </Link>
            <Link href="/terms" className={`text-sm hover:text-brand-500 transition-colors ${
              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
