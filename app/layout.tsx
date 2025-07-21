import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Eli",
  description: "Eli was a man once",
  keywords: ["art", "philosophy", "music", "creativity", "blog", "life"],
  authors: [{ name: "Eli Cadieux" }],
  openGraph: {
    title: "Eli",
    description: "A journey ",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
