import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Confetti } from "@/components/confetti"
import { Toaster } from "sonner"
import { Mona_Sans as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

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
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Confetti />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
