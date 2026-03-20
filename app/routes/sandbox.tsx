import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Perry Playground' },
    { name: 'description', content: 'Welcome to playground!' },
  ]
}

export default function Sandbox() {
  return <p>Well well well...</p>
}
