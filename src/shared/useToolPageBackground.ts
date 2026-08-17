import { useEffect } from 'react'
import type { ToolPageTheme } from './toolPageTheme'

/*
 * Paints <body> with a reskinned tool page's gradient + hairline frame, the
 * same way the hub paints it flat black (see Hub.tsx's `gt-board-bg`).
 * Cleans up on unmount so the next page isn't left holding this tool's colours.
 */
export function useToolPageBackground(theme: ToolPageTheme) {
  useEffect(() => {
    const { body } = document
    body.classList.add('gt-tool-bg')
    body.style.setProperty('--page-top', theme.pageTop)
    body.style.setProperty('--page-bot', theme.pageBot)
    body.style.setProperty('--page-edge', theme.pageEdge)
    return () => {
      body.classList.remove('gt-tool-bg')
      body.style.removeProperty('--page-top')
      body.style.removeProperty('--page-bot')
      body.style.removeProperty('--page-edge')
    }
  }, [theme])
}
