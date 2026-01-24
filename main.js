import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import * as CANNON from 'cannon-es';

const width = window.innerWidth, height = window.innerHeight;

// init
const camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 10 );
camera.position.set( 0, 2, 3 );
camera.lookAt(0, 0, 0);

// physics world
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });

//scene
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 );

// Raycaster for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Click event listener
window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Update the raycaster
  raycaster.setFromCamera(mouse, camera);
  
  // Check for intersections with the plane
  const intersects = raycaster.intersectObject(mesh);
  
  if (intersects.length > 0) {
    const point = intersects[0].point;
    console.log('Clicked on plane at:', point);
    if (font) {
      spawnLetters(point);
    }
  }
}


// put the camera on a pole (parent it to an object)
// so we can spin the pole to move the camera around the scene
const cameraPole = new THREE.Object3D();
scene.add(cameraPole);
cameraPole.add(camera);


// responsive size
window.addEventListener('resize', () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
});

//load textures
const planeSize = 40;
 const loader = new THREE.TextureLoader();
const texture = loader.load('textures/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
texture.colorSpace = THREE.SRGBColorSpace;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);

// Font loader for 3D text
const fontLoader = new FontLoader();
let font = null;

// Load font
fontLoader.load(
  'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
  function (loadedFont) {
    font = loadedFont;
    console.log('Font loaded successfully');
  },
  function (progress) {
    console.log('Font loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
  },
  function (error) {
    console.error('Error loading font:', error);
  }
);


// objects
const geometry = new THREE.PlaneGeometry( 3, 3);
const material = new THREE.MeshPhongMaterial( { map: texture, side: THREE.DoubleSide } );
const mesh = new THREE.Mesh( geometry, material );
mesh.rotation.x = -Math.PI / 2;  // Rotate plane to be horizontal
scene.add( mesh );

const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // match your mesh tilt
world.addBody(groundBody);

// keep the visual plane aligned with the physics ground
mesh.position.copy(groundBody.position);
mesh.quaternion.copy(groundBody.quaternion);

// example dynamic box
const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
const boxBody = new CANNON.Body({ mass: 1 });
boxBody.addShape(boxShape);
boxBody.position.set(0, 3, 0);
world.addBody(boxBody);

// create visual mesh for the box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const meshFromBox = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(meshFromBox);


// lights
const light = new THREE.AmbientLight( 0x404040 ); // soft white ambientlight
//scene.add( light ); // light on the scene
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.3));
camera.add( light ); // light on the camera

// renderer
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( width, height );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// controls (must be after camera and renderer are created)
const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

// Array to store letter objects
const letters = [];

function spawnLetters(position) {
  if (!font) {
    console.log('Font not loaded yet');
    return;
  }
  
  // Define navigation options
  const navItems = [
    { text: 'ABOUT', url: '/about' },
    { text: 'CONTACT', url: '/contact' },
    { text: 'WORK', url: '/work' }
  ];
  
  navItems.forEach((item, index) => {
    // Create text geometry
    const textGeometry = new TextGeometry(item.text, {
      font: font,
      size: 0.3,
      height: 0.1,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.01,
      bevelSegments: 5
    });
    
    textGeometry.computeBoundingBox();
    textGeometry.center();
    
    const textMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      emissive: 0x003300
    });
    
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
        // Calculate bounding box for physics body
    const bbox = textGeometry.boundingBox;
    const width = bbox.max.x - bbox.min.x;
    const height = bbox.max.y - bbox.min.y;
    const depth = bbox.max.z - bbox.min.z;
    
    // Create physics body as a box
    const textShape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    const textBody = new CANNON.Body({ 
      mass: 1,
      linearDamping: 0.3,
      angularDamping: 0.3
    });
    textBody.addShape(textShape);


    // Position above click point with some spacing
    textMesh.position.set(
      position.x + (index - 1) * 1.5,
      position.y + 2,
      position.z
    );
    
    // Add some initial velocity for more dynamic effect
    textBody.velocity.set(
      (Math.random() - 0.5) * 2,
      Math.random() * 2 + 1,
      (Math.random() - 0.5) * 2
    );

    world.addBody(textBody);

    // Store references
    textMesh.userData = {
      body: textBody,
      url: item.url,
      isClickable: true
    };
    
    scene.add(textMesh);
    letters.push(textMesh);
  });
}

// animation
function animate( time ) {

    // Step physics
  world.fixedStep();
  
  // Update box
  meshFromBox.position.copy(boxBody.position);
  meshFromBox.quaternion.copy(boxBody.quaternion);
  
  // Update all letters to match their physics bodies
  letters.forEach(letter => {
    if (letter.userData.body) {
      letter.position.copy(letter.userData.body.position);
      letter.quaternion.copy(letter.userData.body.quaternion);
    }
  });

  controls.update();
  renderer.render(scene, camera);

}
    