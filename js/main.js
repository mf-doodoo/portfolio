import * as THREE from 'three';
import { initScene } from './scene-setup.js';
import { setupEventListeners } from './interactions.js';
import { createIntro } from './intro.js';
import { createOverlays } from './overlays.js';
import { spawnInitialGeometry } from './spawners.js';

const width = window.innerWidth;
const height = window.innerHeight;

// Initialize scene
const sceneData = initScene(width, height);
const { scene, camera, renderer, world, controls, raycaster, mouse } = sceneData;

// Create intro
createIntro();

// Create overlays
createOverlays();

// Global app state
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
  font: null,
  isDragging: false,
  draggedObject: null,
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

// Spawn initial geometry
spawnInitialGeometry({
  scene,
  world,
  geometryObjects: window.portfolioApp.geometryObjects
});

// Animation loop
function animate(time) {
  world.fixedStep();
  
  // Update letters
  window.portfolioApp.letters.forEach(letter => {
    if (letter.userData.body) {
      letter.position.copy(letter.userData.body.position);
      letter.quaternion.copy(letter.userData.body.quaternion);
    }
  });

  // Update geometry objects
  window.portfolioApp.geometryObjects.forEach(obj => {
    if (obj.userData.body) {
      obj.position.copy(obj.userData.body.position);
      obj.quaternion.copy(obj.userData.body.quaternion);
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Overlay functions
function showOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  overlay.classList.remove('closing');
  overlay.classList.add('visible');
  renderer.setAnimationLoop(null);
  
  const closeBtn = overlay.querySelector('.close-btn');
  closeBtn.onclick = () => closeOverlay(overlayId);
}

function closeOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  overlay.classList.remove('visible');
  overlay.classList.add('closing');
  
  setTimeout(() => {
    overlay.classList.remove('closing');
  }, 800);
  
  renderer.setAnimationLoop(animate);
}

function updateLetterGlow() {
  const overlayElement = document.getElementById('word-overlay');
  const app = window.portfolioApp;
  
  app.letters.forEach(letter => {
    const shouldGlow = (app.hoveredWord !== null && letter.userData.wordId === app.hoveredWord);
    
    if (shouldGlow) {
      letter.material.emissive.setHex(0xFF3300);
      letter.material.emissiveIntensity = 1;
    } else {
      letter.material.emissive.setHex(0x00CEFF);
      letter.material.emissiveIntensity = 1;
    }
  });

  if (app.hoveredWord !== null) {
    // Show hovered word
    const firstLetter = app.letters.find(l => l.userData.wordId === app.hoveredWord);
    if (firstLetter) {
      overlayElement.textContent = firstLetter.userData.word;
      overlayElement.classList.remove('default-message');
      overlayElement.classList.add('visible');
    }
  } else {
    // Show default message
    overlayElement.textContent = 'CLICK ON THE PLANE TO SPAWN MORE WORDS!';
    overlayElement.classList.remove('visible');
    overlayElement.classList.add('default-message');
  }
}