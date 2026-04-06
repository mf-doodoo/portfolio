import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import * as CANNON from 'cannon-es';

// CREATE OVERLAY ELEMENT FOR DISPLAYING WORDS ON HOVER
const style = document.createElement('style');
style.textContent = `

@media (max-width: 600px) {
  #word-overlay {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 72px;
    font-weight: bold;
    color: #ffffff;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1000;
    font-family: 'Roboto', sans-serif;
  }
  
  #word-overlay.visible {
    opacity: 1;
  }
}

@media (min-width: 601px) {
  #word-overlay {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 72px;
    font-weight: bold;
    color: #ffffff;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1000;
    font-family: 'Roboto', sans-serif;
  }
}

`;
document.head.appendChild(style);

const overlayElement = document.createElement('div');
overlayElement.id = 'word-overlay';
document.body.appendChild(overlayElement);

const width = window.innerWidth, height = window.innerHeight;

// About overlay
const aboutOverlay = document.createElement('div');
aboutOverlay.id = 'about-overlay';
aboutOverlay.className = 'page-overlay';
aboutOverlay.innerHTML = `
  <button class="close-btn">×</button>
  <div class="overlay-content">
    <h1>ABOUT ME</h1>
    <p>Hi! I'm [Your Name], a [your role/profession].</p>
    <p>I specialize in [your skills]...</p>
    <h2>Skills</h2>
    <ul>
      <li>3D Design & Three.js</li>
      <li>Web Development</li>
      <li>Creative Coding</li>
    </ul>
  </div>
`;
document.body.appendChild(aboutOverlay);

// Contact overlay
const contactOverlay = document.createElement('div');
contactOverlay.id = 'contact-overlay';
contactOverlay.className = 'page-overlay';
contactOverlay.innerHTML = `
  <button class="close-btn">×</button>
  <div class="overlay-content">
    <h1>CONTACT</h1>
    <div class="contact-info">
      <p>Email: <a href="mailto:your@email.com">your@email.com</a></p>
      <p>LinkedIn: <a href="https://linkedin.com/in/yourprofile" target="_blank">Your Profile</a></p>
    </div>
  </div>
`;
document.body.appendChild(contactOverlay);

// Add CSS for overlays
const overlayStyle = document.createElement('style');
overlayStyle.textContent = `
  .page-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(10px);
    display: none;
    z-index: 2000;
    overflow-y: auto;
    padding: 50px 20px;
    box-sizing: border-box;
  }
  
  .page-overlay.visible {
    display: block;
  }
  
  .overlay-content {
    max-width: 800px;
    margin: 0 auto;
    color: #ffffff;
    font-family: Arial, sans-serif;
  }
  
  .overlay-content h1 {
    font-size: 48px;
    margin-bottom: 30px;
    text-shadow: 0 0 20px #ffffff;
  }
  
  .overlay-content h2 {
    font-size: 32px;
    margin-top: 40px;
    margin-bottom: 20px;
  }
  
  .overlay-content p {
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 20px;
  }
  
  .overlay-content ul {
    font-size: 18px;
    line-height: 2;
  }
  
  .overlay-content a {
    color: #ffffff;
    text-decoration: none;
    border-bottom: 1px solid #ffffff;
  }
  
  .overlay-content a:hover {
    text-shadow: 0 0 10px #ffffff;
  }
  
  .close-btn {
    position: fixed;
    top: 80%;
    right: 50%;
    font-size: 50px;
    color: #ffffff;
    cursor: pointer;
    background: none;
    border: none;
    z-index: 2001;
    font-weight: bold;
    line-height: 1;
    padding: 0;
    transition: transform 0.2s;
  }
  
  .close-btn:hover {
    transform: scale(1.2);
    text-shadow: 0 0 20px #ffffff;
  }
  
  .contact-info {
    margin-top: 40px;
    padding-top: 40px;
    border-top: 2px solid #ffffff;
  }
`;
document.head.appendChild(overlayStyle);

// init
const camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 10 );
camera.position.set( 0, 2, 3 );
camera.lookAt(0, 0, 0);

// physics world
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });

//scene
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x27A9F5 );   //  background color

// Raycaster for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Click event listener
window.addEventListener('click', onMouseClick, false);

// Hover event listener
window.addEventListener('mousemove', onMouseMove, false);

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  
  // Check letter clicks first
  const letterIntersects = raycaster.intersectObjects(letters);
  if (letterIntersects.length > 0) {
    const clickedLetter = letterIntersects[0].object;
    const word = clickedLetter.userData.word;
    
    // Handle different actions based on word
    if (word === 'WORK') {
      // Navigate to separate page
      window.location.href = 'work.html';
    } else if (word === 'ABOUT') {
      // Show overlay
      showOverlay('about-overlay');
    } else if (word === 'CONTACT') {
      // Show overlay
      showOverlay('contact-overlay');
    }
    
    return;
  }
  
  // Then check plane clicks
  const planeIntersects = raycaster.intersectObject(mesh);
  if (planeIntersects.length > 0 && font) {
    spawnLetters(planeIntersects[0].point);
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
    const wordToHighlight = hoveredLetter.userData.wordId;  // use wordId to identify which word this letter belongs to 
    
    // Change cursor to pointer (hand)
    document.body.style.cursor = 'pointer';

    // If hovering over a different word than before, update highlighting
    if (hoveredWord !== wordToHighlight) {
      hoveredWord = wordToHighlight;
      updateLetterGlow();
    }
  } else {
    // Not hovering over any letter
    document.body.style.cursor = 'default';  // Reset cursor
    if (hoveredWord !== null) {
      hoveredWord = null;
      updateLetterGlow();
    }
  }
}

// Show overlay and pause 3D rendering
function showOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  overlay.classList.add('visible');
  
  // Pause 3D rendering to save performance
  renderer.setAnimationLoop(null);
  
  // Add close button functionality
  const closeBtn = overlay.querySelector('.close-btn');
  closeBtn.onclick = () => closeOverlay(overlayId);
}

// Close overlay and resume 3D rendering
function closeOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  overlay.classList.remove('visible');
  
  // Resume 3D rendering
  renderer.setAnimationLoop(animate);
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

    // Update overlay text
  if (hoveredWord !== null) {
    // Find the word text from any letter with this wordId
    const firstLetter = letters.find(l => l.userData.wordId === hoveredWord);
    if (firstLetter) {
      overlayElement.textContent = firstLetter.userData.word;
      overlayElement.classList.add('visible');
    }
  } else {
    overlayElement.classList.remove('visible');
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
const planeSize = 20;
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

// Create a gradient texture for more control over toon shading
const gradientTexture = new THREE.DataTexture(
  new Uint8Array([0, 128, 255]), // 3 levels of shading
  3, 1,
  THREE.RedFormat
);
gradientTexture.needsUpdate = true;
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;

const textMaterial = new THREE.MeshToonMaterial({ 
  color: 0x00ff00,
  emissive: 0x003300,
  gradientMap: gradientTexture // Apply the gradient
});

// plane mesh
const geometry = new THREE.PlaneGeometry( 3, 3);
const material = new THREE.MeshToonMaterial({ map: texture, side: THREE.DoubleSide });
const mesh = new THREE.Mesh( geometry, material );
mesh.rotation.x = -Math.PI / 2;  // Rotate plane to be horizontal
scene.add( mesh );

// plane physics body
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // match your mesh tilt
world.addBody(groundBody);

// keep the visual plane aligned with the physics ground
mesh.position.copy(groundBody.position);
mesh.quaternion.copy(groundBody.quaternion);


// example dynamic box physical mesh 
const boxShape = new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25));
const boxBody = new CANNON.Body({ mass: 0.25 });
boxBody.addShape(boxShape);
boxBody.position.set(0, 3, 0);
world.addBody(boxBody);

// create visual mesh for the box
const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const boxMaterial = new THREE.MeshToonMaterial({ color: 0xff0000 });
const meshFromBox = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(meshFromBox);

// lights
const light = new THREE.AmbientLight( 0x404040 ); // soft white ambientlight
//scene.add( light ); // light on the scene
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.3));
camera.add( light ); // light on the camera

// Add after your existing lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// renderer
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( width, height );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// controls (must be after camera and renderer are created)
const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

// Spawn random geometry every few seconds
setInterval(() => {
  const randomPos = {
    x: (Math.random() - 0.5) * 3,
    y: 0,
    z: (Math.random() - 0.5) * 3
  };
  spawnRandomGeometry(randomPos);
}, 3000); // Every 3 seconds

// Array to store letter objects
const letters = [];
let currentWordIndex = 0; // Track which word to spawn next
let hoveredWord = null; // Track which word is being hovered

const wordColors = [
  { base: 0x00ff00, glow: 0x00ff00, emissive: 0x003300 }, // ABOUT ME - Green
  { base: 0x0088ff, glow: 0x00ddff, emissive: 0x002244 }, // CONTACT - Blue
  { base: 0xff0088, glow: 0xff00ff, emissive: 0x440022 }  // WORK - Magenta/Pink
];


function spawnLetters(position) {
  if (!font) {
    console.log('Font not loaded yet');
    return;
  }
  
  // Define navigation options
  const navItems = [
    { text: 'ABOUT', url: '#about_me' },  //has to be ABOUT not ABOUT ME
    { text: 'CONTACT', url: '#contact' },
    { text: 'WORK', url: 'work.html' }
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
    
    const textMaterial = new THREE.MeshToonMaterial({ 
    color: 0x00ff00,
    emissive: 0x003300
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
    
    
    /*/ Spread letters around the click position
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

// Function to spawn random geometrical objects
function spawnRandomGeometry(position) {
  // Array of possible geometries
  const geometries = [
    new THREE.BoxGeometry(0.3, 0.3, 0.3),
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.ConeGeometry(0.2, 0.4, 16),
    new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16),
    new THREE.TorusGeometry(0.15, 0.06, 16, 32),
    new THREE.TetrahedronGeometry(0.25),
    new THREE.OctahedronGeometry(0.2),
    new THREE.IcosahedronGeometry(0.2)
  ];
  
  // Pick a random geometry
  const randomGeometry = geometries[Math.floor(Math.random() * geometries.length)];
  
  // Random color
  const randomColor = Math.random() * 0xffffff;
  
  // Create material
  const material = new THREE.MeshToonMaterial({ 
    color: randomColor,
    emissive: randomColor,
    emissiveIntensity: 0.2
  });
  
  const objectMesh = new THREE.Mesh(randomGeometry, material);
  
  // Create physics body based on geometry type
  let shape;
  if (randomGeometry instanceof THREE.SphereGeometry) {
    shape = new CANNON.Sphere(0.2);
  } else {
    // Use box approximation for other shapes
    shape = new CANNON.Box(new CANNON.Vec3(0.2, 0.2, 0.2));
  }
  
  const objectBody = new CANNON.Body({ 
    mass: 0.5,
    linearDamping: 0.3,
    angularDamping: 0.3
  });
  objectBody.addShape(shape);
  
  // Set spawn position
  const spawnX = position.x + (Math.random() - 0.5) * 2;
  const spawnY = position.y + 2;
  const spawnZ = position.z + (Math.random() - 0.5) * 2;
  
  objectMesh.position.set(spawnX, spawnY, spawnZ);
  objectBody.position.set(spawnX, spawnY, spawnZ);
  
  // Add random velocity
  objectBody.velocity.set(
    (Math.random() - 0.5) * 3,
    Math.random() * 2 + 1,
    (Math.random() - 0.5) * 3
  );
  
  // Add rotation
  objectBody.angularVelocity.set(
    (Math.random() - 0.5) * 5,
    (Math.random() - 0.5) * 5,
    (Math.random() - 0.5) * 5
  );
  
  world.addBody(objectBody);
  
  // Store reference to physics body
  objectMesh.userData = {
    body: objectBody,
    isGeometry: true
  };
  
  scene.add(objectMesh);
  letters.push(objectMesh); // Reuse letters array for now
  
  return objectMesh;
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
    