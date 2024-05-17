import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Variabel global
let camera, renderer, controls, door, doorMixer, clock;
const scene = new THREE.Scene();
let doorOpenAction, doorCloseAction, doorState = 'closed';

// Fungsi untuk inisialisasi
function init() {
  // Kamera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 10);

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Kontrol Orbit
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Clock untuk animasi
  clock = new THREE.Clock();

  // Objek-objek dalam scene
  createSceneObjects();

  // Event listener untuk input keyboard
  document.addEventListener('keydown', onKeyDown);

  // Buat tombol
  createButtons();

  // Mulai animasi
  animate();
}

// Fungsi untuk membuat objek-objek dalam scene
function createSceneObjects() {
  // Lantai
  const floorGeometry = new THREE.PlaneGeometry(10, 10);
  const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Langit-langit
  const ceilingGeometry = new THREE.PlaneGeometry(10, 10);
  const ceilingMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 5;
  scene.add(ceiling);

  // Load texture
  const textureLoader = new THREE.TextureLoader();
  const wallTexture = textureLoader.load('gambar.jpeg');

  // Material with texture
  const wallMaterial = new THREE.MeshBasicMaterial({ map: wallTexture });

  // Create geometry for walls
  const wallGeometry = new THREE.BoxGeometry(10, 5, 0.1);

  // Tembok depan
  const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
  wall1.position.set(0, 2.5, -5);
  scene.add(wall1);

  // Tembok belakang
  const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
  wall2.position.set(0, 2.5, 5);
  scene.add(wall2);

  // Tembok kiri
  const sideWallGeometry = new THREE.BoxGeometry(0.1, 5, 10);
  const wall3 = new THREE.Mesh(sideWallGeometry, wallMaterial);
  wall3.position.set(-5, 2.5, 0);
  scene.add(wall3);

  // Tembok kanan
  const wall4 = new THREE.Mesh(sideWallGeometry, wallMaterial);
  wall4.position.set(5, 2.5, 0);
  scene.add(wall4);

  // Jendela
  const windowGeometry = new THREE.PlaneGeometry(3, 3);
  const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xadd8e6, side: THREE.DoubleSide });
  const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
  windowMesh.position.set(0, 2.5, -4.9);
  scene.add(windowMesh);

  // Pintu
  const doorGeometry = new THREE.BoxGeometry(2, 4, 0.1);
  const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
  door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(-4.9, 2, 0);
  scene.add(door);

  // Handle pintu
  const handleGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.05);
  const handleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const handle = new THREE.Mesh(handleGeometry, handleMaterial);
  handle.position.set(0.9, 0, 0.05);
  door.add(handle);

  // Buat animasi pintu
  doorMixer = new THREE.AnimationMixer(door);

  const openDoorKeyframes = [
    { time: 0, value: 0 },
    { time: 1, value: Math.PI / 2 }
  ];

  const closeDoorKeyframes = [
    { time: 0, value: Math.PI / 2 },
    { time: 1, value: 0 }
  ];

  const doorOpenTrack = new THREE.NumberKeyframeTrack('.rotation[y]', openDoorKeyframes.map(kf => kf.time), openDoorKeyframes.map(kf => kf.value));
  const doorCloseTrack = new THREE.NumberKeyframeTrack('.rotation[y]', closeDoorKeyframes.map(kf => kf.time), closeDoorKeyframes.map(kf => kf.value));

  const openDoorClip = new THREE.AnimationClip('openDoor', 1, [doorOpenTrack]);
  const closeDoorClip = new THREE.AnimationClip('closeDoor', 1, [doorCloseTrack]);

  doorOpenAction = doorMixer.clipAction(openDoorClip);
  doorCloseAction = doorMixer.clipAction(closeDoorClip);

  // Meja
  const woodTexture = new THREE.TextureLoader().load('gambar.jpeg');
  const woodMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
  const tableGeometry = new THREE.BoxGeometry(2, 0.1, 1);
  const table = new THREE.Mesh(tableGeometry, woodMaterial);
  table.position.set(0, 0.5, -4.5);
  scene.add(table);

  // Laptop
  const laptopGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.5);
  const laptopMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
  const laptop = new THREE.Mesh(laptopGeometry, laptopMaterial);
  laptop.position.set(0, 0.55, -4.5);
  scene.add(laptop);

  // Kursi
  const chairGeometry = new THREE.BoxGeometry(1, 1.5, 1);
  const chairMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
  const chair = new THREE.Mesh(chairGeometry, chairMaterial);
  const backrestGeometry = new THREE.BoxGeometry(1, 1, 0.2);
  const backrestMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
  const backrest = new THREE.Mesh(backrestGeometry, backrestMaterial);
  backrest.position.set(0, 0.75, -0.5);
  chair.add(backrest);
  const armrestGeometry = new THREE.BoxGeometry(0.2, 0.75, 0.2);
  const armrestMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
  const armrest1 = new THREE.Mesh(armrestGeometry, armrestMaterial);
  const armrest2 = new THREE.Mesh(armrestGeometry, armrestMaterial);
  armrest1.position.set(0.5, 0.375, -0.5);
  armrest2.position.set(-0.5, 0.375, -0.5);
  chair.add(armrest1);
  chair.add(armrest2);
  const legGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.2);
  const legMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
  const leg1 = new THREE.Mesh(legGeometry, legMaterial);
  const leg2 = new THREE.Mesh(legGeometry, legMaterial);
  const leg3 = new THREE.Mesh(legGeometry, legMaterial);
  const leg4 = new THREE.Mesh(legGeometry, legMaterial);
  leg1.position.set(0.5, -0.75, -0.5);
  leg2.position.set(-0.5, -0.75, -0.5);
  leg3.position.set(0.5, -0.75, 0.5);
  leg4.position.set(-0.5, -0.75, 0.5);
  chair.add(leg1);
  chair.add(leg2);
  chair.add(leg3);
  chair.add(leg4);
  chair.position.set(0, 0.75, -3);
  chair.rotation.y = Math.PI;
  scene.add(chair);

  // Lemari
  const wardrobeGeometry = new THREE.BoxGeometry(2, 4, 1.5);
  const wardrobeMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
  const wardrobe = new THREE.Mesh(wardrobeGeometry, wardrobeMaterial);
  wardrobe.position.set(3, 2, 2);
  scene.add(wardrobe);

  // Kasur
  const bedWidth = 4;
  const bedHeight = 0.2;
  const bedDepth = 2;
  const bedGeometry = new THREE.BoxGeometry(bedWidth, bedHeight, bedDepth);
  const bedTexture = new THREE.TextureLoader().load('gambar3.jpg');
  const bedMaterial = new THREE.MeshBasicMaterial({ map: bedTexture });
  const bed = new THREE.Mesh(bedGeometry, bedMaterial);
  bed.position.set(0, bedHeight / 2, 2);
  scene.add(bed);

  // Bantal
  const pillowGeometry = new THREE.BoxGeometry(1, 0.5, 1.5);
  const pillowTexture = new THREE.TextureLoader().load('path/to/zebra_skin_texture.jpg');
  const pillowMaterial = new THREE.MeshBasicMaterial({ map: pillowTexture });
  const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
  pillow.position.set(0, 0.75, 2);
  scene.add(pillow);

  // Lampu
  const lampGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32);
  const lampMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
  lamp.position.set(0, 4.9, 0);
  scene.add(lamp);
}

// Fungsi untuk membuat tombol
function createButtons() {
  const openButton = document.createElement('button');
  openButton.textContent = 'Open Door';
  openButton.style.position = 'absolute';
  openButton.style.top = '10px';
  openButton.style.left = '10px';
  document.body.appendChild(openButton);
  openButton.addEventListener('click', () => {
    if (doorState === 'closed') {
      doorOpenAction.play();
      doorCloseAction.stop();
      doorState = 'open';
    }
  });

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close Door';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '40px';
  closeButton.style.left = '10px';
  document.body.appendChild(closeButton);
  closeButton.addEventListener('click', () => {
    if (doorState === 'open') {
      doorCloseAction.play();
      doorOpenAction.stop();
      doorState = 'closed';
    }
  });
}

// Fungsi animasi
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  doorMixer.update(delta);

  controls.update();
  renderer.render(scene, camera);
}

// Fungsi event untuk input keyboard
function onKeyDown(event) {
  const speed = 0.1; // Kecepatan pergerakan kamera
  const newPosition = camera.position.clone(); // Salin posisi kamera ke variabel baru

  switch (event.key) {
    case 'w':
      newPosition.z -= speed; // Maju
      break;
    case 's':
      newPosition.z += speed; // Mundur
      break;
    case 'a':
      newPosition.x -= speed; // Ke kiri
      break;
    case 'd':
      newPosition.x += speed; // Ke kanan
      break;
    default:
      break;
  }

  // Deteksi collision dengan tembok
  const raycaster = new THREE.Raycaster(newPosition, camera.getWorldDirection(), 0, 1); // Ray dari posisi kamera ke depan
  const intersects = raycaster.intersectObjects(scene.children.filter(child => child instanceof THREE.Mesh)); // Semua objek dalam adegan

  if (intersects.length === 0) {
    // Jika tidak ada tabrakan, pindahkan kamera ke posisi baru
    camera.position.copy(newPosition);
  }
}

// Panggil fungsi init untuk memulai
init();
