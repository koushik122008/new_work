## 2024-05-14 - GC Pauses from Object Instantiation in Game Loops
**Learning:** Instantiating new objects (like `new THREE.Box3()`) inside high-frequency nested loops (such as collision detection in `updateProjectiles`) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses, which degrade the framerate in WebGL applications.
**Action:** Always declare reusable instance variables (e.g., `const sharedBox = new THREE.Box3()`) globally or outside the loop and mutate them inside the loop (e.g., `.setFromObject(...)`) to avoid frequent allocations.
## 2026-08-17 - Pre-allocating Geometries and Materials in Game Loops
**Learning:** Instantiating new objects (like Geometries and Materials) inside high-frequency nested loops (such as firing projectiles or spawning enemies) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses and GPU resource leaks in WebGL applications, especially without calling `.dispose()`.
**Action:** Always pre-allocate shared geometries and materials once during initialization and reuse them in the game loop to prevent severe memory and GPU resource leaks.
