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

// Hover event listener
window.addEventListener('mousemove', onMouseMove, false);

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

function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Update the raycaster
  raycaster.setFromCamera(mouse, camera);
  
  // Check for intersections with letters
  const intersects = raycaster.intersectObjects(letters);
  
  if (intersects.length > 0) {
    const hoveredLetter = intersects[0].object;
    const wordToHighlight = hoveredLetter.userData.wordId;
    
    // If hovering over a different word than before, update highlighting
    if (hoveredWord !== wordToHighlight) {
      hoveredWord = wordToHighlight;
      updateLetterGlow();
    }
  } else {
    // Not hovering over any letter
    if (hoveredWord !== null) {
      hoveredWord = null;
      updateLetterGlow();
    }
  }
}

function updateLetterGlow() {
  letters.forEach(letter => {
    const shouldGlow = (hoveredWord !== null && letter.userData.wordId === hoveredWord);
    
    if (shouldGlow) {
      // Make it glow
      letter.material.emissive.setHex(0xDDA0E8); // change to a purple glow
      letter.material.emissiveIntensity = 0.5;
    } else {
      // Normal state
      letter.material.emissive.setHex(0x003300);
      letter.material.emissiveIntensity = 1;
    }
  });
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


// plane
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
let currentWordIndex = 0; // Track which word to spawn next
let hoveredWord = null; // Track which word is being hovered

function spawnLetters(position) {
  if (!font) {
    console.log('Font not loaded yet');
    return;
  }
  
  // Define navigation options
  const navItems = [
    { text: 'ABOUT ME', url: '/about' },
    { text: 'CONTACT', url: '/contact' },
    { text: 'WORK', url: '/work' }
  ];
  
  // If we've spawned all 3 words, clear everything and restart
  if (currentWordIndex >= navItems.length) {
    clearAllLetters();
    currentWordIndex = 0;
  }
  
  // Get the current word to spawn
  const item = navItems[currentWordIndex];
  const word = item.text;
  
  // Spawn each letter separately
  for (let i = 0; i < word.length; i++) {
    const letter = word[i];
    
    // Create text geometry for single letter
    const textGeometry = new TextGeometry(letter, {
      font: font,
      size: 0.3,
      depth: 0.1,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.01,
      bevelSegments: 5
    });
    
    textGeometry.computeBoundingBox();
    
    // Calculate bounding box BEFORE centering
    const bbox = textGeometry.boundingBox;
    const width = (bbox.max.x - bbox.min.x) || 1;
    const height = (bbox.max.y - bbox.min.y) || 1;
    const depth = (bbox.max.z - bbox.min.z) || 1;
    
    // Center the geometry
    textGeometry.center();
    
    const textMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x2BA3D6,
      emissive: 0xDDA0E8,
      flatShading: false
    });
    
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
    // Create physics body as a box
    const textShape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    const textBody = new CANNON.Body({ 
      mass: 1,
      linearDamping: 0.3,
      angularDamping: 0.3
    });
    textBody.addShape(textShape);
    
    /*
    // Spread letters around the click position
    const spreadRadius = 0.5; // How far apart letters spawn
    const angle = (i / word.length) * Math.PI * 2; // Arrange in a circle
    
    const spawnX = position.x + Math.cos(angle) * spreadRadius;
    const spawnY = 2;
    const spawnZ = position.z + Math.sin(angle) * spreadRadius;
    */

    // Replace the angle/circle code with:
    const spawnX = position.x + (i - word.length / 2) * 0.4;
    const spawnY = 2;
    const spawnZ = position.z;

    textMesh.position.set(spawnX, spawnY, spawnZ);
    textBody.position.set(spawnX, spawnY, spawnZ);
    
    // Add random velocity for each letter
    textBody.velocity.set(
      (Math.random() - 0.5) * 1,
      Math.random() * 3 + 2,
      (Math.random() - 0.5) * 1
    );
    
    // Add some rotation
    textBody.angularVelocity.set(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );

    world.addBody(textBody);

// Store references - ADD wordId to track which spawn this letter belongs to
    textMesh.userData = {
      body: textBody,
      url: item.url,
      word: item.text,
      wordId: `${item.text}_${currentWordIndex}`, // Unique identifier for this word instance
      letter: letter,
      isClickable: true
    };

    scene.add(textMesh);
    letters.push(textMesh);
  }
  
  // Increment counter for next click
  currentWordIndex++;
  console.log(`Spawned "${item.text}" as ${word.length} separate letters (${currentWordIndex}/${navItems.length})`);
}

// Function to clear all letters
function clearAllLetters() {
  console.log('Clearing all letters and restarting...');
  letters.forEach(letter => {
    // Remove from scene
    scene.remove(letter);
    
    // Remove physics body from world
    if (letter.userData.body) {
      world.removeBody(letter.userData.body);
    }
    
    // Dispose geometry and material to free memory
    letter.geometry.dispose();
    letter.material.dispose();
  });
  
  // Clear the array
  letters.length = 0;
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
    