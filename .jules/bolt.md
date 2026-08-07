## 2024-05-14 - GC Pauses from Object Instantiation in Game Loops
**Learning:** Instantiating new objects (like `new THREE.Box3()`) inside high-frequency nested loops (such as collision detection in `updateProjectiles`) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses, which degrade the framerate in WebGL applications.
**Action:** Always declare reusable instance variables (e.g., `const sharedBox = new THREE.Box3()`) globally or outside the loop and mutate them inside the loop (e.g., `.setFromObject(...)`) to avoid frequent allocations.

## 2026-08-07 - Pre-allocating Geometries and Materials
**Learning:** Instantiating new objects (e.g., geometries and materials via `new THREE.MeshStandardMaterial()`) directly inside high-frequency game loop functions like `spawnEnemy` or `fireProjectile` causes unnecessary Garbage Collection overhead and results in performance degradation (pauses).
**Action:** Always pre-allocate shared geometries and materials once during initialization (like in `init()`) and reuse them across instances created in the game loop.
