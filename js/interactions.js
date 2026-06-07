import * as THREE from 'three';
import * as CANNON from 'cannon-es'; 
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { spawnLetters } from './spawners.js';

let font = null;
let camera = null; // Add this to store camera reference

// Load font
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
  const { scene, camera: cam, renderer, world, raycaster, mouse, controls, showOverlay } = config;
  
  camera = cam; // Store camera reference

  window.addEventListener('click', (event) => {
    onMouseClick(event, raycaster, mouse, scene, camera, showOverlay);
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

function onMouseClick(event, raycaster, mouse, scene, camera, showOverlay) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const app = window.portfolioApp;

  // Check letter clicks
  const letterIntersects = raycaster.intersectObjects(app.letters);
  if (letterIntersects.length > 0) {
    const word = letterIntersects[0].object.userData.word;
    
    if (word === 'WORK') {
      window.location.href = 'work.html';
    } else if (word === 'ABOUT') {
      app.showOverlay('about-overlay');
    } else if (word === 'CONTACT') {
      app.showOverlay('contact-overlay');
    }
    return;
  }

  // Check plane click to spawn letters
  const planeIntersects = raycaster.intersectObjects(scene.children);
  if (planeIntersects.length > 0 && font) {
    for (let obj of planeIntersects) {
      if (obj.object.geometry instanceof THREE.PlaneGeometry) {
        spawnLetters(obj.point);
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
    const dragPlane = new THREE.Plane();
    dragPlane.setFromNormalAndCoplanarPoint(
      camera.getWorldDirection(dragPlane.normal),
      app.draggedObject.position
    );
    
    const dragOffset = new THREE.Vector3();
    const dragIntersection = new THREE.Vector3();
    
    raycaster.ray.intersectPlane(dragPlane, dragIntersection);
    const newPosition = dragIntersection.sub(dragOffset);
    newPosition.y = Math.max(newPosition.y, 0.2);
    
    app.draggedObject.position.copy(newPosition);
    if (app.draggedObject.userData.body) {
      app.draggedObject.userData.body.position.copy(newPosition);
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
    controls.enabled = true;
  }
}