// --- Globals ---
let scene, camera, renderer;
let clock;
let gridHelper;
let player;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let crosshair;

// Entity Arrays
let enemies = [];
let projectiles = [];
let particles = [];
let enemySpawnTimer = 0;
const ENEMY_SPAWN_RATE = 1.0; // seconds

// Effects
let muzzleFlashSprite;
let muzzleFlashTimer = 0;
let textureLoader = new THREE.TextureLoader();

// Game State
const gameState = {
    speed: 100, // units per second
    score: 0
};

// --- Initialization ---
function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 400); // Fog to hide distant spawning

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Position camera behind and slightly above the player's typical position
    camera.position.set(0, 10, 30);
    camera.lookAt(0, 0, -50);

    // 3. Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(100, 200, 50);
    scene.add(dirLight);

    // 5. Environment (Moving Grid to simulate speed)
    createEnvironment();

    // 6. Clock for delta time
    clock = new THREE.Clock();

    // 6. Player Setup
    createPlayer();

    // 7. Crosshair
    createCrosshair();

    // 7.5 Effects
    createEffects();

    // 8. Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousedown', onMouseDown, false);

    // Start Loop
    animate();
}

function createPlayer() {
    // Create a simple futuristic car shape using basic primitives
    player = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(4, 1.5, 8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x4444ff });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1;
    player.add(body);

    // Cockpit
    const cockpitGeo = new THREE.BoxGeometry(2, 1, 4);
    const cockpitMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 2, 0);
    player.add(cockpit);

    // Gun Mount (we will spawn projectiles from here)
    const gunGeo = new THREE.CylinderGeometry(0.2, 0.2, 2);
    const gunMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const gun1 = new THREE.Mesh(gunGeo, gunMat);
    gun1.rotation.x = Math.PI / 2;
    gun1.position.set(-1.5, 1.5, -4);
    player.add(gun1);

    const gun2 = gun1.clone();
    gun2.position.set(1.5, 1.5, -4);
    player.add(gun2);

    // Position player in front of camera
    player.position.set(0, 0, 10); // Note: Camera is at z=30, looking at z=-50
    scene.add(player);
}

function createCrosshair() {
    // A simple red circle in 3D space to show where we are aiming
    const geometry = new THREE.RingGeometry(1, 1.2, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    crosshair = new THREE.Mesh(geometry, material);
    crosshair.position.z = -100; // Put it far ahead
    scene.add(crosshair);
}

function createEffects() {
    // Muzzle Flash
    const flashMap = textureLoader.load('muzzleflash.jpg');
    const flashMaterial = new THREE.SpriteMaterial({
        map: flashMap,
        color: 0xffaa00,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0 // start hidden
    });
    muzzleFlashSprite = new THREE.Sprite(flashMaterial);
    muzzleFlashSprite.scale.set(10, 10, 1);
    // Position it slightly in front of the player's guns
    muzzleFlashSprite.position.set(0, 1.5, 6);
    scene.add(muzzleFlashSprite);
}

function createEnvironment() {
    // A large grid that we will scroll to simulate movement
    const gridColor = 0x00ffff;
    gridHelper = new THREE.GridHelper(1000, 100, gridColor, 0x444444);
    gridHelper.position.y = -2; // Slightly below zero to let objects rest on 0
    scene.add(gridHelper);

    // Optional: add some side structures/walls if needed, but grid is fine for now
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseDown(event) {
    // Fire weapon!
    fireProjectile();
}

function fireProjectile() {
    // Projectile visual
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 4);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const projectile = new THREE.Mesh(geometry, material);

    // Start at player position
    projectile.position.copy(player.position);
    projectile.position.y += 1.5; // match gun height
    projectile.position.z -= 4; // match gun depth

    // Calculate direction from player to crosshair
    const direction = new THREE.Vector3().subVectors(crosshair.position, projectile.position).normalize();
    projectile.userData = { direction: direction, speed: 400 };

    // Point the projectile in the direction it's traveling
    // We can use lookAt but we have to provide a target position
    const targetPos = projectile.position.clone().add(direction);
    projectile.lookAt(targetPos);

    scene.add(projectile);
    projectiles.push(projectile);

    // Trigger Muzzle Flash
    muzzleFlashSprite.material.opacity = 1.0;
    muzzleFlashTimer = 0.1; // Flash duration in seconds

    // Slight random rotation for variance
    muzzleFlashSprite.material.rotation = Math.random() * Math.PI * 2;
}

// --- Main Loop ---
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Scroll Grid
    if (gridHelper) {
        // Move grid towards camera
        gridHelper.position.z += gameState.speed * delta;
        // Reset position to create seamless loop
        // The grid has size 1000 and 100 divisions, so each square is 10 units
        if (gridHelper.position.z > 10) {
            gridHelper.position.z -= 10;
        }
    }

    // Update crosshair position using Raycaster
    raycaster.setFromCamera(mouse, camera);
    // Project crosshair onto an invisible plane at z = -100
    const targetZ = -100;
    // We want the point on the ray where z = -100
    // ray.origin.z + ray.direction.z * t = -100
    // t = (-100 - ray.origin.z) / ray.direction.z
    if (raycaster.ray.direction.z !== 0) {
        const t = (targetZ - raycaster.ray.origin.z) / raycaster.ray.direction.z;
        const targetPos = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(t));
        crosshair.position.copy(targetPos);
    }

    // Spawn Enemies
    enemySpawnTimer -= delta;
    if (enemySpawnTimer <= 0) {
        spawnEnemy();
        enemySpawnTimer = ENEMY_SPAWN_RATE;
    }

    // Update Enemies
    updateEnemies(delta);

    // Update Projectiles and check collisions
    updateProjectiles(delta);

    // Update Particles
    updateParticles(delta);

    // Update Muzzle Flash
    if (muzzleFlashTimer > 0) {
        muzzleFlashTimer -= delta;
        if (muzzleFlashTimer <= 0) {
            muzzleFlashSprite.material.opacity = 0;
        } else {
            // Fade out quickly
            muzzleFlashSprite.material.opacity = muzzleFlashTimer / 0.1;
        }
    }

    renderer.render(scene, camera);
}

function spawnEnemy() {
    // Basic cube enemy
    const geometry = new THREE.BoxGeometry(4, 4, 4);
    const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const enemy = new THREE.Mesh(geometry, material);

    // Spawn far away, slightly randomized x position
    const xPos = (Math.random() - 0.5) * 60; // range -30 to 30
    enemy.position.set(xPos, 2, -300); // 2 is half height so it sits on grid

    // Custom property for hit points or other logic
    enemy.userData = { hp: 1 };

    scene.add(enemy);
    enemies.push(enemy);
}

function updateEnemies(delta) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        // Move towards player
        enemy.position.z += (gameState.speed + 20) * delta;

        // Remove if it passes behind the camera/player
        if (enemy.position.z > 50) {
            scene.remove(enemy);
            enemies.splice(i, 1);
        }
    }
}

function updateProjectiles(delta) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];

        // Move projectile
        proj.position.addScaledVector(proj.userData.direction, proj.userData.speed * delta);

        // Collision Detection with Enemies
        let hit = false;
        // Simple bounding box collision
        const projBox = new THREE.Box3().setFromObject(proj);

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const enemyBox = new THREE.Box3().setFromObject(enemy);

            if (projBox.intersectsBox(enemyBox)) {
                // Hit!
                hit = true;

                // Spawn Explosion
                createExplosion(enemy.position);

                // Remove Enemy
                scene.remove(enemy);
                enemies.splice(j, 1);

                // Update Score
                gameState.score += 100;
                document.getElementById('score').innerText = gameState.score;
                break; // One projectile hits one enemy
            }
        }

        // Remove projectile if it goes too far or hits something
        if (hit || proj.position.z < -500) {
            scene.remove(proj);
            projectiles.splice(i, 1);
        }
    }
}

function createExplosion(position) {
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        // Start at center
        positions[i * 3] = position.x;
        positions[i * 3 + 1] = position.y;
        positions[i * 3 + 2] = position.z;

        // Random velocity outward
        velocities.push({
            x: (Math.random() - 0.5) * 50,
            y: (Math.random() - 0.5) * 50,
            z: (Math.random() - 0.5) * 50
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Simple colored square material
    const material = new THREE.PointsMaterial({ color: 0xffaa00, size: 2 });

    const particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData = { velocities: velocities, life: 1.0 };

    scene.add(particleSystem);
    particles.push(particleSystem);
}

function updateParticles(delta) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const ps = particles[i];
        ps.userData.life -= delta;

        if (ps.userData.life <= 0) {
            scene.remove(ps);
            particles.splice(i, 1);
            continue;
        }

        const positions = ps.geometry.attributes.position.array;
        const velocities = ps.userData.velocities;

        for (let j = 0; j < velocities.length; j++) {
            positions[j * 3] += velocities[j].x * delta;
            positions[j * 3 + 1] += velocities[j].y * delta;
            positions[j * 3 + 2] += velocities[j].z * delta;

            // Add some gravity/drag if desired, but simple outward spread is fine
        }

        ps.geometry.attributes.position.needsUpdate = true;
        // Fade out
        ps.material.opacity = ps.userData.life; // Needs transparent:true to work, but size/life is good enough
    }
}

// Start
init();