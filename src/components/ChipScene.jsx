import { useEffect } from 'react';
import * as THREE from 'three';

export default function ChipScene() {
  useEffect(() => {
    const canvas = document.querySelector('.chip-canvas'); const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 100); camera.position.set(0, 3.2, 11);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); scene.add(new THREE.AmbientLight(0xffffff, 1));
    const light = new THREE.DirectionalLight(0x7dd3fc, 2); light.position.set(4, 6, 5); scene.add(light); const chip = new THREE.Group(); chip.position.set(3.5, .3, 0); chip.rotation.set(.45, -.45, .08); scene.add(chip);
    const add = (geo, mat, y = 0) => { const mesh = new THREE.Mesh(geo, mat); mesh.position.y = y; chip.add(mesh); return mesh; }; add(new THREE.BoxGeometry(5.5, .2, 3.6), new THREE.MeshStandardMaterial({ color: 0x0b1020, metalness: .65, roughness: .35 })); add(new THREE.BoxGeometry(3.5, .28, 2.4), new THREE.MeshStandardMaterial({ color: 0x1a2539, metalness: .9, roughness: .2 }), .24); [-.8, .8].forEach(x => { const die = add(new THREE.BoxGeometry(.78, .1, .78), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x063350, metalness: .9 }), .45); die.position.x = x; });
    let frame; const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; const draw = time => { if (!reduced) chip.rotation.y = -.45 + Math.sin(time * .0003) * .12; camera.lookAt(chip.position); renderer.render(scene, camera); frame = requestAnimationFrame(draw); }; const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }; addEventListener('resize', resize); draw(0); return () => { cancelAnimationFrame(frame); removeEventListener('resize', resize); renderer.dispose(); };
  }, []);
  return <canvas className="chip-canvas" aria-hidden="true" />;
}
