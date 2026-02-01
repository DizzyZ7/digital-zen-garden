import React, { useState, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// Компонент одной ветки
const Branch = ({ position, rotation, length, depth, color }) => {
  if (depth <= 0) {
    return (
      <mesh position={position}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    )
  }

  const end = new THREE.Vector3(0, length, 0)
    .applyEuler(new THREE.Euler(...rotation))
    .add(position)

  const thickness = 0.05 * depth

  return (
    <group>
      <mesh position={position.clone().lerp(end, 0.5)}>
        <quaternion attach="quaternion" setFromUnitVectors={
          new THREE.Vector3(0, 1, 0), 
          end.clone().sub(position).normalize()
        } />
        <cylinderGeometry args={[thickness * 0.7, thickness, length, 6]} />
        <meshStandardMaterial color="#2d1b0d" />
      </mesh>
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.5, rotation[1] + 2.5, rotation[2]]}
        length={length * 0.7}
        depth={depth - 1}
        color={color}
      />
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.5, rotation[1] - 2.5, rotation[2]]}
        length={length * 0.7}
        depth={depth - 1}
        color={color}
      />
    </group>
  )
}

export default function App() {
  const [text, setText] = useState('Zen')

  // Простой алгоритм цвета из строки
  const treeColor = useMemo(() => {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash)
    }
    return `hsl(${Math.abs(hash) % 360}, 50%, 70%)`
  }, [text])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      {/* UI слой */}
      <div style={{ position: 'absolute', top: 30, width: '100%', textAlign: 'center', zIndex: 10 }}>
        <input 
          type="text" 
          onChange={(e) => setText(e.target.value || 'Zen')}
          placeholder="Enter name..."
          style={{ 
            padding: '10px 20px', borderRadius: '25px', border: '1px solid #555',
            background: 'rgba(0,0,0,0.5)', color: 'white', textAlign: 'center', outline: 'none'
          }}
        />
      </div>

      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <color attach="background" args={['#000']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        
        <Suspense fallback={null}>
          <group position={[0, -2, 0]}>
            <Branch position={new THREE.Vector3(0, 0, 0)} rotation={[0, 0, 0]} length={1.5} depth={5} color={treeColor} />
            <ContactShadows opacity={0.4} scale={15} blur={2.5} far={10} />
          </group>
        </Suspense>

        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}
