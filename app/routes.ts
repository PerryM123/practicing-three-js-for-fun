import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  route('login', 'routes/login.tsx'),
  layout('routes/protected-layout.tsx', [
    index('routes/dashboard.tsx'),
    route('playground', 'routes/playground.tsx'),
    route('info', 'routes/info.tsx'),
    route('sandbox', 'routes/sandbox.tsx'),
  ]),
] satisfies RouteConfig
