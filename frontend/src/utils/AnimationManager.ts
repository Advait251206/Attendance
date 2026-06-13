import * as THREE from 'three';
// @ts-ignore - Types for JSM loaders can be tricky in some setups
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { VRM } from '@pixiv/three-vrm';

export class AnimationManager {
    private mixer: THREE.AnimationMixer | null = null;
    private currentAction: THREE.AnimationAction | null = null;
    private actions: { [name: string]: any } = {}; // Allow AnimationClip OR Custom Pose Object
    private loader: any; 
    private vrm: VRM | null = null;

    constructor() {
        this.loader = new FBXLoader();
    }

    public setVRM(vrm: VRM) {
        this.vrm = vrm;
        this.mixer = new THREE.AnimationMixer(vrm.scene);
    }

    public update(delta: number) {
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }

    public async loadJumpStartAnimations() {
         await this.loadAnimation('stand', '/animations/PET_IDLE.fbx'); 
         // Try loading the Pose JSON for Sit, fallback to FBX if needed (though FBX is broken)
         await this.loadPose('sit', '/animations/pose_sit.json');
         await this.loadAnimation('drag', '/animations/HUS_DRAG.fbx');
    }

    public async loadPose(name: string, url: string): Promise<void> {
        try {
            const response = await fetch(url);
            if (!response.ok) return; // Silent fail if file missing
            const data = await response.json();
            
            this.actions[name] = {
                type: 'pose',
                data: data,
                play: () => this.applyPose(data)
            };
            console.log(`[AnimManager] Loaded Pose: ${name}`);
        } catch (err) {
            console.warn(`[AnimManager] Could not load pose ${name} (might be missing):`, err);
        }
    }



    public async loadAnimation(name: string, url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.loader.load(url, (object: any) => {
                if (object.animations && object.animations.length > 0) {
                    const clip = object.animations[0];
                    const retargetedClip = this.retargetClip(clip);
                    retargetedClip.name = name;
                    this.actions[name] = retargetedClip;
                    console.log(`[AnimManager] Loaded & Retargeted: ${name}`);
                    resolve();
                } else {
                    console.warn(`[AnimManager] No animations found in ${url}`);
                    resolve();
                }
            }, undefined, (error: any) => {
                console.error(`[AnimManager] Error loading ${url}:`, error);
                resolve(); // resolve anyway to not block app
            });
        });
    }

    public play(name: string, fadeDuration: number = 0.5) {
        if (!this.actions[name]) {
            console.warn(`[AnimManager] Cannot play ${name}`);
            return;
        }

        const actionObj = this.actions[name];

        // 1. Is it a Static Pose?
        if (actionObj.type === 'pose') {
            actionObj.play();
            this.currentAction = null; // No mixer action running
            return;
        }

        // 2. It is a Standard Animation Clip
        if (!this.mixer) return;
        
        const newClip = actionObj as THREE.AnimationClip;
        const newAction = this.mixer.clipAction(newClip);

        if (this.currentAction === newAction) return; 

        if (this.currentAction) {
            this.currentAction.fadeOut(fadeDuration);
        }

        newAction.reset().fadeIn(fadeDuration).play();
        this.currentAction = newAction;
    }

    // --- MAGIC: Retargeting ---
    // Maps standard Unity/Mixamo bone names to VRM bone names
    private retargetClip(clip: THREE.AnimationClip): THREE.AnimationClip {
        const tracks: THREE.KeyframeTrack[] = [];
        
        console.log(`[Retarget] Processing Clip: ${clip.name} (Tracks: ${clip.tracks.length})`);

        clip.tracks.forEach((track, index) => {
            const trackName = track.name;
            if (index < 3) console.log(`[Retarget] Sample Track: ${trackName}`); // DEBUG RAW NAME

            // Unity FBX export usually ends with .position or .quaternion
            // The node name is the part before the dot.
            
            // Robot Kyle / Unity Hierarchy usually looks like:
            // "Root|Hips", "Result:Hips", "Hips" etc.
            
            // Simple string matching to find standard Humanoid names
            // and map them to the VRM Humanoid Bone Name (which we resolve dynamically if possible, or mapping)
            
            // Standard VRM/VRoid Bone Names often look like "J_Bip_C_Hips"
            // But VRM0.0 might differ from VRM1.0. 
            // The safest bet for VRM is to map to the VRMHumanoid bone nodes.
            
            // HOWEVER: keyframe tracks work by *Node Name*.
            // We need to change "Kyle_Hips" (in track) to "J_Bip_C_Hips" (in VRM).
            
            // Let's create a simplified mapping based on common names.
            // This is a heuristic.
            
            let nodeName = trackName.split('.')[0];
            const property = trackName.split('.')[1]; // position, quaternion, scale
            
            // Remove prefixes commonly found in Unity exports
            const cleanName = this.cleanBoneName(nodeName);
            
            // Find the corresponding bone in our VRM model
            const vrmBoneNode = this.findVRMBoneNode(cleanName);
            
            if (vrmBoneNode) {
                // Rename the track to use the actual VRM Node Name
                const newTrackName = `${vrmBoneNode.name}.${property}`;
                
                // If it's position, we generally only want to apply it to Hips (Root).
                // Applying position to other bones usually stretches the model because proportions differ.
                if (property === 'position' && !cleanName.toLowerCase().includes('hips')) {
                     // Skip position tracks for non-root bones to preserve bone lengths
                     return; 
                }

                // Create new track with renamed target
                if (track instanceof THREE.VectorKeyframeTrack) {
                    tracks.push(new THREE.VectorKeyframeTrack(newTrackName, track.times as any, track.values as any));
                } else if (track instanceof THREE.QuaternionKeyframeTrack) {
                    tracks.push(new THREE.QuaternionKeyframeTrack(newTrackName, track.times as any, track.values as any));
                }
            }
        });

        return new THREE.AnimationClip(clip.name, clip.duration, tracks);
    }

    private cleanBoneName(name: string): string {
        // Remove mixamorig prefix, or colons
        // "mixamorig:Hips" -> "Hips"
        // "Robot Kyle:Hips" -> "Hips"
        const parts = name.split(':');
        let clean = parts[parts.length - 1];
        
        // Strip other garbage
        clean = clean.replace('mixamorig', '');
        return clean;
    }

    private applyPose(poseData: { bones: { name: string, pos: number[], rot: number[] }[] }) {
        if (!this.vrm) return;
        
        // Stop any running mixer action
        this.mixer?.stopAllAction();

        console.log("[AnimManager] Applying Fixed Pose (Unity -> Three conversion)...");
        let appliedCount = 0;
        poseData.bones.forEach(b => {
             const vrmNode = this.findVRMBoneNode(b.name) || this.vrm!.scene.getObjectByName(b.name);
             if (vrmNode) {
                 // Unity (LH) -> Three.js (RH) Coordinate Conversion
                 // Rotation: Negate X and Y components works for most bone hierarchies
                 vrmNode.quaternion.set(-b.rot[0], -b.rot[1], b.rot[2], b.rot[3]);
                 
                 // Position: Negate X
                 // Only apply to Hips/Root to avoid breaking skeleton proportions
                 if (this.isHips(b.name)) {
                     // Unity Position is usually in meters, same as Three.js
                     vrmNode.position.set(-b.pos[0], b.pos[1], b.pos[2]);
                 }
                 appliedCount++;
             }
        });
        console.log(`[AnimManager] Applied pose to ${appliedCount} / ${poseData.bones.length} bones.`);
    }

    private isHips(name: string): boolean {
        return name.toLowerCase().includes('hips');
    }

    // ... (rest of methods)

    private findVRMBoneNode(boneName: string): THREE.Object3D | undefined {
        if (!this.vrm) return undefined;
        
        let lowerName = boneName.toLowerCase();
        let vrmBoneName = '';

        // Helper to check for left/right
        const isLeft = lowerName.includes('.l') || lowerName.includes('_l') || lowerName.startsWith('left');
        const isRight = lowerName.includes('.r') || lowerName.includes('_r') || lowerName.startsWith('right');

        // Check base names
        if (lowerName.includes('hips')) vrmBoneName = 'hips';
        else if (lowerName.includes('spine')) vrmBoneName = 'spine';
        else if (lowerName.includes('chest')) vrmBoneName = 'chest';
        else if (lowerName.includes('neck')) vrmBoneName = 'neck';
        else if (lowerName.includes('head')) vrmBoneName = 'head';

        // Legs
        else if (lowerName.includes('upper') && lowerName.includes('leg')) {
             vrmBoneName = isLeft ? 'leftUpperLeg' : (isRight ? 'rightUpperLeg' : '');
        }
        else if (lowerName.includes('lower') && lowerName.includes('leg')) {
             vrmBoneName = isLeft ? 'leftLowerLeg' : (isRight ? 'rightLowerLeg' : '');
        }
        else if (lowerName.includes('foot')) {
             vrmBoneName = isLeft ? 'leftFoot' : (isRight ? 'rightFoot' : '');
        }
        else if (lowerName.includes('toes')) {
             vrmBoneName = isLeft ? 'leftToes' : (isRight ? 'rightToes' : '');
        }

        // Arms
        else if (lowerName.includes('shoulder')) {
             vrmBoneName = isLeft ? 'leftShoulder' : (isRight ? 'rightShoulder' : '');
        }
        else if (lowerName.includes('upper') && lowerName.includes('arm')) {
             vrmBoneName = isLeft ? 'leftUpperArm' : (isRight ? 'rightUpperArm' : '');
        }
        else if (lowerName.includes('lower') && lowerName.includes('arm')) {
             vrmBoneName = isLeft ? 'leftLowerArm' : (isRight ? 'rightLowerArm' : '');
        }
        else if (lowerName.includes('hand')) {
             vrmBoneName = isLeft ? 'leftHand' : (isRight ? 'rightHand' : '');
        }

        // Old mixamo fallback
        else if (lowerName.includes('leftupleg') || lowerName.includes('leftthigh')) vrmBoneName = 'leftUpperLeg';
        else if (lowerName.includes('rightupleg') || lowerName.includes('rightthigh')) vrmBoneName = 'rightUpperLeg';
        // ... add others if needed, using the suffix logic covers most Unity exports now

        if (vrmBoneName) {
            // @ts-ignore
            const node = this.vrm.humanoid?.getNormalizedBoneNode(vrmBoneName) as THREE.Object3D | undefined;
            return node;
        } 
        return undefined;
    }
}
