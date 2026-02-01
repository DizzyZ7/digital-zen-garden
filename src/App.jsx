import React, { useState, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

const Branch = ({ length, depth, color, isRoot = false }) => {
  if (depth <= 0) {
    return (
      <mesh position={[0, length, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    )
  }

  const thickness = 0.05 * depth
  // Углы наклона для разветвления
  const angleA = 0.45
  const angleB = -0.45

  return (
    <group>
      {/* Сама ветка: смещаем цилиндр так, чтобы его низ был в точке 0,0,0 группы */}
      <mesh position={[0, length / 2, 0]}>
        <cylinderGeometry args={[thickness * 0.7, thickness, length, 8]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>

      {/* Переходим к следующему уровню рекурсии от конца текущей ветки */}
      <group position={[0, length, 0]}>
        <group rotation={[angleA, 0, 0.2]}>
          <Branch length={length * 0.75} depth={depth - 1} color={color} />
        </group>
        <group rotation={[angleB, 2.2, -0.2]}>
          <Branch length={length * 0.75} depth={depth - 1} color={color} />
        </group>
      </group>
    </group>
  )
}

export default function App() {
  const [text, setText] = useState('dizZy')

  const treeColor = useMemo(() => {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash)
    }
    return `hsl(${Math.abs(hash) % 360}, 65%, 60%)`
  }, [text])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f0f4f8', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center', zIndex: 10 }}>
        <input 
          type="text" 
          onChange={(e) => setText(e.target.value || 'dizZy')}
          placeholder="Enter name..."
          style={{ 
            padding: '12px 25px', borderRadius: '30px', border: 'none',
            background: 'white', color: '#333', textAlign: 'center', 
            outline: 'none', fontSize: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}
        />
      </div>

      <Canvas camera={{ position: [0, 6, 12], fov: 45 }}>
        <color attach="background" args={['#f0f4f8']} />
        <fog attach="fog" args={['#f0f4f8', 10, 35]} />
        
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Environment preset="apartment" />

        <Suspense fallback={null}>
          <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
            <group position={[0, -2.5, 0]}>
              <Branch length={2} depth={5} color={treeColor} isRoot={true} />
              <ContactShadows opacity={0.2} scale={15} blur={2} far={10} />
            </group>
          </Float>
        </Suspense>

        <OrbitControls makeDefault minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  )
}
