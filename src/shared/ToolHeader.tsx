import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { playPedalSwitch } from './sfx'

/*
 * Shared header for every tool page. Layout is a 3-column grid so the title
 * stays centered on the page regardless of the back button's width:
 *   [ ← back + tool icon ]   [ Geetar Tools — <name> ]   [ spacer ]
 * The tool's own icon sits top-left (in place of the old brand blob), and any
 * future tool gets this header for free by passing its name + icon.
 */
export function ToolHeader({ name, icon }: { name: string; icon?: ReactNode }) {
  return (
    <header className="gt-toolhead">
      <div className="gt-toolhead-left">
        <Link
          to="/"
          className="gt-back"
          aria-label="Back to all tools"
          onClick={playPedalSwitch}
        >
          <span aria-hidden>←</span> All tools
        </Link>
        {icon && (
          <span className="gt-toolhead-mark" aria-hidden>
            {icon}
          </span>
        )}
      </div>
      <h1 className="gt-toolhead-title">
        Geetar Tools <span className="gt-toolhead-sep" aria-hidden>—</span>{' '}
        <span className="gt-toolhead-name">{name}</span>
      </h1>
      <div className="gt-toolhead-right" aria-hidden />
    </header>
  )
}
