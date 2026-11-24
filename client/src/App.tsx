import { Route, Routes } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { EventsPage } from '@/pages/EventsPage'
import { Home } from '@/pages/Home'
import { LibraryPage } from '@/pages/LibraryPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OrderDetailPage } from '@/pages/OrderDetailPage'
import { PhotographerPage } from '@/pages/PhotographerPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="orders/:orderNumber" element={<OrderDetailPage />} />
        <Route path="photographer" element={<PhotographerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
