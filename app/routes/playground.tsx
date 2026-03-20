import type { Route } from './+types/home'
import { Canvas, useFrame } from '@react-three/fiber'
// TODO: Setup aliases
import './../../app/three-fiber-style.css'
import { useRef, useState } from 'react'
import type { Mesh } from 'three'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Perry Playground' },
    { name: 'description', content: 'Welcome to playground!' },
  ]
}

const Box = ({ position }: { position: [x: number, y: number, z: number] }) => {
  console.log('perry: Box component')
  // This reference will give us direct access to the mesh
  const meshRef = useRef<Mesh | null>(null)
  console.log('perry: meshRef: ', meshRef)
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    if (!meshRef.current) {
      return
    }
    meshRef.current.rotation.x += delta
  })
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      position={position}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

export default function Home() {
  return (
    <Canvas>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
    </Canvas>
  )
}
