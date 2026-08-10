## 2024-05-14 - GC Pauses from Object Instantiation in Game Loops
**Learning:** Instantiating new objects (like `new THREE.Box3()`) inside high-frequency nested loops (such as collision detection in `updateProjectiles`) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses, which degrade the framerate in WebGL applications.
**Action:** Always declare reusable instance variables (e.g., `const sharedBox = new THREE.Box3()`) globally or outside the loop and mutate them inside the loop (e.g., `.setFromObject(...)`) to avoid frequent allocations.
## 2025-01-01 - Continuous Allocation Memory Leak in Three.js
**Learning:** Instantiating new THREE.Geometry and THREE.Material objects rapidly (like for projectiles or enemies) without calling `.dispose()` causes severe memory and GPU resource leaks in Three.js, leading to lag and garbage collection overhead.
**Action:** Pre-allocate shared geometries and materials once during initialization (e.g., in `init()`) and reuse them for all matching object instances (e.g., passing them directly into new `THREE.Mesh(sharedGeo, sharedMat)`) to maintain performance in WebGL applications.
