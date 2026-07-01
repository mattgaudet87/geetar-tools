import { Link } from 'react-router-dom'

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
          width: 34,
          height: 34,
          borderRadius: 9,
          background: 'radial-gradient(circle at 35% 30%, #7df0c0, #10b07f)',
          boxShadow:
            '0 0 18px rgba(52,211,153,0.35), inset 0 0 0 1px rgba(255,255,255,0.2)',
          flexShrink: 0,
        }}
      />
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
