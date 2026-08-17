import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { playPedalSwitch } from './sfx'

/*
 * Shared header for every tool page. Two layouts live here:
 *
 * - Legacy (no `serial`): a 3-column grid keeps the title centered on the
 *   page regardless of the back button's width:
 *     [ ← back + tool icon ]   [ Geetar Tools — <name> ]   [ spacer ]
 * - Reskinned ("on the board", pass `serial`): back + icon + name group on
 *   the left, the hub tile's serial + LED reappear on the right — no more
 *   centered "Geetar Tools — X" title. Tools switch over to this one at a
 *   time as they're reskinned; the rest keep the legacy layout untouched.
 */
export function ToolHeader({
  name,
  icon,
  serial,
}: {
  name: string
  icon?: ReactNode
  serial?: string
}) {
  return (
    <header className={`gt-toolhead${serial ? ' is-tuned' : ''}`}>
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
        {serial && <h1 className="gt-toolhead-title">{name}</h1>}
      </div>
      {serial ? (
        <div className="gt-toolhead-right">
          <span className="gt-toolhead-serial">{serial}</span>
          <span className="gt-toolhead-led" aria-hidden />
        </div>
      ) : (
        <>
          <h1 className="gt-toolhead-title">
            Geetar Tools <span className="gt-toolhead-sep" aria-hidden>—</span>{' '}
            <span className="gt-toolhead-name">{name}</span>
          </h1>
          <div className="gt-toolhead-right" aria-hidden />
        </>
      )}
    </header>
  )
}
