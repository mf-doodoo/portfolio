import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function spawnInitialGeometry(config) {
  const numberOfObjects = Math.floor(Math.random() * 6) + 5;
  
  for (let i = 0; i < numberOfObjects; i++) {
    const randomPos = {
      x: (Math.random() - 0.5) * 5,
      y: 0,
      z: (Math.random() - 0.5) * 5
    };
    spawnRandomGeometry(randomPos, config);
  }
  console.log(`Spawned ${numberOfObjects} geometry objects`);
}

function spawnRandomGeometry(position, config) {
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

  const randomGeometry = geometries[Math.floor(Math.random() * geometries.length)];
  const randomColor = Math.random() * 0xffffff;

  const material = new THREE.MeshToonMaterial({
    color: randomColor,
    emissive: randomColor,
    emissiveIntensity: 0.2
  });

  const objectMesh = new THREE.Mesh(randomGeometry, material);

  let shape;
  if (randomGeometry instanceof THREE.SphereGeometry) {
    shape = new CANNON.Sphere(0.2);
  } else {
    shape = new CANNON.Box(new CANNON.Vec3(0.2, 0.2, 0.2));
  }

  const objectBody = new CANNON.Body({
    mass: 0.5,
    linearDamping: 0.3,
    angularDamping: 0.3
  });
  objectBody.addShape(shape);

  const spawnX = position.x + (Math.random() - 0.5) * 2;
  const spawnY = position.y + 2;
  const spawnZ = position.z + (Math.random() - 0.5) * 2;

  objectMesh.position.set(spawnX, spawnY, spawnZ);
  objectBody.position.set(spawnX, spawnY, spawnZ);

  objectBody.velocity.set(
    (Math.random() - 0.5) * 3,
    Math.random() * 2 + 1,
    (Math.random() - 0.5) * 3
  );

  objectBody.angularVelocity.set(
    (Math.random() - 0.5) * 5,
    (Math.random() - 0.5) * 5,
    (Math.random() - 0.5) * 5
  );

  config.world.addBody(objectBody);

  objectMesh.userData = {
    body: objectBody,
    isGeometry: true,
    isDraggable: true
  };

  config.scene.add(objectMesh);
  config.geometryObjects.push(objectMesh);
}

// Menu structure
const menuStructure = {
  main: [
    { text: 'ABOUT', url: '#about', isSubmenu: false },
    { text: 'CONTACT', url: '#contact', isSubmenu: false },
    { text: 'WORK', url: null, isSubmenu: true }
  ],
  work: [
    { text: '3D ART', url: 'work/3d-art.html', isSubmenu: false },
    { text: 'ILLUSTRATION', url: 'work/illustration.html', isSubmenu: false },
    { text: 'CREATIVE CODING', url: 'work/creative-coding.html', isSubmenu: false }
  ]
};

export function spawnLetters(position, menuLevel = 'main') {
  if (!window.portfolioApp.font) {
    console.log('Font not loaded yet');
    return;
  }

  const navItems = menuStructure[menuLevel] || menuStructure.main;

  // Only clear and increment for main menu
  if (menuLevel === 'main') {
    if (window.portfolioApp.currentWordIndex >= navItems.length) {
      clearAllLetters();
      window.portfolioApp.currentWordIndex = 0;
    }

    const item = navItems[window.portfolioApp.currentWordIndex];
    spawnWord(position, item, menuLevel, window.portfolioApp.currentWordIndex);
    window.portfolioApp.currentWordIndex++;
  } else {
    // For submenu, spawn all items at once
    navItems.forEach((item, index) => {
      spawnWord(position, item, menuLevel, index);
    });
  }

  console.log(`Spawned menu: ${menuLevel}`);
}

function spawnWord(position, item, menuLevel, index) {
  const word = item.text;

  for (let i = 0; i < word.length; i++) {
    const letter = word[i];
    const textGeometry = new TextGeometry(letter, {
      font: window.portfolioApp.font,
      size: 0.3,
      depth: 0.1,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.01,
      bevelSegments: 5
    });

    textGeometry.computeBoundingBox();
    const bbox = textGeometry.boundingBox;
    const width = (bbox.max.x - bbox.min.x) || 1;
    const height = (bbox.max.y - bbox.min.y) || 1;
    const depth = (bbox.max.z - bbox.min.z) || 1;

    textGeometry.center();

    const textMaterial = new THREE.MeshToonMaterial({
      color: 0x000000,
      emissive: 0xFF9CE8
    });

    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    const textShape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    const textBody = new CANNON.Body({
      mass: 1,
      linearDamping: 0.3,
      angularDamping: 0.3
    });
    textBody.addShape(textShape);

    // Space out multiple words when spawning submenu
    let spawnX, spawnZ;
    if (menuLevel === 'work') {
      // Spread work items in a circle
      const angle = (index / 3) * Math.PI * 2;
      spawnX = position.x + Math.cos(angle) * 1.5;
      spawnZ = position.z + Math.sin(angle) * 1.5;
    } else {
      spawnX = position.x + (i - word.length / 2) * 0.4;
      spawnZ = position.z;
    }

    const spawnY = 2;

    textMesh.position.set(spawnX, spawnY, spawnZ);
    textBody.position.set(spawnX, spawnY, spawnZ);

    textBody.velocity.set(
      (Math.random() - 0.5) * 1,
      Math.random() * 3 + 2,
      (Math.random() - 0.5) * 1
    );

    textBody.angularVelocity.set(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );

    window.portfolioApp.world.addBody(textBody);

    textMesh.userData = {
      body: textBody,
      url: item.url,
      word: item.text,
      wordId: `${item.text}_${menuLevel}_${index}`,
      letter: letter,
      isClickable: true,
      menuLevel: menuLevel,
      isSubmenu: item.isSubmenu
    };

    window.portfolioApp.scene.add(textMesh);
    window.portfolioApp.letters.push(textMesh);
  }
}

export function clearAllLetters() {
  console.log('Clearing all letters...');
  window.portfolioApp.letters.forEach(letter => {
    window.portfolioApp.scene.remove(letter);
    if (letter.userData.body) {
      window.portfolioApp.world.removeBody(letter.userData.body);
    }
    letter.geometry.dispose();
    letter.material.dispose();
  });
  window.portfolioApp.letters.length = 0;
}