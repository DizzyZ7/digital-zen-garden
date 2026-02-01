import React, { useState, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'

const Branch = ({ position, rotation, length, depth, color }) => {
  if (depth <= 0) {
    return (
      <mesh position={position}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
    )
  }

  const end = new THREE.Vector3(0, length, 0)
    .applyEuler(new THREE.Euler(...rotation))
    .add(position)

  const thickness = 0.05 * depth

  return (
    <group>
      <mesh 
        position={position.clone().lerp(end, 0.5)} 
        onUpdate={(self) => {
          self.lookAt(end);
          // Поворачиваем цилиндр, чтобы он смотрел верхушкой вдоль ветки
          self.rotateX(Math.PI / 2);
        }}
      >
        <cylinderGeometry args={[thickness * 0.7, thickness, length, 8]} />
        <meshStandardMaterial color="#1a120b" roughness={0.8} />
      </mesh>
      
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.45, rotation[1] + 2.3, rotation[2]]}
        length={length * 0.72}
        depth={depth - 1}
        color={color}
      />
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.55, rotation[1] - 2.1, rotation[2]]}
        length={length * 0.72}
        depth={depth - 1}
        color={color}
      />
    </group>
  )
}

export default function App() {
  const [text, setText] = useState('Zen')

  const treeColor = useMemo(() => {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash)
    }
    return `hsl(${Math.abs(hash) % 360}, 70%, 75%)`
  }, [text])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center', zIndex: 10 }}>
        <input 
          type="text" 
          onChange={(e) => setText(e.target.value || 'Zen')}
          placeholder="Who are you?"
          style={{ 
            padding: '12px 25px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)', color: 'white', textAlign: 'center', 
            outline: 'none', fontSize: '16px', backdropFilter: 'blur(5px)', letterSpacing: '2px'
          }}
        />
      </div>

      <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={2.5} />
        <Stars radius={100} depth={50} count={6000} factor={4} fade speed={1.5} />
        
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group position={[0, -2, 0]}>
              <Branch position={new THREE.Vector3(0, 0, 0)} rotation={[0, 0, 0]} length={1.8} depth={5} color={treeColor} />
              <ContactShadows opacity={0.5} scale={15} blur={3} far={10} color="#000" />
            </group>
          </Float>
        </Suspense>

        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.4} enableDamping />
      </Canvas>
    </div>
  )
}
