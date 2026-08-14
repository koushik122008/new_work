## 2024-05-14 - GC Pauses from Object Instantiation in Game Loops
**Learning:** Instantiating new objects (like `new THREE.Box3()`) inside high-frequency nested loops (such as collision detection in `updateProjectiles`) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses, which degrade the framerate in WebGL applications.
**Action:** Always declare reusable instance variables (e.g., `const sharedBox = new THREE.Box3()`) globally or outside the loop and mutate them inside the loop (e.g., `.setFromObject(...)`) to avoid frequent allocations.

## 2024-05-24 - Pre-allocating Geometries and Materials
**Learning:** Dynamically instantiating geometries (e.g. `new THREE.CylinderGeometry`) and materials (e.g. `new THREE.MeshBasicMaterial`) repeatedly inside game loop functions like `spawnEnemy` or `fireProjectile` causes severe memory and GPU resource leaks in Three.js when they are not properly disposed, leading to GC overhead and frame rate drops.
**Action:** Always pre-allocate shared geometries and materials once during initialization (e.g. in `init()`) and reuse them when creating new `THREE.Mesh` objects in the game loop.
