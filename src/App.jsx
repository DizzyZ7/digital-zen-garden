import React, { useState, useMemo, Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

const Branch = ({ length, depth, color, index = 0 }) => {
  const groupRef = useRef()

  // Анимация ветра: каждая ветка качается со своим смещением
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime()
      groupRef.current.rotation.x = Math.sin(t + index) * (0.02 * (6 - depth))
      groupRef.current.rotation.z = Math.cos(t + index * 0.5) * (0.01 * (6 - depth))
    }
  })

  if (depth <= 0) {
    return (
      <mesh position={[0, length, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.6} 
          toneMapped={false}
        />
      </mesh>
    )
  }

  const thickness = 0.06 * depth

  return (
    <group ref={groupRef}>
      <mesh position={[0, length / 2, 0]}>
        <cylinderGeometry args={[thickness * 0.65, thickness, length, 10]} />
        <meshStandardMaterial color="#2b1d12" roughness={0.9} />
      </mesh>

      <group position={[0, length, 0]}>
        {/* Три ветки вместо двух для объема */}
        <group rotation={[0.5, 0, 0.1]}>
          <Branch length={length * 0.72} depth={depth - 1} color={color} index={index + 1} />
        </group>
        <group rotation={[-0.2, 2.1, 0.4]}>
          <Branch length={length * 0.7} depth={depth - 1} color={color} index={index + 2} />
        </group>
        <group rotation={[-0.3, -2.1, -0.4]}>
          <Branch length={length * 0.65} depth={depth - 1} color={color} index={index + 3} />
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
    return `hsl(${Math.abs(hash) % 360}, 75%, 65%)`
  }, [text])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#eef2f5', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center', zIndex: 10 }}>
        <input 
          type="text" 
          onChange={(e) => setText(e.target.value || 'dizZy')}
          placeholder="Garden ID..."
          style={{ 
            padding: '12px 25px', borderRadius: '30px', border: 'none',
            background: 'white', color: '#333', textAlign: 'center', 
            outline: 'none', fontSize: '18px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            fontFamily: 'monospace', letterSpacing: '2px'
          }}
        />
      </div>

      <Canvas camera={{ position: [0, 6, 14], fov: 40 }} dpr={[1, 2]}>
        <color attach="background" args={['#f4f7f9']} />
        <fog attach="fog" args={['#f4f7f9', 12, 30]} />
        
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <Environment preset="forest" />

        <Suspense fallback={null}>
          <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.2}>
            <group position={[0, -3, 0]}>
              <Branch length={2.2} depth={5} color={treeColor} />
              
              {/* Светлячки вокруг дерева */}
              <Sparkles count={40} scale={6} size={2} speed={0.4} color={treeColor} />
              
              <ContactShadows opacity={0.15} scale={20} blur={3} far={10} />
              
              {/* Платформа (Дзен-камень) */}
              <mesh position={[0, -0.1, 0]}>
                <cylinderGeometry args={[1.5, 1.7, 0.2, 32]} />
                <meshStandardMaterial color="#ddd" roughness={0.5} />
              </mesh>
            </group>
          </Float>
        </Suspense>

        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.3} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  )
}
