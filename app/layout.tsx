import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AuthProviderWrapper from '../components/AuthProviderWrapper'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KloudWatcher - Disaster Response Platform",
  description: "Cloud-based disaster response and relief coordination platform",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProviderWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProviderWrapper>
      </body>
    </html>
  )
}

import './globals.css'