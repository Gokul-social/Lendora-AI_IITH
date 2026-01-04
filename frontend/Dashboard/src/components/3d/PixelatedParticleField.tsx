/**
 * Lendora AI - Pixelated Particle Field
 * Pixelated space stars with smooth motion
 */

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { useTheme } from 'next-themes';
import * as THREE from 'three';

interface PixelatedParticleFieldProps {
    count?: number;
}

export function PixelatedParticleField({ count = 5000 }: PixelatedParticleFieldProps) {
    const pointsRef = useRef<THREE.Points>(null);
    const { theme } = useTheme();
    const { mouse, viewport } = useThree();

    // Generate pixelated-style particle positions
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            // Create a more structured space field
            const radius = 5 + Math.random() * 25;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Vary sizes for depth effect
            sizes[i] = Math.random() * 0.15 + 0.05;
        }

        return { positions, sizes };
    }, [count]);

    // Smooth animation loop
    useFrame((state) => {
        if (!pointsRef.current) return;

        const time = state.clock.elapsedTime;

        // Smooth, slow rotation for space effect
        pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
        pointsRef.current.rotation.y = time * 0.05;

        // Mouse-reactive movement (smoother)
        const targetX = mouse.x * 0.1;
        const targetY = mouse.y * 0.1;
        
        pointsRef.current.rotation.x += (targetY - pointsRef.current.rotation.x) * 0.05;
        pointsRef.current.rotation.y += (targetX - pointsRef.current.rotation.y) * 0.05;
    });

    const isDark = theme === 'dark';

    return (
        <Points
            ref={pointsRef}
            positions={particles.positions}
            stride={3}
            frustumCulled={false}
        >
            <PointMaterial
                transparent
                color={isDark ? "#ffffff" : "#f0f0ff"}
                size={0.06}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={isDark ? 0.7 : 0.5}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

