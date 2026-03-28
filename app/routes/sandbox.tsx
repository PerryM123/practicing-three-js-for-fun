import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  useExcavatorTelemetryQuery,
  type Telemetry,
} from '~/features/excavatorApi'
import { useNotifications } from '~/hooks/useNotifications'
import type { Route } from './+types/sandbox'

const PLANE_MAX_SIZE = 10 as const

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Sandbox' },
    { name: 'description', content: 'Welcome to Sandbox!' },
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

      <gridHelper
        args={[size, size, '#6b7280', '#9ca3af']}
        position={[0, 0, 0]}
      />
    </group>
  )
}

const BoxCharacter = ({
  telemetry,
}: {
  telemetry: Telemetry | null | undefined
}) => {
  const boxMeshRef = useRef<THREE.Mesh | null>(null)
  useEffect(() => {
    if (boxMeshRef.current && telemetry?.position) {
      boxMeshRef.current.position.x = telemetry.position.x
      boxMeshRef.current.position.z = telemetry.position.z
    }
  }, [telemetry?.position.x, telemetry?.position.z])
  return (
    <mesh position={[0, 0.5, 0]} castShadow ref={boxMeshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
  )
}

export default function Sandbox() {
  const { data } = useExcavatorTelemetryQuery()
  const [notifications] = useNotifications()
  const warningMessage =
    data?.connectionStatus === 'connecting'
      ? 'Connecting. Please wait...'
      : data?.connectionStatus === 'reconnecting'
        ? 'Connection Lost. Reconnecting...'
        : ''

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
        <BoxCharacter telemetry={data?.telemetry} />
        <OrbitControlsImpl />
      </Canvas>

      <div className="pointer-events-none absolute top-3 left-3 rounded-md bg-green-700/30 px-2 py-1 text-xs text-white">
        Drag to rotate • Scroll to zoom
      </div>
      <TelemetryInfo
        telemetry={data?.telemetry ?? null}
        status={data?.connectionStatus ?? 'disconnected'}
      />
      <p>warningMessage: {warningMessage}</p>
      {warningMessage && <WarningMessage message={warningMessage} />}
      <NotificationSandbox notificationList={notifications} />
    </div>
  )
}

const NotificationSandbox = ({
  notificationList,
}: {
  notificationList: string[]
}) => {
  return (
    <div className="absolute top-2 right-2 text-white">
      {notificationList.map((notificationItem, notificationIndex) => (
        <div key={notificationIndex}>{notificationItem}</div>
      ))}
    </div>
  )
}

const TelemetryInfo = ({
  telemetry,
  status,
}: {
  telemetry: Telemetry | null
  status: string
}) => {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 w-2xl max-w-xs rounded-md bg-green-700/50 px-3 py-2 text-xs text-white">
      <p className="font-semibold">Excavator Telemetry</p>
      <p>Status: {status}</p>
      {!telemetry ? (
        <p className="text-white/60">Waiting for telemetry…</p>
      ) : (
        <pre className="mt-1 overflow-x-auto break-all whitespace-pre-wrap">
          {JSON.stringify(telemetry, null, 2)}
        </pre>
      )}
    </div>
  )
}

const WarningMessage = ({ message }: { message: string }) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="absolute flex h-3/4 w-3/4 items-center justify-center bg-white opacity-80">
        <p className="text-center text-2xl">{message}</p>
      </div>
    </div>
  )
}
