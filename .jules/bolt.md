## 2024-05-14 - GC Pauses from Object Instantiation in Game Loops
**Learning:** Instantiating new objects (like `new THREE.Box3()`) inside high-frequency nested loops (such as collision detection in `updateProjectiles`) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses, which degrade the framerate in WebGL applications.
**Action:** Always declare reusable instance variables (e.g., `const sharedBox = new THREE.Box3()`) globally or outside the loop and mutate them inside the loop (e.g., `.setFromObject(...)`) to avoid frequent allocations.

## 2024-08-04 - Prevent Memory Leaks via Shared Geometries and Materials
**Learning:** In Three.js applications, frequently instantiating geometries and materials (like when spawning projectiles or enemies) causes severe memory and GPU resource leaks because they accumulate unless explicitly disposed.
**Action:** Always pre-allocate shared geometries and materials once during initialization (e.g., in `init()`) and reuse them in the game loop when creating meshes.
