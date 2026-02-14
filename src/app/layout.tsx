import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Unity Quest - Learn Unity, Level Up',
  description: 'ADHD-friendly Unity learning tracker with progress visualization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-900 text-white antialiased">
        {children}
      </body>
    </html>
  )
}
