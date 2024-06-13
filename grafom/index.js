import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Octree } from "three/examples/jsm/Addons.js";
import { OctreeHelper } from "three/addons/helpers/OctreeHelper.js";
import { Capsule } from "three/addons/math/Capsule.js";
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';


let camera, renderer, clock;
// let controls
const scene = new THREE.Scene();
let door,
  doorMixer,
  doorOpenAction,
  doorCloseAction,
  doorState = "closed";
let laptopMixer,
  laptopOpenAction,
  laptopCloseAction,
  laptopState = "closed";
let laptopTop;
let VacumModel;
let isRotatedLeft = false; // Menandai apakah rotasi ke kiri telah dilakukan
let isRotatedRight = false; // Menandai apakah rotasi ke kanan telah dilakukan
let isRotatedForward = false; // Menandai apakah rotasi ke depan telah dilakukan
let isRotatedBackward = false; // Menandai apakah rotasi ke belakang telah dilakukan
let isRotatedBottom = false; // Menandai apakah rotasi ke bawah telah dilakukan
let newOctree = new Octree();
let VacumCollider; // Menyimpan collider untuk model vakum
let BedCollider; // Menyimpan collider untuk objek kasur

const worldOctree = new Octree();

const playerCollider = new Capsule(
  new THREE.Vector3(-2.7, 10, 5),
  new THREE.Vector3(-3, 10, 0),
  0.5
);

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();

let playerOnFloor = false;
let mouseTime = 0;

const keyStates = {};

const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

let control;
function init() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(-2.7, 4.2, 5);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Warna putih (0xffffff) dengan intensitas 0.5
  scene.add(ambientLight);

  clock = new THREE.Clock();

  createSceneObjects();
  control = new PointerLockControls(camera, renderer.domElement)
  // document.addEventListener("keydown", (event) => {
  //   onKeyDown(event);

  //   // Handle rotation when 'a' is pressed
  //   if (event.key === "a") {
  //     rotateLeft();
  //   }

  //   // Handle rotation when 'd' is pressed
  //   if (event.key === "d") {
  //     rotateRight();
  //   }

  //   // Handle rotation when 'w' is pressed
  //   if (event.key === "w") {
  //     rotateForward();
  //   }

  //   // Handle rotation when 's' is pressed
  //   if (event.key === "s") {
  //     rotateBackward();
  //   }

  //   // Handle rotation when 'x' is pressed
  //   if (event.key === "x") {
  //     rotateBottom();
  //   }
  // });

  createButtons();
  loadChairGLTF();
  loadBedGLTF();
  loadDrawerGLTF();
  loadDoorGLTF();
  createWallNextToDoor();
  loadBabyLolaGLTF();
  loadLampGLTF(); // Panggil fungsi untuk memuat lampu GLTF
  loadACGLTF();
  loadTableGLTF();
  loadMonitorGLTF();
  loadLampuGLTF();
  loadVacumGLTF();
  loadMouseGLTF(); // Tambahkan ini untuk memuat model mouse 3D
  loadWardrobeGLTF();
  loadLampuDapurGLTf();
  loadLemariDapurGLTF();
  // loadWirelessChargerGLTF();
  loadMakanGLTF();
  // loadPlateGLTF();
  animate();
}
document.addEventListener("keydown", (event) => {
  keyStates[event.code] = true;
});

document.addEventListener("keyup", (event) => {
  keyStates[event.code] = false;
});
function createSceneObjects() {
  const floorGeometry = new THREE.BoxGeometry(200, 0.1, 10);
  const floorTexture = new THREE.TextureLoader().load("lantai.jpeg");
  const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  worldOctree.fromGraphNode(floor);
  floor.rotation.x = -Math.PI / 2;
  // scene.add(floor);
  //lantai ke 2
  const floorGeometry1 = new THREE.PlaneGeometry(15, 10);
  const floorTexture1 = new THREE.TextureLoader().load("lantai.jpeg");
  const floorMaterial1 = new THREE.MeshBasicMaterial({ map: floorTexture1 });
  const floor1 = new THREE.Mesh(floorGeometry1, floorMaterial1);
  // worldOctree.fromGraphNode(floor1);
  // Mengatur rotasi agar berputar sekitar sumbu x
  floor1.rotation.x = -Math.PI / 2;

  // Mengatur posisi x, y, dan z
  floor1.position.x = -12.5 /* nilai posisi x yang diinginkan */;
  floor1.position.y = 0 /* nilai posisi y yang diinginkan */;
  floor1.position.z = 0 /* nilai posisi z yang diinginkan */;

  scene.add(floor1);
  //
  const ceilingGeometry = new THREE.PlaneGeometry(25, 10);
  const ceilingMaterial = new THREE.MeshBasicMaterial({
    color: 0xaaaaaa,
    side: THREE.DoubleSide,
  });
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(-7.5, 5, 0); // Atur posisi x, y, dan z
  scene.add(ceiling);
  //

  //
  const textureLoader = new THREE.TextureLoader();
  const wallTexture = textureLoader.load("wallpaper.jpeg");
  const wallMaterial = new THREE.MeshBasicMaterial({ map: wallTexture });
  const wallGeometry = new THREE.BoxGeometry(10, 5, 0.1);

  const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
  wall1.position.set(0, 2.5, -5);
  scene.add(wall1);
  //tembok ke 2
  const textureLoader1 = new THREE.TextureLoader();
  const wallTexture1 = textureLoader.load("wallpaper.jpeg");
  const wallMaterial1 = new THREE.MeshBasicMaterial({ map: wallTexture1 });
  const wallGeometry1 = new THREE.BoxGeometry(20, 5, 0.1);

  const wall10 = new THREE.Mesh(wallGeometry1, wallMaterial1);
  wall10.position.set(-10, 2.5, -5);
  scene.add(wall10);
  //
  const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
  wall2.position.set(0, 2.5, 5);
  scene.add(wall2);
  //
  const wall11 = new THREE.Mesh(wallGeometry1, wallMaterial1);
  wall11.position.set(-10, 2.5, 5);
  scene.add(wall11);
  //

  const sideWallGeometry = new THREE.BoxGeometry(0.1, 5, 10);
  const wall4 = new THREE.Mesh(sideWallGeometry, wallMaterial);
  wall4.position.set(5, 2.5, 0);
  scene.add(wall4);
  //
  const sideWallGeometry1 = new THREE.BoxGeometry(0.1, 5, 10);
  const wall13 = new THREE.Mesh(sideWallGeometry, wallMaterial);
  wall13.position.set(-20, 2.5, 0);
  scene.add(wall13);
  //
  const windowGeometry = new THREE.PlaneGeometry(3, 3);
  const windowMaterial = new THREE.MeshBasicMaterial({
    color: 0xadd8e6,
    side: THREE.DoubleSide,
  });
  const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
  windowMesh.position.set(0, 2.5, -4.9);
  scene.add(windowMesh);

  const doorGeometry = new THREE.BoxGeometry(2, 4, 0.1);
  const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
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
    { time: 1, value: Math.PI / 2 },
  ];

  const closeDoorKeyframes = [
    { time: 0, value: Math.PI / 2 },
    { time: 1, value: 0 },
  ];

  const doorOpenTrack = new THREE.NumberKeyframeTrack(
    ".rotation[y]",
    openDoorKeyframes.map((kf) => kf.time),
    openDoorKeyframes.map((kf) => kf.value)
  );
  const doorCloseTrack = new THREE.NumberKeyframeTrack(
    ".rotation[y]",
    closeDoorKeyframes.map((kf) => kf.time),
    closeDoorKeyframes.map((kf) => kf.value)
  );
  const woodTexture = new THREE.TextureLoader().load("gambar5.jpg");
  const woodMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
  const tableGeometry = new THREE.BoxGeometry(4, 0.1, 2.1);
  const table = new THREE.Mesh(tableGeometry, woodMaterial);
  table.position.set(0, 0.5, -4.5);
  // scene.add(table);

  const laptopBaseGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.5);
  const laptopMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
  const laptopBase = new THREE.Mesh(laptopBaseGeometry, laptopMaterial);
  laptopBase.position.set(0, 0.55, -4.5);
  // scene.add(laptopBase);

  const laptopTopGeometry = new THREE.BoxGeometry(0.8, 0.02, 0.5);
  laptopTop = new THREE.Mesh(laptopTopGeometry, laptopMaterial);
  laptopMixer = new THREE.AnimationMixer(laptopTop);
  // laptopTop.position.set(0, 0.58, -4.75);
  // scene.add(laptopTop);

  laptopMixer = new THREE.AnimationMixer(laptopTop);

  const openLaptopKeyframes = [
    { time: 0, value: 0 },
    { time: 1, value: -Math.PI / 2 },
  ];

  const closeLaptopKeyframes = [
    { time: 0, value: -Math.PI / 2 },
    { time: 1, value: 0 },
  ];

  //lemari
  const wardrobeGeometry = new THREE.BoxGeometry(3, 4, 1.5);
  const wardrobeMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
  const wardrobe = new THREE.Mesh(wardrobeGeometry, wardrobeMaterial);
  wardrobe.position.set(4, 2, -3.5); // Ubah posisi untuk menempatkannya di pojok kanan belakang
  wardrobe.rotation.y = -Math.PI / 2; // Putar lemari agar menghadap ke dalam ruangan
  // scene.add(wardrobe);

  const lampGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32);
  const lampMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
  lamp.position.set(0, 4.9, 0);
  // scene.add(lamp);

  loadGLTF();
}

function loadLampuGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./kipas/celling_fan_clean.glb",
    (gltf) => {
      const LampModel = gltf.scene;
      LampModel.position.set(0, 3.74, 0);
      LampModel.name="fan"
      const scaleFactor = 2; // Faktor skala yang diinginkan
      LampModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      scene.add(LampModel);
      
      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1); // Warna merah, intensitas 1
      directionalLight1.position.set(10, 10, 10); // Atur posisi arah cahaya
      scene.add(directionalLight1);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened", error);
    }
  );
}

function loadLampuDapurGLTf() {
  const loader = new GLTFLoader();
  loader.load(
    "./lamp/scene.gltf",
    (gltf) => {
      const LampuModel = gltf.scene;
      LampuModel.position.set(-12, 4.05, 0);

      const scaleFactor = 1.5; // Faktor skala yang diinginkan
      LampuModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      scene.add(LampuModel);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1); // Warna putih, intensitas 1
      directionalLight2.position.set(1, 1, 1); // Atur posisi arah cahaya
      scene.add(directionalLight2);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened", error);
    }
  );
}

function loadGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./laptop/scene.gltf",
    (gltf) => {
      const laptopModel = gltf.scene;
      laptopModel.position.set(-1.5, 1.7, -3.7);

      const scaleFactor = 0.5;
      laptopModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Traverse through all meshes in the model and set receiveShadow and castShadow properties
      laptopModel.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true;
          child.castShadow = true;
        }
      });

      scene.add(laptopModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened", error);
    }
  );
}

function loadChairGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./kursi/scene.gltf", // Lokasi file GLTF kursi yang sudah disiapkan
    (gltf) => {
      const chairModel = gltf.scene;

      // Sesuaikan posisi kursi sesuai kebutuhan Anda
      chairModel.position.set(-1.5, 0, -2.5);

      // Mengatur rotasi model (rotasi 180 derajat)
      chairModel.rotation.y = Math.PI;

      // Mengatur skala model
      const scaleFactor = 0.06; // Faktor skala yang diinginkan (sebelumnya 0.5, sekarang 0.25)
      chairModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
      //collision
      worldOctree.fromGraphNode(chairModel)
      // Tambahkan properti receiveShadow dan castShadow
      chairModel.receiveShadow = true; // Menerima bayangan
      chairModel.castShadow = true; // Melemparkan bayangan

      scene.add(chairModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened", error);
    }
  );
}

function loadLampGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./smart_lamp/scene.gltf",
    (gltf) => {
      const lampModel = gltf.scene;
      lampModel.position.set(-2.7, 1.7, -4.1);

      const scaleFactor = 0.5;
      lampModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Tambahkan properti receiveShadow dan castShadow
      lampModel.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true;
          child.castShadow = true;
        }
      });

      scene.add(lampModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened", error);
    }
  );
}

function loadBabyLolaGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./baby_yoda_free_3d_by_oscar_creativo/scene.gltf", // Path to your GLTF Baby Lola file
    (gltf) => {
      const babyLolaModel = gltf.scene;
      babyLolaModel.position.set(-2.7, 2.1, -3.7); // Adjust the position to place it on the table

      // Adjust the scale if necessary
      const scaleFactor = 0.1; // Desired scale factor
      babyLolaModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      scene.add(babyLolaModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened", error);
    }
  );
}

function loadACGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./ac/scene.gltf", // Path to your GLTF AC file
    (gltf) => {
      const acModel = gltf.scene;
      acModel.position.set(3, 4.5, -4.9); // Position it in the corner and high up on the wall

      // Adjust the scale if necessary
      const scaleFactor = 1.5; // Desired scale factor
      acModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      scene.add(acModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened", error);
    }
  );
}

function loadTableGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./meja/scene.gltf", // Ganti dengan lokasi file GLTF meja Anda
    (gltf) => {
      const tableModel = gltf.scene;
      tableModel.position.set(0, 0, -3.1); // Sesuaikan posisi meja sesuai kebutuhan Anda

      // Mengatur skala model
      const scale = 0.05; // Sesuaikan skala sesuai kebutuhan Anda
      tableModel.scale.set(scale, scale, scale);

      // Tambahkan model meja ke dalam scene
      scene.add(tableModel);
      //collision
      worldOctree.fromGraphNode(tableModel)
      // Tambahkan slider atau kontrol lain untuk mengubah skala
      addScaleControls(tableModel);
    },
    undefined,
    (error) => {
      console.error("An error happened while loading the GLTF model", error);
    }
  );
}

function loadMouseGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./mouse/scene.gltf", // Path ke file GLTF mouse Anda
    (gltf) => {
      const mouseModel = gltf.scene;
      mouseModel.position.set(-0.5, 1.7, -3.7); // Sesuaikan posisi mouse sesuai kebutuhan Anda

      // Mengatur skala model jika diperlukan
      const scaleFactor = 0.1; // Faktor skala yang diinginkan
      mouseModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Tambahkan properti receiveShadow dan castShadow
      mouseModel.receiveShadow = true; // Menerima bayangan
      mouseModel.castShadow = true; // Melemparkan bayangan

      // Tambahkan model mouse ke dalam scene
      scene.add(mouseModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened while loading the GLTF model", error);
    }
  );
}

function addScaleControls(model) {
  const scaleInput = document.createElement("input");
  scaleInput.type = "range";
  scaleInput.min = "0.01";
  scaleInput.max = "2.0";
  scaleInput.step = "0.01";
  scaleInput.value = model.scale.x; // Asumsikan skala awal sama untuk x, y, z

  scaleInput.addEventListener("input", (event) => {
    const scale = parseFloat(event.target.value);
    model.scale.set(scale, scale, scale);
  });

  document.body.appendChild(scaleInput);
}

function loadMonitorGLTF() {
  // const loader = new GLTFLoader();
  // loader.load(
  //   "./monitor/scene.gltf", // Lokasi file GLTF monitor yang sudah disiapkan
  //   (gltf) => {
  //     const monitorModel = gltf.scene;

  //     // Hitung posisi monitor berdasarkan ukuran meja
  //     const tableBox = new THREE.Box3().setFromObject(tableModel);
  //     const tableHeight = tableBox.max.y - tableBox.min.y;

  //     // Sesuaikan posisi monitor agar berada di atas meja dan menempel di tembok
  //     monitorModel.position.set(0, tableHeight + 0.3, tableBox.min.z - 0.1); // Sesuaikan posisi monitor sesuai kebutuhan Anda

  //     // Mengatur skala model
  //     const scaleFactor = 0.5; // Faktor skala yang diinginkan
  //     monitorModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

  //     // Mengatur rotasi model agar menghadap ke depan
  //     monitorModel.rotation.y = Math.PI; // Rotasi 180 derajat jika diperlukan

  //     scene.add(monitorModel);
  //   },
  //   (xhr) => {
  //     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  //   },
  //   (error) => {
  //     console.error("An error happened while loading the GLTF model", error);
  //   }
  // );
}

function createButtons() {}

function toggleLaptop() {
  if (laptopState === "closed") {
    laptopOpenAction.play();
    laptopCloseAction.stop();
    laptopState = "open";
  } else if (laptopState === "open") {
    laptopCloseAction.play();
    laptopOpenAction.stop();
    laptopState = "closed";
  }
}

function playerCollisions() {
  const result = worldOctree.capsuleIntersect(playerCollider);

  playerOnFloor = false;

  if (result) {
    playerOnFloor = result.normal.y > 0;

    if (!playerOnFloor) {
      playerVelocity.addScaledVector(
        result.normal,
        -result.normal.dot(playerVelocity)
      );
    }

    playerCollider.translate(result.normal.multiplyScalar(result.depth));
  }
}
function getForwardVector() {
  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();

  return playerDirection;
}

function getSideVector() {
  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();
  playerDirection.cross(camera.up);

  return playerDirection;
}
function teleportPlayerIfOob() {
  if (camera.position.y <= -25) {
    playerCollider.start.set(0, 0.35, 0);
    playerCollider.end.set(0, 1, 0);
    playerCollider.radius = 0.35;
    camera.position.copy(playerCollider.end);
    camera.rotation.set(0, 0, 0);
  }
}
function updatePlayer(deltaTime) {
  let damping = Math.exp(-4 * deltaTime) - 1;

  if (!playerOnFloor) {
    playerVelocity.y -= GRAVITY * deltaTime;

    // small air resistance
    damping *= 0.1;
  }

  playerVelocity.addScaledVector(playerVelocity, damping);

  const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
  playerCollider.translate(deltaPosition);

  playerCollisions();

  camera.position.copy(playerCollider.end);
}

// Tentukan arah pergerakan berdasarkan tombol yang ditekan
function controls(deltaTime) {
  // gives a bit of air control
  const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

  if (keyStates["KeyW"]) {
    playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
  }

  if (keyStates["KeyS"]) {
    playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
  }

  if (keyStates["KeyA"]) {
    playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
  }

  if (keyStates["KeyD"]) {
    playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
  }

  if (playerOnFloor) {
    if (keyStates["Space"]) {
      playerVelocity.y = 15;
    }
  }
}
let STEPS_PER_FRAME = 3;
let GRAVITY = 30;
function animate() {
  requestAnimationFrame(animate);
  control.lock();
  const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

  // we look for collisions in substeps to mitigate the risk of
  // an object traversing another too quickly for detection.

  for (let i = 0; i < STEPS_PER_FRAME; i++) {
    controls(deltaTime);
    updatePlayer(deltaTime);
    teleportPlayerIfOob();
  }
  const fan = scene.getObjectByName("fan")
  if(fan){
    fan.rotation.y -=0.05
  }
  const delta = clock.getDelta();
  if (doorMixer) doorMixer.update(delta);
  if (laptopMixer) laptopMixer.update(delta);

  renderer.render(scene, camera);
}

function onKeyDown(event) {
  const speed = 0.1; // Kecepatan gerak vakum
  const newPosition = VacumModel.position.clone(); // Dapatkan posisi vakum saat ini

  // Setel status rotasi ke false untuk memungkinkan rotasi kembali saat arah pergerakan diubah
  isRotatedLeft = false;
  isRotatedRight = false;
  isRotatedForward = false;
  isRotatedBackward = false;
  isRotatedBottom = false;

  // Update posisi vakum
  VacumModel.position.copy(newPosition);

  // Lakukan operasi lain yang mungkin Anda butuhkan setelah memperbarui posisi vakum
}

function rotateLeft() {
  if (!isRotatedLeft) {
    VacumModel.rotation.y = -Math.PI / 2; // Atur rotasi menjadi menghadap ke kiri
    isRotatedLeft = true; // Setel ke true agar rotasi hanya terjadi sekali
  }
}

function rotateRight() {
  if (!isRotatedRight) {
    VacumModel.rotation.y = Math.PI / 2; // Atur rotasi menjadi menghadap ke kanan
    isRotatedRight = true; // Setel ke true agar rotasi hanya terjadi sekali
  }
}

function rotateForward() {
  if (!isRotatedForward) {
    VacumModel.rotation.y = Math.PI; // Atur rotasi menjadi menghadap ke depan
    isRotatedForward = true; // Setel ke true agar rotasi hanya terjadi sekali
  }
}

function rotateBackward() {
  if (!isRotatedBackward) {
    VacumModel.rotation.y = 0; // Atur rotasi menjadi menghadap ke belakang
    isRotatedBackward = true; // Setel ke true agar rotasi hanya terjadi sekali
  }
}

function rotateBottom() {
  if (!isRotatedBottom) {
    // Tambahkan logika rotasi ke bawah di sini jika diperlukan
    isRotatedBottom = true; // Setel ke true agar rotasi hanya terjadi sekali
  }
}

function moveVacuum() {
  const startPosition = new THREE.Vector3(-4.3, 0.13, -4);
  const endPosition = new THREE.Vector3(-4.3, 0.13, 0);
  const totalSteps = 8; // Jumlah langkah (misalnya 8 langkah dari posisi awal ke posisi akhir)
  let currentStep = 0;

  const moveInterval = setInterval(() => {
    if (currentStep >= totalSteps) {
      clearInterval(moveInterval); // Hentikan interval jika sudah mencapai posisi akhir
      return;
    }

    // Hitung posisi baru berdasarkan langkah saat ini
    const newPosition = startPosition.clone().lerp(endPosition, currentStep / totalSteps);
    
    // Terapkan posisi baru pada model vakum
    VacumModel.position.copy(newPosition);

    currentStep++;
  }, 1000); // Interval pergerakan (dalam milidetik)
}


function loadVacumGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./vacum/scene.gltf",
    (gltf) => {
      const VacumModel = gltf.scene; // Simpan referensi model vakum

      VacumModel.position.set(-4.3, 0.13, -4);
      const scaleFactor = 3;
      VacumModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Tambahkan properti receiveShadow pada semua mesh di dalam objek
      VacumModel.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true;
        }
      });
      worldOctree.fromGraphNode(VacumModel);
      // Tambahkan model vakum ke dalam scene
      
      scene.add(VacumModel);

      // Panggil fungsi playerCollisions() di sini setelah model vakum dimuat
      playerCollisions();

      // Definisikan variabel global untuk menyimpan posisi z awal vakum
      let initialVacumZPosition = -4;

      // Tambahkan event listener untuk menangani tekanan tombol "P"
      document.addEventListener('keydown', (event) => {
        if (event.key === 'p' || event.key === 'P') {
          // Perbarui posisi z vakum
          initialVacumZPosition += 0.1; // Misalnya, vakum bergerak 0.1 unit setiap kali tombol ditekan

          // Perbarui posisi vakum
          if (VacumModel) {
            VacumModel.position.set(-4.3, 0.13, initialVacumZPosition);
            
            // Perbarui posisi worldOctree
            worldOctree.fromGraphNode(VacumModel);
          }
        }
      });

    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened", error);
    }
  );
}



function loadBedGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./kasur_1/scene.gltf", // Path ke file GLTF kasur
    (gltf) => {
      const bedModel = gltf.scene;
      bedModel.position.set(2, 0, 3.5); // Sesuaikan posisi sesuai kebutuhan

      // Perbesar kasur 2x
      bedModel.scale.set(2, 2, 2);

      // Putar posisi kasur 90 derajat dari posisi sekarang
      bedModel.rotation.y += Math.PI / 1; // Tambahkan 90 derajat
      // worldOctree.fromGraphNode(bedModel);
      scene.add(bedModel);
      worldOctree.fromGraphNode(bedModel)
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened", error);
    }
  );
}

function loadWirelessChargerGLTF() {
  // const loader = new GLTFLoader();
  // loader.load(
  //   "hpdantempat/scene.gltf", // Path to your GLTF wireless charger file
  //   (gltf) => {
  //     wirelessChargerModel = gltf.scene;
  //     wirelessChargerModel.position.set(-2.7, 1.7, -4.1); // Set to origin to check visibility
  //     wirelessChargerModel.scale.set(10, 10, 10); // Set scale to 1 to check visibility
  //     wirelessChargerModel.rotation.y = 0; // Reset rotation to check visibility

  //     // Ensure that the texture is correctly applied
  //     wirelessChargerModel.traverse((node) => {
  //       if (node.isMesh) {
  //         node.castShadow = true;
  //         node.receiveShadow = true;

  //         // Check if the material has a texture map, if not, add one
  //         if (node.material && !node.material.map) {
  //           const textureLoader = new THREE.TextureLoader();
  //           const texture = textureLoader.load("path/to/your/texture.jpg"); // Replace with your texture path
  //           node.material.map = texture;
  //           node.material.needsUpdate = true;
  //         }
  //       }
  //     });

  //     // Add the wireless charger model to the scene
  //     scene.add(wirelessChargerModel);
  //   },
  //   (xhr) => {
  //     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  //   },
  //   (error) => {
  //     console.error("An error happened while loading the GLTF model", error);
  //   }
  // );
}
function loadDrawerGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./drawer/scene.gltf", // Ganti dengan lokasi file GLTF laci Anda
    (gltf) => {
      const drawerModel = gltf.scene;

      // Sesuaikan posisi laci sesuai kebutuhan Anda
      drawerModel.position.set(-1, 0, 4);

      // Rotasi 180 derajat dari posisi semula
      drawerModel.rotation.y += Math.PI;

      // Mengatur skala model jika diperlukan
      const scaleFactor = 1; // Faktor skala yang diinginkan
      drawerModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Tambahkan properti receiveShadow pada semua mesh di dalam objek
      drawerModel.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true;
        }
      });

      // Tambahkan objek laci ke dalam scene
      // worldOctree.fromGraphNode(drawerModel)
      scene.add(drawerModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened", error);
    }
  );
}

function loadDoorGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./pintu/scene.gltf", // Ganti dengan lokasi file GLTF pintu Anda
    (gltf) => {
      const doorModel = gltf.scene;

      // Sesuaikan posisi pintu sesuai kebutuhan Anda
      doorModel.position.set(-4.95, 0, 1);

      // Memutar pintu sebesar 90 derajat dari posisi saat ini
      const rotationAngle = Math.PI / 2; // Konversi 90 derajat ke radian
      doorModel.rotation.y += rotationAngle;

      // Mengatur skala model jika diperlukan
      const scaleFactor = 0.003; // Faktor skala yang diinginkan
      doorModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      scene.add(doorModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened", error);
    }
  );
}
function loadWardrobeGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./lemari_baju/scene.gltf", // Ganti dengan lokasi file GLTF lemari Anda
    (gltf) => {
      const wardrobeModel = gltf.scene;

      // Sesuaikan posisi lemari sesuai kebutuhan Anda
      wardrobeModel.position.set(3.6, 0, -4.4); // Contoh posisi di pojok kanan belakang ruangan

      // Mengatur skala model jika diperlukan
      const scaleFactor = 0.8; // Faktor skala yang diinginkan, sesuaikan jika perlu
      wardrobeModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
      worldOctree.fromGraphNode(wardrobeModel)
      // Tambahkan model lemari ke dalam scene
      scene.add(wardrobeModel);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened while loading the GLTF model", error);
    }
  );
}
function loadPlateGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./kue/scene.gltf", // Ganti dengan lokasi file GLTF piring Anda
    (gltf) => {
      const plateModel = gltf.scene;

      // Sesuaikan posisi piring di dalam ruangan Anda
      plateModel.position.set(-13, 2.3, 2.3);

      // Sesuaikan skala model jika perlu
      const scaleFactor = 0.1; // Faktor skala yang diinginkan
      plateModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Tambahkan properti receiveShadow dan castShadow jika diperlukan
      plateModel.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true;
          child.castShadow = true;
        }
      });

      scene.add(plateModel); // Tambahkan model piring ke dalam scene
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened while loading the GLTF model", error);
    }
  );
}

function loadMakanGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./meja_makan/scene.gltf", // Path ke file GLTF meja makan Anda
    (gltf) => {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          // Set properti receiveShadow dan castShadow
          child.receiveShadow = true;
          child.castShadow = true;

          // Check untuk bahan (material) pada mesh
          if (child.material) {
            // Set material untuk menerima bayangan jika belum diatur
            if (
              child.material instanceof THREE.MeshStandardMaterial ||
              child.material instanceof THREE.MeshPhongMaterial
            ) {
              child.material.receiveShadow = true;
              child.material.castShadow = true;
            }
          }
        }
      });

      const pathMakan = gltf.scene; // Simpan referensi model meja makan

      pathMakan.position.set(-12, 0, 0); // Atur posisi meja makan sesuai kebutuhan Anda
      const scaleFactor = 0.0025; // Faktor skala yang diinginkan
      pathMakan.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // worldOctree.fromGraphNode(pathMakan)
      scene.add(pathMakan); // Tambahkan meja makan ke dalam scene
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened while loading the GLTF model", error);
    }
  );
}

function loadLemariDapurGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "./lemari_dapur/scene.gltf", // Path ke file GLTF meja makan Anda
    (gltf) => {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          // Set properti receiveShadow dan castShadow
          child.receiveShadow = true;
          child.castShadow = true;

          // Check untuk bahan (material) pada mesh
          if (child.material) {
            // Set material untuk menerima bayangan jika belum diatur
            if (
              child.material instanceof THREE.MeshStandardMaterial ||
              child.material instanceof THREE.MeshPhongMaterial
            ) {
              child.material.receiveShadow = true;
              child.material.castShadow = true;
            }
          }
        }
      });

      const Cabinet = gltf.scene; // Simpan referensi model meja makan

      Cabinet.position.set(-8.57, 0, -4.8); // Atur posisi meja makan sesuai kebutuhan Anda
      const scaleFactor = 0.78; // Faktor skala yang diinginkan
      Cabinet.scale.set(scaleFactor, scaleFactor, scaleFactor);

      worldOctree.fromGraphNode(Cabinet)
      scene.add(Cabinet); // Tambahkan meja makan ke dalam scene
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened while loading the GLTF model", error);
    }
  );
}

function createWallNextToDoor() {
  const doorWidth = 2; // Lebar pintu GLTF
  const doorHeight = 4; // Tinggi pintu GLTF
  const doorDepth = 0.3; // Ketebalan pintu GLTF
  const wallWidth = 0.1; // Ketebalan tembok
  const wallHeight = 5; // Tinggi tembok
  const wallDepth = 10; // Kedalaman tembok

  // Hitung posisi lubang pada tembok
  const holePositionX = -3.5 + doorWidth / 2 + wallWidth / 2;
  const holePositionY = 2;
  const holePositionZ = -5;

  // Buat geometri lubang
  const holeGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);

  // Posisi lubang
  holeGeometry.translate(holePositionX, holePositionY, holePositionZ);

  // Rotasi lubang
  holeGeometry.rotateY(Math.PI / 2); // Putar posisi lubang sebesar 90 derajat

  // Buat bahan untuk lubang
  const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Gunakan warna hitam untuk lubang

  // Buat mesh lubang
  const holeMesh = new THREE.Mesh(holeGeometry, holeMaterial);

  // Gabungkan lubang dengan tembok
  scene.add(holeMesh);

  // Buat tembok
  const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
  const wallTexture = new THREE.TextureLoader().load("wallpaper.jpeg");
  const wallMaterial = new THREE.MeshBasicMaterial({ map: wallTexture });

  const wall = new THREE.Mesh(wallGeometry, wallMaterial);

  // Sesuaikan posisi tembok agar berdekatan dengan pintu
  wall.position.set(-5 + wallWidth / 2, wallHeight / 2, 0); // Sesuaikan posisi agar tembok berada di sebelah pintu

  scene.add(wall);
}
init();
