import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';

export function initScene(width, height) {
  // Camera
  const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10);
  camera.position.set(0, 2, 3);
  camera.lookAt(0, 0, 0);

  // Physics world
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });

  // Scene
  const scene = new THREE.Scene();
  scene.background = null;

  // Raycaster
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Plane geometry
  const planeGeometry = new THREE.PlaneGeometry(20, 20);
  const planeMaterial = new THREE.MeshStandardMaterial({ 
    opacity: 0, 
    transparent: true,
    side: THREE.FrontSide,
    wireframe: false,  // Shows only the edges
   });
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  planeMesh.rotation.x = -Math.PI / 2;
  scene.add(planeMesh);

  // Plane physics
  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  planeMesh.position.copy(groundBody.position);
  planeMesh.quaternion.copy(groundBody.quaternion);

  // Camera pole
  const cameraPole = new THREE.Object3D();
  scene.add(cameraPole);
  cameraPole.add(camera);

  // Lights
  const ambientLight = new THREE.AmbientLight(0x404040);
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 5);
  
  scene.add(hemisphereLight);
  scene.add(directionalLight);
  camera.add(ambientLight);

  // Axes helper (debugging); green = Y, red = X, blue = Z
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '1';
  document.body.appendChild(renderer.domElement);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  // Handle resize
  window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });

  return {
    scene,
    camera,
    renderer,
    world,
    controls,
    raycaster,
    mouse,
    planeMesh,
    groundBody
  };
}