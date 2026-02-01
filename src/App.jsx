import React, { useState, Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Stars } from '@react-three/drei'
import * as THREE from 'three'

// Вспомогательный компонент ветки (теперь внутри App.jsx)
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
        rotation={[rotation[0] + 0.5, rotation[1] + 2.4, rotation[2]]}
        length={length * 0.7}
        depth={depth - 1}
        color={color}
      />
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.5, rotation[1] - 2.4, rotation[2]]}
        length={length * 0.7}
        depth={depth - 1}
        color={color}
      />
    </group>
  )
}

export default function App() {
  const [name, setName] = useState('Zen')
  
  // Простая генерация цвета из строки без библиотеки md5
  const color = useMemo(() => {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return `hsl(${Math.abs(hash) % 360}, 60%, 70%)`
  }, [name])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 20, width: '100%', textAlign: 'center', zIndex: 10 }}>
        <input 
          onChange={(e) => setName(e.target.value || 'Zen')}
          placeholder="Type here..."
          style={{ padding: '10px', borderRadius: '20px', border: '1px solid white', background: 'none', color: 'white', textAlign: 'center' }}
        />
      </div>

      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <color attach="background" args={['#000']} />
        <Stars radius={100} depth={50} count={5000} factor={4} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Suspense fallback={null}>
          <group position={[0, -2, 0]}>
            <Branch position={new THREE.Vector3(0, 0, 0)} rotation={[0, 0, 0]} length={1.5} depth={5} color={color} />
            <ContactShadows opacity={0.5} scale={10} blur={2} far={4.5} />
          </group>
        </Suspense>

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}
