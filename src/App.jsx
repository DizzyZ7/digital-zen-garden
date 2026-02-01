import React, { useState, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

const Branch = ({ position, rotation, length, depth, color }) => {
  if (depth <= 0) {
    return (
      <mesh position={position}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} roughness={0.3} />
      </mesh>
    )
  }

  // Вычисляем конечную точку ветки
  const end = new THREE.Vector3(0, length, 0)
    .applyEuler(new THREE.Euler(...rotation))
    .add(position)

  const thickness = 0.05 * depth

  return (
    <group>
      <mesh 
        position={position.clone().lerp(end, 0.5)} 
        onUpdate={(self) => {
          self.lookAt(end)
          self.rotateX(Math.PI / 2) // Корректируем ориентацию цилиндра
        }}
      >
        <cylinderGeometry args={[thickness * 0.7, thickness, length, 10]} />
        <meshStandardMaterial color="#4a3728" roughness={0.8} />
      </mesh>
      
      {/* Левая ветка */}
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.4, rotation[1] + 2.1, rotation[2]]}
        length={length * 0.75}
        depth={depth - 1}
        color={color}
      />
      {/* Правая ветка */}
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.5, rotation[1] - 1.8, rotation[2] + 0.3]}
        length={length * 0.75}
        depth={depth - 1}
        color={color}
      />
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
    // Делаем цвета более пастельными и яркими для светлой темы
    return `hsl(${Math.abs(hash) % 360}, 70%, 60%)`
  }, [text])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f0f0f0', position: 'relative' }}>
      {/* Чистый UI */}
      <div style={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center', zIndex: 10 }}>
        <input 
          type="text" 
          onChange={(e) => setText(e.target.value || 'dizZy')}
          placeholder="Who are you?"
          style={{ 
            padding: '12px 25px', borderRadius: '30px', border: 'none',
            background: 'white', color: '#333', textAlign: 'center', 
            outline: 'none', fontSize: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            letterSpacing: '1px'
          }}
        />
      </div>

      <Canvas camera={{ position: [0, 5, 12], fov: 45 }} shadows>
        {/* Светлый фон с легким туманом */}
        <color attach="background" args={['#e8eff5']} />
        <fog attach="fog" args={['#e8eff5', 10, 30]} />
        
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#white" />
        
        {/* Окружение для красивых бликов */}
        <Environment preset="park" />

        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4}>
            <group position={[0, -2, 0]}>
              <Branch position={new THREE.Vector3(0, 0, 0)} rotation={[0, 0, 0]} length={1.8} depth={5} color={treeColor} />
              <ContactShadows opacity={0.2} scale={20} blur={2.5} far={10} color="#000" />
            </group>
          </Float>
        </Suspense>

        <OrbitControls makeDefault enableDamping minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  )
}
