import React, { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, ContactShadows, Text } from '@react-three/drei'
import Tree from './components/Tree'

export default function App() {
  const [username, setUsername] = useState('ZenMaster')

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', position: 'relative' }}>
      {/* UI слой поверх 3D */}
      <div style={{ position: 'absolute', top: '40px', left: '0', right: '0', textAlign: 'center', zIndex: 10, pointerEvents: 'none' }}>
        <h1 style={{ color: 'white', fontFamily: 'sans-serif', fontWeight: '200', letterSpacing: '4px', margin: 0 }}>ZEN GARDEN</h1>
        <input 
          type="text" 
          placeholder="Enter GitHub name"
          onChange={(e) => setUsername(e.target.value || 'ZenMaster')}
          style={{ 
            pointerEvents: 'all', marginTop: '20px', padding: '10px 20px', 
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)',
            color: 'white', borderRadius: '20px', textAlign: 'center', outline: 'none'
          }} 
        />
      </div>

      <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        <Sky sunPosition={[100, 10, 100]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        <Suspense fallback={null}>
          <group position={[0, -2, 0]}>
            <Tree username={username} />
            <ContactShadows opacity={0.6} scale={20} blur={2} far={10} />
          </group>
        </Suspense>

        <OrbitControls minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  )
}
