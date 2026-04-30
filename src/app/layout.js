import './globals.css'
import { Outfit } from 'next/font/google'
import AuthProvider from '@/components/AuthProvider'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata = {
  title: 'Ethara Task Manager',
  description: 'Manage projects, assign tasks, and track progress securely.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
