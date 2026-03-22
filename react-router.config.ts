import type { Config } from '@react-router/dev/config'

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: false,
  // TODO: The hydration error is fixed but why was this needed?
  future: {
    v8_viteEnvironmentApi: true,
  },
} satisfies Config
