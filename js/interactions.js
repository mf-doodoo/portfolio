import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { spawnLetters, clearAllLetters } from './spawners.js';

let font = null;
let camera = null;

const fontLoader = new FontLoader();
fontLoader.load(
  'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
  (loadedFont) => {
    font = loadedFont;
    window.portfolioApp.font = loadedFont;
    console.log('Font loaded');
  }
);

export function setupEventListeners(config) {
  const { scene, camera: cam, renderer, world, raycaster, mouse, controls } = config;
  
  camera = cam;

  window.addEventListener('click', (event) => {
    onMouseClick(event, raycaster, mouse, scene, camera);
  });

  window.addEventListener('mousemove', (event) => {
    onMouseMove(event, raycaster, mouse, controls, scene, camera);
  });

  window.addEventListener('mousedown', (event) => {
    onMouseDown(event, raycaster, mouse, controls, camera);
  });

  window.addEventListener('mouseup', () => {
    onMouseUp(controls);
  });
}

function onMouseClick(event, raycaster, mouse, scene, camera) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const app = window.portfolioApp;

  // Check letter clicks FIRST
  const letterIntersects = raycaster.intersectObjects(app.letters);
  if (letterIntersects.length > 0) {
    const clickedLetter = letterIntersects[0].object;
    const word = clickedLetter.userData.word;
    const menuLevel = clickedLetter.userData.menuLevel;
    const isSubmenu = clickedLetter.userData.isSubmenu;
    const url = clickedLetter.userData.url;
    
    console.log('Clicked letter:', word, 'isSubmenu:', isSubmenu, 'menuLevel:', menuLevel);
    
    // If it's a submenu trigger (WORK from main menu)
    if (isSubmenu && menuLevel === 'main') {
      clearAllLetters();
      // Spawn work submenu at center position
      const centerPos = new THREE.Vector3(0, 0, 0);
      spawnLetters(centerPos, 'work');
    } else if (url) {
      // Navigate to the page
      if (url.startsWith('#')) {
        app.showOverlay(url.substring(1) + '-overlay');
      } else {
        console.log('Navigating to:', url);
        window.location.href = url;
      }
    }
    return;
  }

  // Check plane click to spawn letters (only if not clicking letters)
  const planeIntersects = raycaster.intersectObjects(scene.children);
  if (planeIntersects.length > 0 && font) {
    for (let obj of planeIntersects) {
      if (obj.object.geometry instanceof THREE.PlaneGeometry) {
        spawnLetters(obj.point, 'main');
        break;
      }
    }
  }
}

function onMouseMove(event, raycaster, mouse, controls, scene, camera) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const app = window.portfolioApp;

  // Handle dragging
  if (app.isDragging && app.draggedObject) {
    const dragIntersection = new THREE.Vector3();
    
    raycaster.ray.intersectPlane(app.dragPlane, dragIntersection);
    const newPosition = dragIntersection.sub(app.dragOffset);
    newPosition.y = Math.max(newPosition.y, 0.2);
    
    app.draggedObject.position.copy(newPosition);
    if (app.draggedObject.userData.body) {
      app.draggedObject.userData.body.position.copy(newPosition);
      app.draggedObject.userData.body.velocity.set(0, 0, 0);
      app.draggedObject.userData.body.angularVelocity.set(0, 0, 0);
    }
    
    document.body.style.cursor = 'grabbing';
    return;
  }

  // Check geometry hover
  const geometryIntersects = raycaster.intersectObjects(app.geometryObjects);
  if (geometryIntersects.length > 0) {
    document.body.style.cursor = 'grab';
    return;
  }

  // Check letter hover
  const letterIntersects = raycaster.intersectObjects(app.letters);
  if (letterIntersects.length > 0) {
    document.body.style.cursor = 'pointer';
    const wordToHighlight = letterIntersects[0].object.userData.wordId;
    
    if (app.hoveredWord !== wordToHighlight) {
      app.hoveredWord = wordToHighlight;
      app.updateLetterGlow();
    }
  } else {
    document.body.style.cursor = 'default';
    if (app.hoveredWord !== null) {
      app.hoveredWord = null;
      app.updateLetterGlow();
    }
  }
}

function onMouseDown(event, raycaster, mouse, controls, camera) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const app = window.portfolioApp;
  const intersects = raycaster.intersectObjects(app.geometryObjects);
  
  if (intersects.length > 0 && intersects[0].object.userData.isDraggable) {
    controls.enabled = false;
    
    const dragPlane = new THREE.Plane();
    dragPlane.setFromNormalAndCoplanarPoint(
      camera.getWorldDirection(dragPlane.normal),
      intersects[0].point
    );
    
    const dragOffset = new THREE.Vector3();
    dragOffset.copy(intersects[0].point).sub(intersects[0].object.position);

    app.isDragging = true;
    app.draggedObject = intersects[0].object;
    app.dragPlane = dragPlane;
    app.dragOffset = dragOffset;
  }
}

function onMouseUp(controls) {
  const app = window.portfolioApp;
  
  if (app.isDragging && app.draggedObject) {
    if (app.draggedObject.userData.body) {
      app.draggedObject.userData.body.type = CANNON.Body.DYNAMIC;
    }
    
    app.isDragging = false;
    app.draggedObject = null;
    app.dragPlane = null;
    app.dragOffset = null;
    controls.enabled = true;
  }
}