import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';


const width = window.innerWidth, height = window.innerHeight;

// init
const camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 10 );
camera.position.set( 0, 2, 3 );

//scene
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 );

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
const planeSize = 40;
 const loader = new THREE.TextureLoader();
const texture = loader.load('textures/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
texture.colorSpace = THREE.SRGBColorSpace;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);


// objects
const geometry = new THREE.PlaneGeometry( 3, 2);
const material = new THREE.MeshPhongMaterial( { map: texture, side: THREE.DoubleSide } );
const mesh = new THREE.Mesh( geometry, material );
mesh.rotation.x = Math.PI / 2.5;    // Plane Winkel
scene.add( mesh );

// lights
const light = new THREE.AmbientLight( 0x404040 ); // soft white ambientlight
//scene.add( light ); // light on the scene
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.3));
camera.add( light ); // light on the camera

// renderer
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( width, height );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// controls (must be after camera and renderer are created)
const controls = new OrbitControls( camera, renderer.domElement );
controls.update();



// animation
function animate( time ) {

    //cameraPole.rotation.y = time * 0.001;     // auto-rotate camera around scene

	//mesh.rotation.x = time / 2000;        // rotate the plane X axis
	//mesh.rotation.y = time / 1000;        // rotate the plane Y axis

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

	renderer.render( scene, camera );

}
    