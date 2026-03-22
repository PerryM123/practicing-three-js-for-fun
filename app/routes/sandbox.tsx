import type { Route } from './+types/sandbox'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const PLANE_MAX_SIZE = 10 as const
const EDGE_LIMIT = PLANE_MAX_SIZE * 0.5
let direction = 1

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Perry Playground' },
    { name: 'description', content: 'Welcome to playground!' },
  ]
}

function OrbitControlsImpl() {
  const { camera, gl } = useThree()
  const controlsRef = useRef<OrbitControls | null>(null)

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.rotateSpeed = 0.6
    controls.zoomSpeed = 0.8
    controls.minDistance = 2
    controls.maxDistance = 80
    controls.target.set(0, 0, 0)
    controls.update()

    controlsRef.current = controls
    return () => {
      controlsRef.current = null
      controls.dispose?.()
    }
  }, [camera, gl.domElement])

  useFrame(() => {
    controlsRef.current?.update()
  })

  return null
}

function GroundPlane({ size = PLANE_MAX_SIZE }: { size?: number }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#e5e7eb" roughness={1} metalness={0} />
      </mesh>

      {/* In Three.js, GridHelper is drawn on the XZ plane (Y up). */}
      <gridHelper
        args={[size, size, '#6b7280', '#9ca3af']}
        position={[0, 0, 0]}
      />
    </group>
  )
}

const BoxCharacter = () => {
  const boxMeshRef = useRef<THREE.Mesh | null>(null)
  console.log('perry: edge: ', Math.abs(EDGE_LIMIT))
  useFrame((state, delta) => {
    if (!boxMeshRef.current) {
      return
    }
    boxMeshRef.current.position.x += delta * direction
  })
  return (
    // TODO: castShadow is not working??
    // TODO: I need to make sure the box does not exceed the ground plane
    <mesh position={[0, 0.5, 0]} castShadow ref={boxMeshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export default function Sandbox() {
  return (
    <div className="relative h-[70vh] w-full">
      <Canvas
        style={{ position: 'absolute', inset: 0 }}
        camera={{ position: [0, 6, 10], fov: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#0b1220'), 1)
        }}
      >
        <ambientLight intensity={5} />
        <directionalLight position={[6, 10, 8]} intensity={1} />

        <GroundPlane />
        <BoxCharacter />
        <OrbitControlsImpl />
      </Canvas>

      <div className="pointer-events-none absolute top-3 left-3 rounded-md bg-black/30 px-2 py-1 text-xs text-white">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  )
}
