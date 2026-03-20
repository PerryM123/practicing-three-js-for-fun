import { NavLink } from 'react-router'
import { cx } from '../utils'

export const CommonHeader = () => {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <NavLink
          to="/"
          className="text-sm font-semibold tracking-tight hover:opacity-80"
        >
          Perry Playground
        </NavLink>
        <nav className="flex items-center gap-4 text-sm">
          <NavLink
            to="/playground"
            className={({ isActive }) =>
              cx(
                'transition-colors',
                isActive
                  ? 'font-semibold text-black'
                  : 'text-black/70 hover:text-black'
              )
            }
          >
            Playground
          </NavLink>
          <NavLink
            to="/info"
            className={({ isActive }) =>
              cx(
                'transition-colors',
                isActive
                  ? 'font-semibold text-black'
                  : 'text-black/70 hover:text-black'
              )
            }
          >
            Info
          </NavLink>
          <NavLink
            to="/sandbox"
            className={({ isActive }) =>
              cx(
                'transition-colors',
                isActive
                  ? 'font-semibold text-black'
                  : 'text-black/70 hover:text-black'
              )
            }
          >
            Sandbox
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
