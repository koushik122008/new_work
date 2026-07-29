## 2024-03-24 - Three.js Object Allocation GPU Memory Leak
**Learning:** In this Three.js codebase, frequently allocating new geometries and materials inside the game loop (e.g., `spawnEnemy()` and `fireProjectile()`) causes significant GPU memory leaks because these objects are never explicitly disposed with `.dispose()`.
**Action:** Always pre-allocate shared geometries and materials once during initialization (e.g., in `init()`) and reuse them for objects spawned dynamically during gameplay.
