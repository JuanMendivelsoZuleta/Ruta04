import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-night">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
