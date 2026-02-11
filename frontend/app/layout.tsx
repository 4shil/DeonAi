import './globals.css'

export const metadata = {
  title: 'DeonAI - AI Assistant',
  description: 'Modern AI chat interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
