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

// Create background color panel
const backgroundPanel = document.createElement('div');
backgroundPanel.id = 'background-color-panel';
document.body.appendChild(backgroundPanel);

// Add CSS for the background panel
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
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(backgroundStyle);


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
  const backgroundPanel = document.getElementById('background-color-panel');
  const app = window.portfolioApp;
  
  // Color map for different menus
  const colorMap = {
    'main': '#FFFFFF',      // White
    'about': '#FFFF00',     // Yellow
    'contact': '#0088FF',   // Blue
    'work': '#FF0000'       // Red
  };

  app.letters.forEach(letter => {
    const shouldGlow = (app.hoveredWord !== null && letter.userData.wordId === app.hoveredWord);
    
    if (shouldGlow) {
      letter.material.emissive.setHex(0xFF3300);
      letter.material.emissiveIntensity = 1;
      letter.material.wireframe = true;
      
      const edges = letter.children[0];
      if (edges && edges.material) {
        edges.material.color.setHex(0xFF3300);
        edges.material.linewidth = 4;
      }
    } else {
      letter.material.emissive.setHex(0x00CEFF);
      letter.material.emissiveIntensity = 0.5;
      letter.material.wireframe = false;
      
      const edges = letter.children[0];
      if (edges && edges.material) {
        edges.material.color.setHex(0xFFFFFF);
        edges.material.linewidth = 2;
      }
    }
  });

  if (app.hoveredWord !== null) {
    // Find which menu this letter belongs to
    const firstLetter = app.letters.find(l => l.userData.wordId === app.hoveredWord);
    if (firstLetter) {
      const menuLevel = firstLetter.userData.menuLevel;
      const newColor = colorMap[menuLevel] || colorMap['main'];
      
      // Change background color
      backgroundPanel.style.backgroundColor = newColor;
      backgroundPanel.classList.remove('sliding-out');
      backgroundPanel.classList.add('sliding-in');
      
      // Show word
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
        overlayElement.textContent = 'CLICK ON THE PLANE TO SPAWN MORE WORDS!';
        overlayElement.classList.add('default-message');
      }, 400);
    } else {
      overlayElement.textContent = 'CLICK ON THE PLANE TO SPAWN MORE WORDS!';
      overlayElement.classList.add('default-message');
    }
  }
}