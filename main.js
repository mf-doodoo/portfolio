import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const container = document.getElementById('canvas-container');
if (container) {
    container.appendChild(renderer.domElement);
}

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Create interactive 3D objects
const geometry1 = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
const material1 = new THREE.MeshStandardMaterial({ 
    color: 0x6366f1,
    metalness: 0.7,
    roughness: 0.2
});
const torusKnot = new THREE.Mesh(geometry1, material1);
torusKnot.position.set(-3, 0, 0);
scene.add(torusKnot);

const geometry2 = new THREE.IcosahedronGeometry(1, 0);
const material2 = new THREE.MeshStandardMaterial({ 
    color: 0x8b5cf6,
    metalness: 0.7,
    roughness: 0.2,
    wireframe: true
});
const icosahedron = new THREE.Mesh(geometry2, material2);
icosahedron.position.set(3, 0, 0);
scene.add(icosahedron);

const geometry3 = new THREE.OctahedronGeometry(1.2, 0);
const material3 = new THREE.MeshStandardMaterial({ 
    color: 0xec4899,
    metalness: 0.5,
    roughness: 0.3
});
const octahedron = new THREE.Mesh(geometry3, material3);
octahedron.position.set(0, 0, 0);
scene.add(octahedron);

camera.position.z = 8;

// Mouse interaction
const mouse = { x: 0, y: 0 };
document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate objects
    torusKnot.rotation.x += 0.01;
    torusKnot.rotation.y += 0.01;

    icosahedron.rotation.x += 0.005;
    icosahedron.rotation.y += 0.015;

    octahedron.rotation.x += 0.008;
    octahedron.rotation.y += 0.012;

    // Interactive camera movement based on mouse
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
