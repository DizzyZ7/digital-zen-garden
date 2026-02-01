import React, { useState, useMemo, Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Float, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

const Branch = ({ length, depth, color, index = 0 }) => {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime() * 0.4
      // Очень мягкое покачивание
      groupRef.current.rotation.x = Math.sin(t + index) * (0.01 * (5 - depth))
      groupRef.current.rotation.z = Math.cos(t + index * 0.5) * (0.01 * (5 - depth))
    }
  })

  if (depth <= 0) {
    return (
      <mesh position={[0, length, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={2} // Усилено для эффекта свечения
          toneMapped={false} 
        />
      </mesh>
    )
  }

  const thickness = 0.05 * depth

  return (
    <group ref={groupRef}>
      <mesh position={[0, length / 2, 0]}>
        <cylinderGeometry args={[thickness * 0.7, thickness, length, 8]} />
        <meshStandardMaterial color="#2b1d12" roughness={0.9} metalness={0.1} />
      </mesh>

      <group position={[0, length, 0]}>
        {/* Добавляем небольшую случайность в углы для органичности */}
        <group rotation={[0.4 + Math.sin(index) * 0.1, 0, 0.1]}>
          <Branch length={length * 0.75} depth={depth - 1} color={color} index={index + 1} />
        </group>
        <group rotation={[-0.3, 2.2 + index, 0.3]}>
          <Branch length={length * 0.72} depth={depth - 1} color={color} index={index + 2} />
        </group>
        <group rotation={[-0.2, -2.2, -0.3]}>
          <Branch length={length * 0.68} depth={depth - 1} color={color} index={index + 3} />
        </group>
      </group>
    </group>
  )
}

export default function App() {
  const [text, setText] = useState('Zen')

  // Определяем тему в зависимости от времени (день/ночь)
  const isNight = useMemo(() => {
    const hour = new Date().getHours()
    return hour < 6 || hour > 20
  }, [])

  const treeColor = useMemo(() => {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash)
    }
    return `hsl(${Math.abs(hash) % 360}, 70%, ${isNight ? '70%' : '60%'})`
  }, [text, isNight])

  const bgColor = isNight ? '#050a0f' : '#f0f4f8'

  return (
    <div style={{ width: '100vw', height: '100vh', background: bgColor, position: 'relative', transition: 'background 2s' }}>
      <div style={{ position: 'absolute', top: '40px', width: '100%', textAlign: 'center', zIndex: 10 }}>
        <input 
          type="text" 
          onChange={(e) => setText(e.target.value || 'Zen')}
          placeholder="Garden Name..."
          style={{ 
            padding: '12px 30px', borderRadius: '40px', border: 'none',
            background: isNight ? 'rgba(255,255,255,0.1)' : 'white', 
            color: isNight ? 'white' : '#333', textAlign: 'center', 
            outline: 'none', fontSize: '18px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)', transition: 'all 0.5s'
          }}
        />
      </div>

      <Canvas gl={{ antialias: true, toneMapping: THREE.ReinhardToneMapping }}>
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 10, 40]} />
        
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={40} />
          
          <ambientLight intensity={isNight ? 0.2 : 0.8} />
          <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={isNight ? 5 : 2} castShadow />
          
          <Environment preset={isNight ? "night" : "apartment"} />

          <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <group position={[0, -2.5, 0]}>
              <Branch length={2.2} depth={5} color={treeColor} />
              <ContactShadows opacity={isNight ? 0.4 : 0.2} scale={15} blur={3} far={10} color={isNight ? "#000" : "#666"} />
              
              {/* Постамент */}
              <mesh position={[0, -0.1, 0]}>
                <cylinderGeometry args={[1.5, 1.6, 0.15, 32]} />
                <meshStandardMaterial color={isNight ? "#111" : "#fff"} roughness={0.3} />
              </mesh>
            </group>
          </Float>
        </Suspense>

        <OrbitControls 
          makeDefault 
          autoRotate={!isNight} 
          autoRotateSpeed={0.5} 
          enableZoom={true}
          minDistance={8}
          maxDistance={25}
        />
      </Canvas>
    </div>
  )
}
