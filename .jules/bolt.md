## 2024-05-14 - GC Pauses from Object Instantiation in Game Loops
**Learning:** Instantiating new objects (like `new THREE.Box3()`) inside high-frequency nested loops (such as collision detection in `updateProjectiles`) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses, which degrade the framerate in WebGL applications.
**Action:** Always declare reusable instance variables (e.g., `const sharedBox = new THREE.Box3()`) globally or outside the loop and mutate them inside the loop (e.g., `.setFromObject(...)`) to avoid frequent allocations.
## 2024-05-15 - [Three.js Object Allocation Optimization]
**Learning:** In Three.js applications, creating new Geometries and Materials (like CylinderGeometry, MeshStandardMaterial) continuously during gameplay (e.g., when firing projectiles or spawning enemies) causes severe memory leaks and GC pauses if `.dispose()` is not called on the old instances. Even with small amounts of objects, it adds up quickly.
**Action:** Always pre-allocate shared geometries and materials once during initialization and reuse them in the game loop for frequently spawned objects.
