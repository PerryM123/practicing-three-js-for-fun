import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import type { Route } from './+types/playground'
// TODO: Setup aliases
import './../../app/three-fiber-style.css'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Playground' },
    { name: 'description', content: 'Welcome to Playground!' },
  ]
}

const Box = ({ position }: { position: [x: number, y: number, z: number] }) => {
  const meshRef = useRef<THREE.Mesh | null>(null)
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  useFrame((state, delta) => {
    if (!meshRef.current) {
      return
    }
    meshRef.current.rotation.x += delta
    meshRef.current.rotation.y -= delta
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
