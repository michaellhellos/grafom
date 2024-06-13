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