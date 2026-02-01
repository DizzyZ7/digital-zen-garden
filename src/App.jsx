import React, { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, ContactShadows, Stars } from '@react-three/drei'
import Tree from './components/Tree'

export default function App() {
  const [username, setUsername] = useState('Zen')

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', position: 'relative' }}>
      {/* Интерфейс */}
      <div style={{ position: 'absolute', top: '40px', width: '100%', textAlign: 'center', zIndex: 10 }}>
        <h1 style={{ color: 'white', fontFamily: 'sans-serif', fontWeight: '100', letterSpacing: '8px', margin: 0, fontSize: '24px' }}>
          ZEN GARDEN
        </h1>
        <input 
          type="text" 
          placeholder="GitHub Username"
          onChange={(e) => setUsername(e.target.value || 'Zen')}
          style={{ 
            marginTop: '20px', padding: '10px 15px', 
            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', borderRadius: '5px', textAlign: 'center', outline: 'none',
            fontFamily: 'monospace'
          }} 
        />
      </div>

      <Canvas camera={{ position: [0, 5, 12], fov: 45 }} shadows>
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 5, 25]} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sky sunPosition={[10, 10, 10]} turbidity={0.1} rayleigh={0.5} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        
        <Suspense fallback={null}>
          <group position={[0, -2, 0]}>
            <Tree username={username} />
            <ContactShadows opacity={0.6} scale={20} blur={2.5} far={10} color="#000000" />
          </group>
        </Suspense>

        <OrbitControls 
          makeDefault 
          autoRotate 
          autoRotateSpeed={0.5} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2.1} 
        />
      </Canvas>
    </div>
  )
}
