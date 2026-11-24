import { Aperture } from 'lucide-react'
import { Link } from 'react-router'
import { Container } from './Container'

const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-line bg-panel/30">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-ink">
              <Aperture className="size-4" aria-hidden="true" />
            </span>
            <span className="font-display text-base font-bold uppercase tracking-[0.18em] text-white">
              Ruta 04
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Marketplace de fotografía deportiva. Proyecto académico de demostración.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Eventos e imágenes DEMO; no representan eventos reales. No se procesan
            pagos reales.
          </p>
        </div>

        <nav
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400"
          aria-label="Navegación del pie"
        >
          <Link to="/events" className="transition-colors hover:text-white">
            Eventos
          </Link>
          <Link to="/library" className="transition-colors hover:text-white">
            Mis compras
          </Link>
          <Link to="/photographer" className="transition-colors hover:text-white">
            Modo fotógrafo
          </Link>
        </nav>
      </Container>

      <Container className="border-t border-line/70 py-4">
        <p className="text-xs text-slate-600">
          © {CURRENT_YEAR} Ruta 04 · Tu carrera. Tu momento. Tu fotografía.
        </p>
      </Container>
    </footer>
  )
}
