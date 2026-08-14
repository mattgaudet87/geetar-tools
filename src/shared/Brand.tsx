import { Link } from 'react-router-dom'

/*
 * The Geetar Tools logo: a guitar pick with strings running across it. The pick
 * is cut in cream and the strings in the brand red of the plate behind it, so
 * the mark reads as a stamped enclosure. Pure SVG geometry, so it scales cleanly.
 */
function BrandMark() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden>
      {/* Pick outline */}
      <path
        d="M12 3.2c3.9 0 6.8 2 6.8 5.6 0 4.4-3.8 9.6-6.8 11.6-3-2-6.8-7.2-6.8-11.6 0-3.6 2.9-5.6 6.8-5.6Z"
        fill="var(--cream)"
        stroke="var(--cream)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Strings across the pick */}
      <g stroke="var(--brand)" strokeWidth="1.2" strokeLinecap="round">
        <line x1="7.2" y1="8.2" x2="16.8" y2="8.2" />
        <line x1="7.6" y1="11.2" x2="16.4" y2="11.2" />
        <line x1="8.4" y1="14.2" x2="15.6" y2="14.2" />
      </g>
    </svg>
  )
}

/*
 * The Geetar Tools brand mark + wordmark, shown at the top of the hub. Sizing
 * and colour live in `.gt-brand*` in theme.css so the phone layout can shrink
 * the whole lockup in one place. The mark links back to the hub.
 */
export function Brand({ wordmark = 'Geetar Tools' }: { wordmark?: string }) {
  return (
    <Link to="/" className="gt-brand">
      <span className="gt-brand-plate" aria-hidden>
        <BrandMark />
      </span>
      <span className="gt-brand-word">{wordmark}</span>
    </Link>
  )
}
