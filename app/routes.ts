import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('playground', 'routes/playground.tsx'),
  route('info', 'routes/info.tsx'),
  route('sandbox', 'routes/sandbox.tsx'),
] satisfies RouteConfig
