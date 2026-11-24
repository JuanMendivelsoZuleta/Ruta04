import { Route, Routes } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { PhotographerLayout } from '@/components/photographer/PhotographerLayout'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { EventsPage } from '@/pages/EventsPage'
import { Home } from '@/pages/Home'
import { LibraryPage } from '@/pages/LibraryPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OrderDetailPage } from '@/pages/OrderDetailPage'
import { PhotographerDashboardPage } from '@/pages/photographer/PhotographerDashboardPage'
import { PhotographerEventFormPage } from '@/pages/photographer/PhotographerEventFormPage'
import { PhotographerEventsPage } from '@/pages/photographer/PhotographerEventsPage'
import { PhotographerPhotosPage } from '@/pages/photographer/PhotographerPhotosPage'
import { PhotographerUploadPage } from '@/pages/photographer/PhotographerUploadPage'

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
        <Route path="photographer" element={<PhotographerLayout />}>
          <Route index element={<PhotographerDashboardPage />} />
          <Route path="events" element={<PhotographerEventsPage />} />
          <Route path="events/new" element={<PhotographerEventFormPage />} />
          <Route path="events/:id/edit" element={<PhotographerEventFormPage />} />
          <Route path="photos" element={<PhotographerPhotosPage />} />
          <Route path="photos/upload" element={<PhotographerUploadPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
