import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientAuthProvider from '@/components/AuthProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AnalyticsProvider } from '@/contexts/AnalyticsContext'
import { KeyboardShortcutsProvider } from '@/contexts/KeyboardShortcutsContext'
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext'
import { SWRProvider } from '@/components/providers/SWRProvider'
import NavigationShell from '@/components/Navigation/NavigationShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChatNIL.io',
  description: 'A ChatGPT-style AI chat interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary showErrorDetails={process.env.NODE_ENV === 'development'}>
          <ClientAuthProvider>
            <SWRProvider>
              <UserPreferencesProvider>
                <AnalyticsProvider>
                  <KeyboardShortcutsProvider>
                    <NavigationShell>
                      {children}
                    </NavigationShell>
                  </KeyboardShortcutsProvider>
                </AnalyticsProvider>
              </UserPreferencesProvider>
            </SWRProvider>
          </ClientAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}