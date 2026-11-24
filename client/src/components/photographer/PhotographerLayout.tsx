import { NavLink, Outlet } from 'react-router'
import { Container } from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'

const tabs = [
  { to: '/photographer', label: 'Resumen', end: true },
  { to: '/photographer/events', label: 'Eventos' },
  { to: '/photographer/photos', label: 'Fotografías' },
]

function tabClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'border-accent text-white'
      : 'border-transparent text-slate-400 hover:text-white',
  )
}

export function PhotographerLayout() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="accent">Modo fotógrafo · DEMO</Badge>
        <span className="text-xs text-slate-500">
          Acceso de demostración; no es autenticación real.
        </span>
      </div>

      <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-wide text-white sm:text-5xl">
        Panel del fotógrafo
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
        Gestiona eventos, sube fotografías y administra precios y disponibilidad.
        Todos los cambios se guardan en la base de datos de la demo.
      </p>

      <nav
        className="mt-6 flex flex-wrap gap-1 border-b border-line"
        aria-label="Secciones del panel del fotógrafo"
      >
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={tabClass}>
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </Container>
  )
}
