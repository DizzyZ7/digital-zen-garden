import React, { useMemo } from 'react'
import * as THREE from 'three'
import md5 from 'md5'

// Оптимизация: создаем один материал для всех веток
const barkMat = new THREE.MeshStandardMaterial({ color: '#1a120b', roughness: 0.9 })

const Branch = ({ position, rotation, length, depth, color, hash, index }) => {
  // База: рисуем листья на концах
  if (depth <= 0) {
    return (
      <mesh position={position}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5} 
          roughness={1} 
        />
      </mesh>
    )
  }

  // Направление ветки на основе эйлеровых углов
  const end = new THREE.Vector3(0, length, 0)
    .applyEuler(new THREE.Euler(...rotation))
    .add(position)

  const thickness = 0.06 * depth

  // Извлекаем "гены" из хеша для углов наклона
  const s1 = parseInt(hash.substring((index % 30), (index % 30) + 1), 16) / 16
  const s2 = parseInt(hash.substring(((index + 2) % 30), ((index + 2) % 30) + 1), 16) / 16

  return (
    <group>
      <mesh position={position.clone().lerp(end, 0.5)}>
        <quaternion attach="quaternion" setFromUnitVectors={
          new THREE.Vector3(0, 1, 0), 
          end.clone().sub(position).normalize()
        } />
        <cylinderGeometry args={[thickness * 0.6, thickness, length, 7]} />
        <primitive object={barkMat} attach="material" />
      </mesh>
      
      {/* Рекурсия: левая и правая ветви */}
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.4 + s1 * 0.2, rotation[1] + 2.5, rotation[2]]}
        length={length * 0.75}
        depth={depth - 1}
        color={color}
        hash={hash}
        index={index + 1}
      />
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.4, rotation[1] - 2.5, rotation[2] + s2 * 0.2]}
        length={length * 0.75}
        depth={depth - 1}
        color={color}
        hash={hash}
        index={index + 2}
      />
    </group>
  )
}

const Tree = ({ username }) => {
  const hash = useMemo(() => md5(username.toLowerCase().trim()), [username])
  
  // Определяем цвет листьев по первым символам хеша
  const hue = parseInt(hash.substring(0, 2), 16) * 1.4 // Распределяем по спектру
  const leafColor = `hsl(${hue}, 60%, 65%)`

  return (
    <group>
      <Branch 
        position={new THREE.Vector3(0, 0, 0)} 
        rotation={[0, 0, 0]} 
        length={1.8} 
        depth={5} // Глубина 5 оптимальна для телефонов
        color={leafColor} 
        hash={hash}
        index={0}
      />
      {/* Основание-камень */}
      <mesh position={[0, -0.1, 0]}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  )
}

export default React.memo(Tree)
