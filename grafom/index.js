import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let camera, renderer, controls, clock;
const scene = new THREE.Scene();
let door, doorMixer, doorOpenAction, doorCloseAction, doorState = 'closed';
let laptopMixer, laptopOpenAction, laptopCloseAction, laptopState = 'closed';
let laptopTop;

function init() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 10);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Warna putih (0xffffff) dengan intensitas 0.5
  scene.add(ambientLight);

  clock = new THREE.Clock();

  createSceneObjects();

  document.addEventListener('keydown', onKeyDown);

  createButtons();
  loadChairGLTF();
  loadBedGLTF();
  loadDrawerGLTF();
  loadBabyLolaGLTF();
  loadLampGLTF(); // Panggil fungsi untuk memuat lampu GLTF
  loadACGLTF();
  loadTableGLTF(); 
  loadMonitorGLTF();
  loadWirelessChargerGLTF();
  animate();
}

function createSceneObjects() {
  const floorGeometry = new THREE.PlaneGeometry(10, 10);
  const floorTexture = new THREE.TextureLoader().load('lantai.jpeg');
  const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const ceilingGeometry = new THREE.PlaneGeometry(10, 10);
  const ceilingMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 5;
  scene.add(ceiling);

  const textureLoader = new THREE.TextureLoader();
  const wallTexture = textureLoader.load('wallpaper.jpeg');
  const wallMaterial = new THREE.MeshBasicMaterial({ map: wallTexture });
  const wallGeometry = new THREE.BoxGeometry(10, 5, 0.1);

  const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
  wall1.position.set(0, 2.5, -5);
  scene.add(wall1);

  const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
  wall2.position.set(0, 2.5, 5);
  scene.add(wall2);

  const sideWallGeometry = new THREE.BoxGeometry(0.1, 5, 10);
  const wall4 = new THREE.Mesh(sideWallGeometry, wallMaterial);
  wall4.position.set(5, 2.5, 0);
  scene.add(wall4);

  const windowGeometry = new THREE.PlaneGeometry(3, 3);
  const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xadd8e6, side: THREE.DoubleSide });
  const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
  windowMesh.position.set(0, 2.5, -4.9);
  scene.add(windowMesh);

  const doorGeometry = new THREE.BoxGeometry(2, 4, 0.1);
  const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
  door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(-4.9, 2, 0);

  // Set pivot point pintu ke tepi
  const pivotPosition = new THREE.Vector3(-1, 2, 0); // Misalnya, di sisi kiri pintu
  door.geometry.translate(pivotPosition.x, pivotPosition.y, pivotPosition.z);
  door.position.sub(pivotPosition);

  // scene.add(door);

  const handleGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.05);
  const handleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const handle = new THREE.Mesh(handleGeometry, handleMaterial);
  handle.position.set(0.9, 0, 0.05);
  door.add(handle);

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
  let doorOpenAction, doorCloseAction, doorState = 'closed';
  let laptopOpenAction, laptopCloseAction, laptopState = 'closed';

  const woodTexture = new THREE.TextureLoader().load('gambar5.jpg');
  const woodMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
  const tableGeometry = new THREE.BoxGeometry(4, 0.1, 2.1);
  const table = new THREE.Mesh(tableGeometry, woodMaterial);
  table.position.set(0, 0.5, -4.5);
  // scene.add(table);

  const laptopBaseGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.5);
  const laptopMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
  const laptopBase = new THREE.Mesh(laptopBaseGeometry, laptopMaterial);
  laptopBase.position.set(0, 0.55, -4.5);
  scene.add(laptopBase);

  const laptopTopGeometry = new THREE.BoxGeometry(0.8, 0.02, 0.5);
  laptopTop = new THREE.Mesh(laptopTopGeometry, laptopMaterial);
  laptopMixer = new THREE.AnimationMixer(laptopTop);
  // laptopTop.position.set(0, 0.58, -4.75);
  // scene.add(laptopTop);

  laptopMixer = new THREE.AnimationMixer(laptopTop);

  const openLaptopKeyframes = [
    { time: 0, value: 0 },
    { time: 1, value: -Math.PI / 2 }
  ];

  const closeLaptopKeyframes = [
    { time: 0, value: -Math.PI / 2 },
    { time: 1, value: 0 }
  ];

  const openLaptopTrack = new THREE.NumberKeyframeTrack('.rotation[x]', openLaptopKeyframes.map(kf => kf.time), openLaptopKeyframes.map(kf => kf.value));
  const closeLaptopTrack = new THREE.NumberKeyframeTrack('.rotation[x]', closeLaptopKeyframes.map(kf => kf.time), closeLaptopKeyframes.map(kf => kf.value));

  const openLaptopClip = new THREE.AnimationClip('openLaptop', 1, [openLaptopTrack]);
  const closeLaptopClip = new THREE.AnimationClip('closeLaptop', 1, [closeLaptopTrack]);

  laptopOpenAction = laptopMixer.clipAction(openLaptopClip);
  laptopCloseAction = laptopMixer.clipAction(closeLaptopClip);

//lemari
  const wardrobeGeometry = new THREE.BoxGeometry(2, 4, 1.5);
  const wardrobeMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
  const wardrobe = new THREE.Mesh(wardrobeGeometry, wardrobeMaterial);
  wardrobe.position.set(4.5, 2, -4); // Ubah posisi untuk menempatkannya di pojok kanan belakang
  wardrobe.rotation.y = -Math.PI / 2; // Putar lemari agar menghadap ke dalam ruangan
  scene.add(wardrobe);
  
  const lampGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32);
  const lampMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
  lamp.position.set(0, 4.9, 0);
  scene.add(lamp);
  
  loadGLTF();
}

function loadGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    './laptop/scene.gltf', // Ganti dengan lokasi file GLTF laptop Anda
    (gltf) => {
      const laptopModel = gltf.scene;
      laptopModel.position.set(-1.5, 1.7, -3.7); // Sesuaikan posisi laptop sesuai kebutuhan Anda

      // Mengatur skala model
      const scaleFactor = 0.5; // Faktor skala yang diinginkan
      laptopModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      scene.add(laptopModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.error('An error happened', error);
    }
  );
}

function loadChairGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    './kursi/scene.gltf', // Lokasi file GLTF kursi yang sudah disiapkan
    (gltf) => {
      const chairModel = gltf.scene;

      // Sesuaikan posisi kursi sesuai kebutuhan Anda
      chairModel.position.set(-1.5, 0, -2.5); 

      // Mengatur rotasi model (rotasi 180 derajat)
      chairModel.rotation.y = Math.PI; 

      // Mengatur skala model
      const scaleFactor = 0.06; // Faktor skala yang diinginkan (sebelumnya 0.5, sekarang 0.25)
      chairModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      scene.add(chairModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.error('An error happened', error);
    }
  );
}

function loadBedGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    './kasur_1/scene.gltf', // Path ke file GLTF kasur
    (gltf) => {
      const bedModel = gltf.scene;
      bedModel.position.set(3, 0, 3.5); // Sesuaikan posisi sesuai kebutuhan
      
      // Perbesar kasur 2x
      bedModel.scale.set(2, 2, 2);

      // Putar posisi kasur 90 derajat dari posisi sekarang
      bedModel.rotation.y += Math.PI / 1; // Tambahkan 90 derajat

      scene.add(bedModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.error('An error happened', error);
    }
  );
}



function loadLampGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    './smart_lamp/scene.gltf', // Path to your GLTF lamp file
    (gltf) => {
      const lampModel = gltf.scene;
      lampModel.position.set(-2.7, 1.7, -4.1); // Adjust the position to be on the table and beside the laptop

      // Adjust the scale if necessary
      const scaleFactor = 0.5; // Desired scale factor
      lampModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      scene.add(lampModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.error('An error happened', error);
    }
  );
}
function loadBabyLolaGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    './baby_yoda_free_3d_by_oscar_creativo/scene.gltf', // Path to your GLTF Baby Lola file
    (gltf) => {
      const babyLolaModel = gltf.scene;
      babyLolaModel.position.set(-2.7, 2.1, -3.7); // Adjust the position to place it on the table

      // Adjust the scale if necessary
      const scaleFactor = 0.1; // Desired scale factor
      babyLolaModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      scene.add(babyLolaModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.error('An error happened', error);
    }
  );
}
function loadACGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    './ac/scene.gltf', // Path to your GLTF AC file
    (gltf) => {
      const acModel = gltf.scene;
      acModel.position.set(3, 4.5, -4.9); // Position it in the corner and high up on the wall

      // Adjust the scale if necessary
      const scaleFactor = 1.5; // Desired scale factor
      acModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      scene.add(acModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.error('An error happened', error);
    }
  );
}
function loadTableGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    './meja/scene.gltf', // Ganti dengan lokasi file GLTF meja Anda
    (gltf) => {
      const tableModel = gltf.scene;
      tableModel.position.set(0, 0, -3.1); // Sesuaikan posisi meja sesuai kebutuhan Anda

      // Mengatur skala model
      const scale = 0.05; // Sesuaikan skala sesuai kebutuhan Anda
      tableModel.scale.set(scale, scale, scale);

      // Tambahkan model meja ke dalam scene
      scene.add(tableModel);

      // Tambahkan slider atau kontrol lain untuk mengubah skala
      addScaleControls(tableModel);
    },
    undefined,
    (error) => {
      console.error('An error happened while loading the GLTF model', error);
    }
  );
}

function addScaleControls(model) {
  const scaleInput = document.createElement('input');
  scaleInput.type = 'range';
  scaleInput.min = '0.01';
  scaleInput.max = '2.0';
  scaleInput.step = '0.01';
  scaleInput.value = model.scale.x; // Asumsikan skala awal sama untuk x, y, z

  scaleInput.addEventListener('input', (event) => {
    const scale = parseFloat(event.target.value);
    model.scale.set(scale, scale, scale);
  });

  document.body.appendChild(scaleInput);
}

function loadMonitorGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    './monitor/scene.gltf', // Lokasi file GLTF monitor yang sudah disiapkan
    (gltf) => {
      const monitorModel = gltf.scene;

      // Hitung posisi monitor berdasarkan ukuran meja
      const tableBox = new THREE.Box3().setFromObject(tableModel);
      const tableHeight = tableBox.max.y - tableBox.min.y;

      // Sesuaikan posisi monitor agar berada di atas meja dan menempel di tembok
      monitorModel.position.set(0, tableHeight + 0.3, tableBox.min.z - 0.1); // Sesuaikan posisi monitor sesuai kebutuhan Anda

      // Mengatur skala model
      const scaleFactor = 0.5; // Faktor skala yang diinginkan
      monitorModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Mengatur rotasi model agar menghadap ke depan
      monitorModel.rotation.y = Math.PI; // Rotasi 180 derajat jika diperlukan

      scene.add(monitorModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.error('An error happened while loading the GLTF model', error);
    }
  );
}
function loadWirelessChargerGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    './wireless_charger_usb_qc/scene.gltf', // Path to your GLTF wireless charger file
    (gltf) => {
      const wirelessChargerModel = gltf.scene;
      wirelessChargerModel.position.set(1, 0, -3); // Adjust the position according to your needs

      // You may need to adjust the scale and rotation of the wireless charger
      wirelessChargerModel.scale.set(0.1, 0.1, 0.1); // Example scale factor
      wirelessChargerModel.rotation.y = Math.PI / 2; // Example rotation (90 degrees)

      // Add the wireless charger model to the scene
      scene.add(wirelessChargerModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.error('An error happened while loading the GLTF model', error);
    }
  );
}


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

  const laptopButton = document.createElement('button');
  laptopButton.textContent = 'Open Laptop';
  laptopButton.style.position = 'absolute';
  laptopButton.style.top = '70px';
  laptopButton.style.left = '10px';
  document.body.appendChild(laptopButton);
  laptopButton.addEventListener('click', toggleLaptop);

}

function toggleLaptop() {
  if (laptopState === 'closed') {
    laptopOpenAction.play();
    laptopCloseAction.stop();
    laptopState = 'open';
  } else if (laptopState === 'open') {
    laptopCloseAction.play();
    laptopOpenAction.stop();
    laptopState = 'closed';
  }
}


function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (doorMixer) doorMixer.update(delta);
  if (laptopMixer) laptopMixer.update(delta);

  controls.update();
  renderer.render(scene, camera);
}


function onKeyDown(event) {
  const speed = 0.1;
  const newPosition = camera.position.clone();

  switch (event.key) {
    case 'w':
      newPosition.z -= speed; // Maju
      break;
    case 's':
      newPosition.z += speed; // Mundur
      break;
    case 'a':
      newPosition.x -= speed; // Gerak kiri
      break;
    case 'd':
      newPosition.x += speed; // Gerak kanan
      break;
    default:
      break;
  }

  const raycaster = new THREE.Raycaster(newPosition, camera.getWorldDirection(), 0, 1);
  const intersects = raycaster.intersectObjects(scene.children.filter(child => child instanceof THREE.Mesh));

  if (intersects.length === 0) {
    camera.position.copy(newPosition);
  } else {
    console.log("Collision detected! Movement canceled.");
  }
}
function loadDrawerGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    './', // Ganti dengan lokasi file GLTF laci Anda
    (gltf) => {
      const drawerModel = gltf.scene;

      // Sesuaikan posisi laci sesuai kebutuhan Anda
      drawerModel.position.set(-0.5, 0, 4); 

      // Mengatur skala model jika diperlukan
      const scaleFactor = 1; // Faktor skala yang diinginkan
      drawerModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      scene.add(drawerModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.error('An error happened', error);
    }
  );
}


init();
