import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const modelCache = {};

// List your own models here — path + a friendly key
const MODEL_PATHS = {
  shapeA: '..\\3d-models\\lowpoly_ardit_head.glb'
  // add as many as you like
};

const HEAD_PATH = '..\\3d-models\\lowpoly_ardit_head.glb'; // <-- your low poly head, kept separate

export function preloadModels() {
  const keys = Object.keys(MODEL_PATHS);
  const promises = keys.map(key => {
    return new Promise((resolve, reject) => {
      loader.load(MODEL_PATHS[key], (gltf) => {
          modelCache[key] = gltf.scene;
          resolve();
        }, undefined, (err) => reject(err)
      );
    });
  });
  return Promise.all(promises);
}

// Separate loader for the head, since it's a single named object, not a random pool
export function preloadHead() {
  return new Promise((resolve, reject) => {
    loader.load(HEAD_PATH, (gltf) => {
      modelCache['head'] = gltf.scene;
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export function getRandomModel() {
  const keys = Object.keys(modelCache);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return modelCache[randomKey].clone(true); // deep clone so instances are independent
}

export function getHeadModel() {
  return modelCache['head'] || null;
}