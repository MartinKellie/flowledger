import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { VersionDisplay } from '@/components/version-display'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FlowLedger - n8n Workflow Security Tracker',
  description: 'A comprehensive project tracker for n8n workflows and API keys, providing security insights and risk analysis.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          {/* Global Footer with Version */}
          <footer className="relative border-t border-emerald-300 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 mt-auto overflow-hidden">
            {/* Sparkly Animation Background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute bottom-2 left-4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute bottom-6 right-8 w-1 h-1 bg-white rounded-full animate-ping"></div>
              <div className="absolute bottom-4 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
              <div className="absolute bottom-8 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse"></div>
              <div className="absolute bottom-3 right-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
              <div className="absolute bottom-7 left-1/3 w-1 h-1 bg-white rounded-full animate-bounce"></div>
              <div className="absolute bottom-5 right-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              <div className="absolute bottom-1 left-1/2 w-1 h-1 bg-white rounded-full animate-ping"></div>
              <div className="absolute bottom-9 right-1/5 w-2 h-2 bg-white rounded-full animate-bounce"></div>
            </div>
            
            <div className="container mx-auto px-4 py-4 relative z-10">
              <div className="flex justify-between items-center">
                <div className="text-sm text-white drop-shadow-lg">
                  © 2025 FlowLedger. All rights reserved.
                </div>
                <VersionDisplay variant="minimal" className="text-xs text-white/80 drop-shadow-lg" />
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
