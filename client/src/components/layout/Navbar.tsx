import { Aperture, Menu, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { useCart } from '@/context/cart-context'
import { cn } from '@/lib/cn'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/events', label: 'Eventos' },
  { to: '/library', label: 'Mis compras' },
]

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-panel-soft text-white' : 'text-slate-400 hover:text-white',
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-night/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" onClick={close}>
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-ink">
            <Aperture className="size-5" aria-hidden="true" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-lg font-bold uppercase tracking-[0.18em] text-white">
              Ruta 04
            </span>
            <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Fotografía deportiva
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/cart"
            aria-label={`Carrito (${count})`}
            className="relative grid size-10 place-items-center rounded-xl border border-line-strong text-slate-300 transition-colors hover:border-accent/60 hover:text-white"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            {count > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-ink">
                {count}
              </span>
            ) : null}
          </Link>
          <Link
            to="/photographer"
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-accent/60 hover:text-white"
          >
            Modo fotógrafo
            <Badge tone="accent">DEMO</Badge>
          </Link>
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl border border-line-strong text-slate-300 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {open ? (
        <div className="border-t border-line bg-night px-5 pb-5 pt-2 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navegación móvil">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navLinkClass}
                onClick={close}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/cart" className={navLinkClass} onClick={close}>
              Carrito{count > 0 ? ` (${count})` : ''}
            </NavLink>
            <NavLink to="/photographer" className={navLinkClass} onClick={close}>
              Modo fotógrafo (DEMO)
            </NavLink>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
