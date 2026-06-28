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

// CREATE BACKGROUND MENU SYSTEM
const backgroundStyle = document.createElement('style');
backgroundStyle.textContent = `
  #background-menu {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;
    text-align: center;
    font-family: 'Roboto', sans-serif;
    font-weight: bold;
  }

  .menu-item {
    font-size: 48px;
    color: rgba(0, 0, 0, 0.1);
    transition: font-size 0.4s ease, color 0.4s ease, opacity 0.4s ease;
    margin: 20px 0;
    cursor: pointer;
    white-space: nowrap;
  }

  .menu-item.hovered {
    font-size: 64px;
    color: rgba(0, 0, 0, 0.3);
  }

  .menu-item.active {
    font-size: 80px;
    color: rgba(0, 0, 0, 0.6);
    font-weight: 900;
  }

  .menu-item.hidden {
    animation: slideOutLeft 0.5s ease-out forwards;
  }

  @keyframes slideOutLeft {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-100px);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .menu-item.showing {
    animation: slideInLeft 0.5s ease-out forwards;
  }

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
`;
document.head.appendChild(backgroundStyle);

// Create background menu container
const backgroundMenu = document.createElement('div');
backgroundMenu.id = 'background-menu';
const menuItems = ['ABOUT', 'CONTACT', 'WORK'];
menuItems.forEach(item => {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'menu-item';
  itemDiv.textContent = item;
  itemDiv.dataset.menu = item.toLowerCase();
  backgroundMenu.appendChild(itemDiv);
});
document.body.appendChild(backgroundMenu);

// Create background color panel
const backgroundPanel = document.createElement('div');
backgroundPanel.id = 'background-color-panel';
document.body.appendChild(backgroundPanel);

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
  activeMenu: null,  // Track which menu is currently active
  font: null,
  isDragging: false,
  draggedObject: null,
  updateLetterGlow,
  updateBackgroundMenu,
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

// Color map for different menus
const colorMap = {
  'about': '#FFFF00',     // Yellow
  'contact': '#0088FF',   // Blue
  'work': '#FF0000'       // Red
};

function updateBackgroundMenu(hoveredMenu = null, activeMenu = null) {
  const backgroundPanel = document.getElementById('background-color-panel');
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    const menuName = item.dataset.menu;
    
    // If there's an active menu, hide other items
    if (activeMenu) {
      if (menuName === activeMenu) {
        item.classList.remove('hidden');
        item.classList.add('active');
      } else {
        item.classList.add('hidden');
      }
    } else {
      // Show all items, highlight hovered one
      item.classList.remove('hidden', 'active');
      if (menuName === hoveredMenu) {
        item.classList.add('hovered');
      } else {
        item.classList.remove('hovered');
      }
    }
  });
  
  // Update background color
  if (activeMenu) {
    const bgColor = colorMap[activeMenu] || '#FFFFFF';
    backgroundPanel.style.backgroundColor = bgColor;
  } else {
    backgroundPanel.style.backgroundColor = '#FFFFFF';
  }
}

function updateLetterGlow() {
  const app = window.portfolioApp;

  app.letters.forEach(letter => {
    const shouldGlow = (app.hoveredWord !== null && letter.userData.wordId === app.hoveredWord);
    const menuLevel = letter.userData.menuLevel;
    
    if (shouldGlow) {
      // Get color based on menu level
      const glowColor = colorMap[menuLevel] || 0xFFFFFF;
      letter.material.emissive.setHex(glowColor);
      letter.material.emissiveIntensity = 1;
      letter.material.wireframe = true;
      
      const edges = letter.children[0];
      if (edges && edges.material) {
        edges.material.color.setHex(glowColor);
        edges.material.linewidth = 4;
      }
      
      // Update background menu to show hovered item bigger
      if (menuLevel !== 'main' && menuLevel !== 'back') {
        updateBackgroundMenu(menuLevel, null);
      }
    } else {
      letter.material.emissive.setHex(0x000000);
      letter.material.emissiveIntensity = 0.5;
      letter.material.wireframe = false;
      
      const edges = letter.children[0];
      if (edges && edges.material) {
        edges.material.color.setHex(0xFFFFFF);
        edges.material.linewidth = 2;
      }
    }
  });

  // If not hovering, reset background menu
  if (app.hoveredWord === null && !app.activeMenu) {
    updateBackgroundMenu(null, null);
  }
}