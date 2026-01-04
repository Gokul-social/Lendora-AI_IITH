/**
 * Lendora AI - Agent Status Orb
 * 3D pulsing sphere showing AI agent status in real-time
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface AgentStatusOrbProps {
    status: 'profiting' | 'negotiating' | 'idle' | 'error';
}

const STATUS_COLORS = {
    profiting: '#00FF88',    // Profit green
    negotiating: '#FFA500',  // Amber
    idle: '#0080FF',         // Electric blue
    error: '#FF3366',        // Loss red
};

export function AgentStatusOrb({ status }: AgentStatusOrbProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current || !glowRef.current) return;

        const time = state.clock.elapsedTime;

        // Pulsing animation
        const pulse = Math.sin(time * 2) * 0.1 + 1;
        meshRef.current.scale.setScalar(pulse);
        glowRef.current.scale.setScalar(pulse * 1.2);

        // Slow rotation
        meshRef.current.rotation.y += 0.01;

        // Intensity pulse for glow
        const glowMaterial = glowRef.current.material as THREE.MeshStandardMaterial;
        glowMaterial.emissiveIntensity = pulse;
    });

    const color = STATUS_COLORS[status];

    return (
        <group>
            {/* Main sphere */}
            <Sphere ref={meshRef} args={[1, 32, 32]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={1.5}
                    metalness={0.8}
                    roughness={0.2}
                />
            </Sphere>

            {/* Glow halo */}
            <Sphere ref={glowRef} args={[1.2, 32, 32]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={1}
                    transparent
                    opacity={0.3}
                />
            </Sphere>

            {/* Point light emanating from orb */}
            <pointLight
                position={[0, 0, 0]}
                color={color}
                intensity={2}
                distance={10}
            />
        </group>
    );
}
