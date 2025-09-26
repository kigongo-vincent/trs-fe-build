import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Confetti } from "@/components/confetti"
import { Toaster } from "sonner"
import "@fontsource/poppins/400.css"
import "@fontsource/poppins/500.css"
import "@fontsource/poppins/600.css"
import "@fontsource/poppins/700.css"

export const metadata = {
  title: "Task Reporting System (TRS)",
  description: "Comprehensive task management and time tracking system",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light" disableTransitionOnChange>
          <Confetti />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
