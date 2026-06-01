import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMLoaderPlugin, VRM } from '@pixiv/three-vrm';
import { motion } from 'framer-motion';
import { AnimationManager } from '../../utils/AnimationManager';

// --- Types ---
interface HitBoxProps {
    onDragStart: (e: any) => void;
    onDrag: (e: any) => void;
    onDragEnd: (e: any) => void;
    onDoubleClick: () => void;
}

// --- Components ---
const HitBox: React.FC<HitBoxProps> = ({ onDragStart, onDrag, onDragEnd, onDoubleClick }) => {
    return (
        <mesh
            position={[0, 1.0, 0]} 
            visible={false} // Invisible Hitbox
            onPointerDown={onDragStart}
            onPointerMove={onDrag}
            onPointerUp={onDragEnd}
            onPointerOut={onDragEnd} // Stop drag if mouse leaves
            onDoubleClick={onDoubleClick}
        >
            <cylinderGeometry args={[0.4, 0.4, 1.8, 8]} />
            <meshBasicMaterial color="red" wireframe />
        </mesh>
    );
};

// --- Scene Setup ---
const Avatar = () => {
    const { scene } = useThree();
    const [vrm, setVrm] = useState<VRM | null>(null);
    const animManager = useMemo(() => new AnimationManager(), []);
    const [isSitting, setIsSitting] = useState(false);

    // Initial Load
    useEffect(() => {
        const loader = new GLTFLoader();
        loader.register((parser: any) => new VRMLoaderPlugin(parser));

        loader.load(
            '/models/Hatsune_Miku.vrm',
            (gltf: any) => {
                const loadedVrm = gltf.userData.vrm;
                setVrm(loadedVrm);
                scene.add(loadedVrm.scene);
                
                // Setup Animation Manager
                animManager.setVRM(loadedVrm);
                
                // Load & Start Animations (Async)
                animManager.loadJumpStartAnimations().then(() => {
                     console.log("Initial Animations Ready");
                     animManager.play('stand'); 
                });
                
                // Fix: Rotate to face camera
                loadedVrm.scene.rotation.y = Math.PI; 
                
                console.log("VRM Loaded Successfully");
            },
            (progress: any) => console.log(`Loading VRM: ${100.0 * (progress.loaded / progress.total)}%`),
            (error: any) => console.error(error)
        );

        return () => {
            if (vrm) scene.remove(vrm.scene);
        };
    }, [scene, animManager]);

    // Animation Loop
    useFrame((_, delta) => {
        if (vrm) {
            vrm.update(delta); // Standard VRM Update
            animManager.update(delta); // Update Animation Mixer
            
            // LookAt Logic (Keep simple for now)
            // If user moves mouse, head follows slightly?
            // implemented in vrm.humanoid?.getNormalizedBoneNode('neck')?.rotation...
            // For now, let's let the animation take priority, or blend later.
        }
    });
    
    // Toggle Sit/Stand on Double Click
    const toggleSit = () => {
        if (isSitting) {
            animManager.play('stand');
            setIsSitting(false);
        } else {
            animManager.play('sit');
            setIsSitting(true);
        }
    };

    return (
        <group position={[0, -1.0, 0]}>
             {/* Hitbox for interaction */}
             <HitBox 
                onDragStart={() => {}} 
                onDrag={() => {}} 
                onDragEnd={() => {}} 
                onDoubleClick={toggleSit} 
             />
        </group>
    );
};

const MikuCanvas = () => {
    // Draggable Window Logic (Simplified via Framer Motion on the container)
    // We lift the state up or use a wrapper.
    const constraintsRef = useRef(null);

    return (
        <div 
            ref={constraintsRef} 
            className="fixed inset-0 pointer-events-none z-50 flex items-end justify-end p-10"
        >
            <motion.div
                drag
                dragConstraints={constraintsRef}
                dragMomentum={false}
                className="pointer-events-auto w-[240px] h-[420px] cursor-grab active:cursor-grabbing"
                style={{ clipPath: "polygon(10% 0%, 90% 0%, 100% 5%, 100% 95%, 90% 100%, 10% 100%, 0% 95%, 0% 5%)" }}
            >
                 <Canvas 
                    camera={{ position: [0, 0.9, 4.5], fov: 30 }}
                    gl={{ alpha: true, antialias: true }} 
                 >
                    <ambientLight intensity={1.0} />
                    <directionalLight position={[1, 1, 1]} intensity={1.5} />
                    <Avatar />
                    <OrbitControls target={[0, 0.85, 0]} enableZoom={false} />
                 </Canvas>
            </motion.div>
        </div>
    );
};

export default MikuCanvas;
