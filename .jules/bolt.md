## 2024-05-14 - GC Pauses from Object Instantiation in Game Loops
**Learning:** Instantiating new objects (like `new THREE.Box3()`) inside high-frequency nested loops (such as collision detection in `updateProjectiles`) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses, which degrade the framerate in WebGL applications.
**Action:** Always declare reusable instance variables (e.g., `const sharedBox = new THREE.Box3()`) globally or outside the loop and mutate them inside the loop (e.g., `.setFromObject(...)`) to avoid frequent allocations.
## 2024-05-15 - GPU Memory Leaks from Un-disposed Geometries/Materials in Game Loops
**Learning:** Continuously instantiating Three.js objects like `new THREE.CylinderGeometry()` and `new THREE.MeshBasicMaterial()` inside rapidly firing game loop functions (like `spawnEnemy` and `fireProjectile`) without calling `.dispose()` leads to severe GPU memory leaks and garbage collection stutters.
**Action:** Always pre-allocate shared geometries and materials once during application initialization (e.g., in `init()`) and reuse them across multiple meshes throughout the game loop.
