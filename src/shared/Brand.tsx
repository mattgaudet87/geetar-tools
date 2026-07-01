import { Link } from 'react-router-dom'

/*
 * The Geetar Tools logo: a guitar pick with strings running across it. Drawn in
 * a dark tint so it reads clearly on the bright green brand tile. Scales cleanly
 * because it's pure SVG geometry.
 */
function BrandMark() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      {/* Pick outline */}
      <path
        d="M12 3.2c3.9 0 6.8 2 6.8 5.6 0 4.4-3.8 9.6-6.8 11.6-3-2-6.8-7.2-6.8-11.6 0-3.6 2.9-5.6 6.8-5.6Z"
        fill="#0a3d2c"
        stroke="#0a3d2c"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Strings across the pick */}
      <g stroke="#7df0c0" strokeWidth="1.1" strokeLinecap="round" opacity="0.95">
        <line x1="7.2" y1="8.2" x2="16.8" y2="8.2" />
        <line x1="7.6" y1="11.2" x2="16.4" y2="11.2" />
        <line x1="8.4" y1="14.2" x2="15.6" y2="14.2" />
      </g>
    </svg>
  )
}

/*
 * The Geetar Tools brand mark + wordmark. Shared so every tool header and the
 * hub use exactly the same logo. The mark links back to the hub.
 */
export function Brand({ wordmark = 'Geetar Tools' }: { wordmark?: string }) {
  return (
    <Link
      to="/"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          display: 'grid',
          placeItems: 'center',
          background: 'radial-gradient(circle at 35% 30%, #7df0c0, #10b07f)',
          boxShadow:
            '0 0 18px rgba(52,211,153,0.35), inset 0 0 0 1px rgba(255,255,255,0.2)',
          flexShrink: 0,
        }}
      >
        <BrandMark />
      </span>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 25,
          letterSpacing: '-0.02em',
          color: '#f3f6fa',
        }}
      >
        {wordmark}
      </span>
    </Link>
  )
}
