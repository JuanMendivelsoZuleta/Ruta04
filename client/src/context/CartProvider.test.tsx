import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CartProvider } from './CartProvider'
import { useCart } from './cart-context'
import type { CartItem } from './cart-context'

const item: CartItem = {
  photoId: 'photo-1',
  code: 'DEMO-1',
  price: 15000,
  storagePath: '/uploads/photo-1.jpg',
  eventId: 'event-1',
  eventName: 'Evento DEMO',
  available: true,
}

function Probe() {
  const { count, subtotal, add, remove } = useCart()
  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="subtotal">{subtotal}</span>
      <button onClick={() => add(item)}>add</button>
      <button onClick={() => remove(item.photoId)}>remove</button>
    </div>
  )
}

describe('CartProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('agrega, deduplica, calcula y persiste el carrito', () => {
    const { unmount } = render(
      <CartProvider>
        <Probe />
      </CartProvider>,
    )

    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('add'))
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByTestId('subtotal')).toHaveTextContent('15000')
    expect(window.localStorage.getItem('ruta04.cart')).toContain('photo-1')

    unmount()

    render(
      <CartProvider>
        <Probe />
      </CartProvider>,
    )
    expect(screen.getByTestId('count')).toHaveTextContent('1')

    fireEvent.click(screen.getByText('remove'))
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })
})
