import React, { useState, useMemo, Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Float, PerspectiveCamera, Stars } from '@react-three/drei'
import * as THREE from 'three'

const Branch = ({ length, depth, color, index = 0, onGrow }) => {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime() * 0.4
      groupRef.current.rotation.x = Math.sin(t + index) * (0.01 * (5 - depth))
      groupRef.current.rotation.z = Math.cos(t + index * 0.5) * (0.01 * (5 - depth))
    }
  })

  if (depth <= 0) {
    return (
      <mesh position={[0, length, 0]} onClick={(e) => { e.stopPropagation(); onGrow(); }}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={1.5} 
          toneMapped={false} 
        />
      </mesh>
    )
  }

  const thickness = 0.05 * depth

  return (
    <group ref={groupRef}>
      <mesh 
        position={[0, length / 2, 0]} 
        onClick={(e) => { e.stopPropagation(); onGrow(); }}
      >
        <cylinderGeometry args={[thickness * 0.7, thickness, length, 8]} />
        <meshStandardMaterial color="#2b1d12" roughness={0.9} />
      </mesh>

      <group position={[0, length, 0]}>
        <group rotation={[0.42, 0, 0.1]}>
          <Branch length={length * 0.75} depth={depth - 1} color={color} index={index + 1} onGrow={onGrow} />
        </group>
        <group rotation={[-0.3, 2.2, 0.3]}>
          <Branch length={length * 0.72} depth={depth - 1} color={color} index={index + 2} onGrow={onGrow} />
        </group>
        <group rotation={[-0.2, -2.2, -0.3]}>
          <Branch length={length * 0.68} depth={depth - 1} color={color} index={index + 3} onGrow={onGrow} />
        </group>
      </group>
    </group>
  )
}

// Компонент падающих лепестков
const FallingLeaves = ({ count, color }) => {
  const meshRef = useRef()
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const time = Math.random() * 100
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const x = (Math.random() - 0.5) * 10
      const y = (Math.random() - 0.5) * 10
      const z = (Math.random() - 0.5) * 10
      temp.push({ time, factor, speed, x, y, z })
    }
    return temp
  }, [count])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { time, factor, speed, x, y, z } = particle
      time = particle.time += speed / 2
      const s = Math.cos(time)
      dummy.position.set(
        x + Math.sin(time * 1) * 2,
        y + Math.cos(time * 2) * 2,
        z + Math.sin(time * 3) * 2
      )
      dummy.scale.set(s, s, s)
      dummy.rotation.set(s * 5, s * 5, s * 5)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <dodecahedronGeometry args={[0.1, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </instancedMesh>
  )
}

export default function App() {
  const [text, setText] = useState('Zen')
  const [isNight, setIsNight] = useState(new Date().getHours() < 6 || new Date().getHours() > 20)
  const [burst, setBurst] = useState(0)

  const treeColor = useMemo(() => {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash)
    }
    return `hsl(${Math.abs(hash) % 360}, 70%, ${isNight ? '75%' : '60%'})`
  }, [text, isNight])

  const bgColor = isNight ? '#020406' : '#f0f4f8'

  return (
    <div style={{ width: '100vw', height: '100vh', background: bgColor, position: 'relative', transition: 'background 1.5s ease-in-out' }}>
      {/* UI элементы */}
      <div style={{ position: 'absolute', top: '30px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 10 }}>
        <input 
          type="text" 
          onChange={(e) => setText(e.target.value || 'Zen')}
          placeholder="Name your garden..."
          style={{ 
            padding: '10px 25px', borderRadius: '30px', border: 'none',
            background: isNight ? 'rgba(255,255,255,0.1)' : 'white', 
            color: isNight ? 'white' : '#333', textAlign: 'center', 
            outline: 'none', fontSize: '16px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        />
        <button 
          onClick={() => setIsNight(!isNight)}
          style={{
            padding: '8px 20px', borderRadius: '20px', border: '1px solid rgba(127,127,127,0.3)',
            background: 'transparent', color: isNight ? '#aaa' : '#555', cursor: 'pointer',
            fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px'
          }}
        >
          {isNight ? '🌙 Night Mode' : '☀️ Day Mode'}
        </button>
      </div>

      <Canvas gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        <color attach="background" args={[bgColor]} />
        {isNight && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
        <fog attach="fog" args={[bgColor, 10, 45]} />
        
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={40} />
          <Environment preset={isNight ? "night" : "park"} />
          
          <ambientLight intensity={isNight ? 0.1 : 0.8} />
          <pointLight position={[10, 10, 10]} intensity={isNight ? 5 : 2} color={treeColor} />

          <Float speed={0.6} rotationIntensity={0.2} floatIntensity={0.4}>
            <group position={[0, -2.5, 0]}>
              <Branch length={2.2} depth={5} color={treeColor} onGrow={() => setBurst(prev => prev + 1)} />
              
              {/* Появление частиц при клике */}
              {burst > 0 && <FallingLeaves key={burst} count={30} color={treeColor} />}
              
              <ContactShadows opacity={isNight ? 0.5 : 0.2} scale={15} blur={3} far={10} />
              
              <mesh position={[0, -0.1, 0]}>
                <cylinderGeometry args={[1.6, 1.8, 0.2, 32]} />
                <meshStandardMaterial color={isNight ? "#0a0a0a" : "#ffffff"} />
              </mesh>
            </group>
          </Float>
        </Suspense>

        <OrbitControls makeDefault autoRotate={!isNight} autoRotateSpeed={0.3} />
      </Canvas>
      
      <div style={{ position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center', color: isNight ? '#444' : '#ccc', fontSize: '10px', pointerEvents: 'none' }}>
        TAP TREE TO RELEASE SPIRITS
      </div>
    </div>
  )
}
