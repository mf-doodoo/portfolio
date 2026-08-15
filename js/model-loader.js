import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const modelCache = {};

// List your own models here — path + a friendly key
const MODEL_PATHS = {
  shapeA: 'models/shape-a.glb',
  shapeB: 'models/shape-b.glb',
  shapeC: 'models/shape-c.glb',
  // add as many as you like
};

export function preloadModels() {
  const keys = Object.keys(MODEL_PATHS);
  const promises = keys.map(key => {
    return new Promise((resolve, reject) => {
      loader.load(
        MODEL_PATHS[key],
        (gltf) => {
          modelCache[key] = gltf.scene;
          resolve();
        },
        undefined,
        (err) => reject(err)
      );
    });
  });
  return Promise.all(promises);
}

export function getRandomModel() {
  const keys = Object.keys(modelCache);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return modelCache[randomKey].clone(true); // deep clone so instances are independent
}