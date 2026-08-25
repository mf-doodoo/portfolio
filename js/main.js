import * as THREE from 'three';
import { initScene } from './scene-setup.js';
import { setupEventListeners } from './interactions.js';
import { createIntro } from './intro.js';
import { createOverlays } from './overlays.js';
import { spawnInitialGeometry } from './spawners.js';
import { createNavUI } from './ui-nav.js';
import { preloadModels, preloadHead, getHeadModel } from './model-loader.js';

const width = window.innerWidth;
const height = window.innerHeight;

// Initialize scene
const sceneData = initScene(width, height);
const { scene, camera, renderer, world, controls, raycaster, mouse } = sceneData;

// Create intro
createIntro();

// Create overlays
createOverlays();
createNavUI();

// CREATE BACKGROUND COLOR PANEL - Add this BEFORE global app state
const backgroundPanel = document.createElement('div');
backgroundPanel.id = 'background-color-panel';
document.body.appendChild(backgroundPanel);

const backgroundStyle = document.createElement('style');
backgroundStyle.textContent = `
  #background-color-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -2;
    background-color: #FFFFFF;
    transition: background-color 0.5s ease;
  }

  #background-color-panel.sliding-in {
    animation: bgSlideIn 0.6s ease-out forwards;
  }

  #background-color-panel.sliding-out {
    animation: bgSlideOut 0.4s ease-in forwards;
  }

  @keyframes bgSlideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes bgSlideOut {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-100%);
    }
  }
`;
document.head.appendChild(backgroundStyle);

window.portfolioApp = {
  scene,
  camera,
  renderer,
  world,
  controls,
  letters: [],
  geometryObjects: [],
  currentWordIndex: 0,
  currentMenuLevel: 'main',
  hoveredWord: null,
  activeMenuColor: '#FFFFFF',  // Add this to track current menu color
  font: null,
  isDragging: false,
  draggedObject: null,
  isOverlayOpen: false,
  isNavOpen: false,
  updateLetterGlow,
  showOverlay,
  closeOverlay
};

// Setup events
setupEventListeners({
  scene,
  camera,
  renderer,
  world,
  raycaster,
  mouse,
  controls
});

// Preload models and spawn initial geometry
preloadModels().then(() => {
  spawnInitialGeometry({
    scene,
    world,
    geometryObjects: window.portfolioApp.geometryObjects
  });
});

preloadHead().then((headMesh) => {
  // Local position is now relative to the camera, not world space.
  // Negative Z = in front of the camera (its forward direction).
  headMesh.position.set(5, 0.3, -20); // Adjusted to be in front of the camera
  headMesh.scale.setScalar(3);

  camera.add(headMesh);   // <-- parent to camera instead of scene.add()
  window.portfolioApp.head = headMesh;
}).catch(err => console.error('Failed to load head model:', err));


const headLookTarget = new THREE.Vector3();
const HEAD_LOOK_DISTANCE = 6; // roughly match the head's local -z offset

// Animation loop
function animate(time) {
  try {
    world.fixedStep();

    // Update letters
    window.portfolioApp.letters.forEach(letter => {
      if (letter.userData.body) {
        letter.position.copy(letter.userData.body.position);
        letter.quaternion.copy(letter.userData.body.quaternion);  // Commented out to keep letters upright
      }
    });

    // Update geometry objects
    window.portfolioApp.geometryObjects.forEach(obj => {
      if (obj.userData.body) {
        obj.position.copy(obj.userData.body.position);
        obj.quaternion.copy(obj.userData.body.quaternion);
      }
    });

    // Head tracking — aim toward mouse position on screen
    const head = window.portfolioApp.head;
    if (head) {
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.at(HEAD_LOOK_DISTANCE, headLookTarget);

      const prevQuat = head.quaternion.clone();
      head.lookAt(headLookTarget);       // computes correct LOCAL rotation, accounting for camera parent
      const targetQuat = head.quaternion.clone();
      head.quaternion.copy(prevQuat);
      head.quaternion.slerp(targetQuat, 0.05);
    }


    controls.update();
    renderer.render(scene, camera);
  } catch (error) {
    console.error('Error in animate() loop:', error);
  }
}

renderer.setAnimationLoop(animate);

// Overlay functions
function showOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  overlay.classList.remove('closing');
  overlay.classList.add('visible');
  renderer.setAnimationLoop(null);

  window.portfolioApp.isOverlayOpen = true;


  const closeBtn = overlay.querySelector('.close-btn');
  closeBtn.onclick = () => closeOverlay(overlayId);
}

function closeOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  overlay.classList.remove('visible');
  overlay.classList.add('closing');

  window.portfolioApp.isOverlayOpen = false;

  setTimeout(() => {
    overlay.classList.remove('closing');
  }, 800);

  renderer.setAnimationLoop(animate);
}

/*function getRandomColor() {
var letters = '0123456789ABCDEF';
var color = '#';
for (var i = 0; i < 6; i++) {
color += letters[Math.floor(Math.random() * 16)];
}
return color;
}*/

function updateLetterGlow() {
  const overlayElement = document.getElementById('word-overlay');
  const backgroundPanel = document.getElementById('background-color-panel');
  const app = window.portfolioApp;

  // Background color map for different menus
  const colorMap = {
    'ABOUT': '#000000',     // Yellow
    'CONTACT': '#000000',   // Blue
    'WORK': '#000000'       // Red
  };

  app.letters.forEach(letter => {
    const shouldGlow = (app.hoveredWord !== null && letter.userData.wordId === app.hoveredWord);

    if (shouldGlow) { // Highlight the letter
      letter.material.emissive.setHex(0xFFFFFF);
      letter.material.emissiveIntensity = 1;
      letter.material.wireframe = true;

      const edges = letter.children[0];
      if (edges && edges.material) {
        edges.material.color.setHex(0xFFFFFF);
        edges.material.linewidth = 4;
      }
    } else { // Reset to default color
      letter.material.emissive.setHex(0x000000);
      letter.material.emissiveIntensity = 0.5;
      letter.material.wireframe = false;

      const edges = letter.children[0];
      if (edges && edges.material) {
        edges.material.color.setHex(0x000000);
        edges.material.linewidth = 2;
      }
    }
  });

  if (app.hoveredWord !== null) {
    const firstLetter = app.letters.find(l => l.userData.wordId === app.hoveredWord);
    if (firstLetter) {
      const newColor = colorMap[firstLetter.userData.word] || '#FFFFFF';

      backgroundPanel.style.backgroundColor = newColor;
      backgroundPanel.classList.remove('sliding-out');
      backgroundPanel.classList.add('sliding-in');

      overlayElement.classList.remove('sliding-out', 'default-message');
      overlayElement.textContent = firstLetter.userData.word;
      overlayElement.classList.add('visible');
    }
  } else {
    // Reset to white background
    backgroundPanel.style.backgroundColor = '#FFFFFF';
    backgroundPanel.classList.remove('sliding-in');
    backgroundPanel.classList.add('sliding-out');

    // Show default message
    if (overlayElement.classList.contains('visible')) {
      overlayElement.classList.add('sliding-out');

      setTimeout(() => {
        overlayElement.classList.remove('visible', 'sliding-out');
        overlayElement.textContent = 'EXPLORE';
        overlayElement.classList.add('default-message');
      }, 400);
    } else {
      overlayElement.textContent = 'EXPLORE';
      overlayElement.classList.add('default-message');
    }
  }
}