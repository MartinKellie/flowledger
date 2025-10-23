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
          <footer className="border-t bg-white mt-auto">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  © 2025 FlowLedger. All rights reserved.
                </div>
                <VersionDisplay variant="minimal" className="text-xs text-gray-500" />
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
