import React, { useMemo } from 'react'
import * as THREE from 'three'
import md5 from 'md5'

const Branch = ({ position, rotation, length, depth, color, hash, index }) => {
  if (depth <= 0) {
    // Рисуем пышные листья на концах
    return (
      <mesh position={position}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
    )
  }

  // Магия хеша: достаем уникальные углы для каждой ветки
  const s1 = parseInt(hash.substring((index % 28), (index % 28) + 2), 16) / 255
  const s2 = parseInt(hash.substring(((index + 5) % 28), ((index + 5) % 28) + 2), 16) / 255

  // Создаем направление ветки
  const end = new THREE.Vector3(0, length, 0)
    .applyEuler(new THREE.Euler(...rotation))
    .add(position)

  // Толщина зависит от глубины (ствол толще)
  const thickness = 0.04 * depth

  return (
    <group>
      <mesh position={position.clone().lerp(end, 0.5)}>
        <quaternion attach="quaternion" setFromUnitVectors={
          new THREE.Vector3(0, 1, 0), 
          end.clone().sub(position).normalize()
        } />
        <cylinderGeometry args={[thickness * 0.7, thickness, length, 8]} />
        <meshStandardMaterial color="#2d1b0d" roughness={0.9} />
      </mesh>
      
      {/* Генерируем 3 новые ветки для объема вместо двух */}
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.4 + s1 * 0.2, rotation[1] + 2.1, rotation[2] + s2 * 0.3]}
        length={length * 0.75}
        depth={depth - 1}
        color={color}
        hash={hash}
        index={index + 1}
      />
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.6, rotation[1] - 2.1, rotation[2] - s1 * 0.5]}
        length={length * 0.7}
        depth={depth - 1}
        color={color}
        hash={hash}
        index={index + 2}
      />
      <Branch 
        position={end} 
        rotation={[rotation[0] - 0.2, rotation[1] + 0.5, rotation[2] + 0.8]}
        length={length * 0.6}
        depth={depth - 1}
        color={color}
        hash={hash}
        index={index + 3}
      />
    </group>
  )
}

export default function Tree({ username }) {
  const hash = useMemo(() => md5(username), [username])
  
  // Цветовая палитра на основе ника
  const hue = parseInt(hash.substring(0, 3), 16) % 360
  const leafColor = `hsl(${hue}, 70%, 75%)`
  
  // Ограничиваем глубину для мобилок (7 - оптимально)
  const maxDepth = 7

  return (
    <group>
      <Branch 
        position={new THREE.Vector3(0, 0, 0)} 
        rotation={[0, 0, 0]} 
        length={1.8} 
        depth={maxDepth} 
        color={leafColor} 
        hash={hash}
        index={0}
      />
      {/* Основание */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.8, 1, 0.1, 32]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  )
}
