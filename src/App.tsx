import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Hub } from './shared/Hub'
import { TOOLS } from './tools/registry'

/*
 * Routes are generated from the tool registry:
 *   /            -> the hub (lists all tools)
 *   /<tool.path> -> that tool
 * Unknown paths redirect home.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Hub />,
  },
  ...TOOLS.map((tool) => ({
    path: `/${tool.path}`,
    element: <tool.component />,
  })),
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
