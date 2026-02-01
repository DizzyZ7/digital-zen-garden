import React, { useMemo } from 'react'
import * as THREE from 'three'

const Branch = ({ position, rotation, length, depth }) => {
  if (depth <= 0) {
    return (
      <mesh position={position}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color="pink" />
      </mesh>
    )
  }

  const end = new THREE.Vector3(0, length, 0)
    .applyEuler(new THREE.Euler(...rotation))
    .add(position)

  return (
    <group>
      <mesh position={position.clone().lerp(end, 0.5)}>
        <quaternion attach="quaternion" setFromUnitVectors={
          new THREE.Vector3(0, 1, 0), 
          end.clone().sub(position).normalize()
        } />
        <cylinderGeometry args={[0.02 * depth, 0.03 * depth, length, 6]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.5, rotation[1] + 2, rotation[2]]}
        length={length * 0.7}
        depth={depth - 1}
      />
      <Branch 
        position={end} 
        rotation={[rotation[0] + 0.5, rotation[1] - 2, rotation[2]]}
        length={length * 0.7}
        depth={depth - 1}
      />
    </group>
  )
}

const Tree = ({ username }) => {
  return (
    <Branch 
      position={new THREE.Vector3(0, 0, 0)} 
      rotation={[0, 0, 0]} 
      length={1.5} 
      depth={4} // Совсем маленькая глубина для теста
    />
  )
}

export default Tree
