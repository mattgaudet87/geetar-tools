import { Link } from 'react-router-dom'
import { Brand } from './Brand'
import { TOOLS } from '../tools/registry'

/*
 * The hub / landing page for Geetar Tools. Lists every tool from the registry
 * as a card. Ready tools link to their route; not-yet-ready tools show a
 * "coming soon" state.
 */
export function Hub() {
  return (
    <div
      style={{
        maxWidth: 1180,
        margin: '0 auto',
        padding: '40px 28px 64px',
      }}
    >
      <div style={{ marginBottom: 34 }}>
        <Brand />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 18,
        }}
      >
        {TOOLS.map((tool) => {
          const inner = (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 42,
                    height: 42,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 11,
                    background: 'var(--control-bg-2)',
                    border: '1px solid var(--control-border-2)',
                    color: 'var(--accent-bright)',
                  }}
                >
                  {tool.mark}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 17,
                    color: 'var(--text-primary)',
                  }}
                >
                  {tool.name}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  color: 'var(--text-muted-2)',
                  fontSize: 12.5,
                  lineHeight: 1.6,
                }}
              >
                {tool.blurb}
              </p>
              <div
                className="gt-label"
                style={{
                  marginTop: 16,
                  color: tool.ready ? 'var(--accent-bright)' : 'var(--text-faint)',
                }}
              >
                {tool.ready ? 'Open →' : 'Coming soon'}
              </div>
            </>
          )

          const cardStyle: React.CSSProperties = {
            display: 'block',
            padding: '20px 20px 18px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-panel)',
            borderRadius: 16,
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.03) inset, 0 14px 40px rgba(0,0,0,0.35)',
            opacity: tool.ready ? 1 : 0.6,
          }

          return tool.ready ? (
            <Link key={tool.id} to={`/${tool.path}`} style={cardStyle}>
              {inner}
            </Link>
          ) : (
            <div key={tool.id} style={{ ...cardStyle, cursor: 'default' }}>
              {inner}
            </div>
          )
        })}
      </div>
    </div>
  )
}
