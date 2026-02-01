import React, { useMemo } from 'react'
import * as THREE from 'three'
import md5 from 'md5'

const Branch = ({ position, rotation, length, depth, color, hash, index }) => {
  if (depth <= 0) return null

  // Генерируем "кривизну" на основе хеша
  const seed = parseInt(hash.substring(index % 30, (index % 30) + 2), 16) / 255
  const branchRotation = new THREE.Euler(
    (seed - 0.5) * 0.5 + rotation[0],
    rotation[1],
    (seed - 0.5) * 0.5 + rotation[2]
  )

  const end = new THREE.Vector3(0, length, 0)
    .applyEuler(branchRotation)
    .add(position)

  return (
    <group>
      <mesh position={position.clone().lerp(end, 0.5)} quaternion={new THREE.Quaternion().setFromEuler(branchRotation)}>
        <cylinderGeometry args={[0.02 * depth, 0.04 * depth, length, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      
      {/* Рекурсивное ветвление (две ветки) */}
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.4, rotation[1] + 2, rotation[2]]}
        length={length * 0.8}
        depth={depth - 1}
        color={color}
        hash={hash}
        index={index + 1}
      />
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.4, rotation[1] - 2, rotation[2]]}
        length={length * 0.8}
        depth={depth - 1}
        color={color}
        hash={hash}
        index={index + 2}
      />
    </group>
  )
}

export default function Tree({ username }) {
  const hash = useMemo(() => md5(username), [username])
  
  // Параметры из ника
  const hue = parseInt(hash.substring(0, 2), 16) // От 0 до 255
  const treeColor = `hsl(${hue}, 40%, 40%)`
  const depth = Math.min(Math.max(username.length, 5), 8) // Глубина зависит от длины ника

  return (
    <group>
      <Branch 
        position={new THREE.Vector3(0, 0, 0)} 
        rotation={[0, 0, 0]} 
        length={2} 
        depth={depth} 
        color={treeColor} 
        hash={hash}
        index={0}
      />
      {/* Земля/Камень в основании */}
      <mesh position={[0, -0.1, 0]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  )
}
