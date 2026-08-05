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

// Procedural Textures
let groundTexture, metalTexture, enemyTexture;

// Game State
const gameState = {
    speed: 100, // units per second
    score: 0
};

// Reusable Objects to prevent GC overhead
const sharedProjBox = new THREE.Box3();
const sharedEnemyBox = new THREE.Box3();
let sharedProjGeo, sharedProjMat;
let sharedEnemyCoreGeo, sharedEnemyCoreMat, sharedEnemySpikeGeo, sharedEnemySpikeMat;

// --- Initialization ---
// --- Procedural Texture Generation ---
function createNoiseTexture(width, height, baseColor, noiseIntensity) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * noiseIntensity;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
        data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise)); // G
        data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise)); // B
    }
    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

function init() {
    // Generate Textures
    groundTexture = createNoiseTexture(512, 512, '#333333', 100);
    groundTexture.repeat.set(50, 50);

    metalTexture = createNoiseTexture(256, 256, '#888888', 50);
    metalTexture.repeat.set(2, 2);

    enemyTexture = createNoiseTexture(256, 256, '#aa2222', 80);

    // Pre-allocate geometries and materials to avoid GC pauses
    sharedProjGeo = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
    sharedProjGeo.rotateX(Math.PI / 2);
    sharedProjMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

    sharedEnemyCoreGeo = new THREE.DodecahedronGeometry(2);
    sharedEnemyCoreMat = new THREE.MeshStandardMaterial({
        map: enemyTexture,
        color: 0xaa0000,
        metalness: 0.8,
        roughness: 0.2
    });

    sharedEnemySpikeGeo = new THREE.ConeGeometry(0.5, 3, 4);
    sharedEnemySpikeMat = new THREE.MeshStandardMaterial({
        map: metalTexture,
        color: 0x333333,
        metalness: 0.9,
        roughness: 0.5
    });

    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510); // Darker blue/black night sky
    scene.fog = new THREE.FogExp2(0x050510, 0.005); // Exponential fog looks more realistic

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Position camera behind and slightly above the player's typical position
    camera.position.set(0, 10, 30);
    camera.lookAt(0, 0, -50);

    // 3. Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // 4. Lights
    // Cool blueish ambient light for night/space
    const ambientLight = new THREE.AmbientLight(0x223355, 0.5);
    scene.add(ambientLight);

    // Warm directional light representing a distant star or moon
    const dirLight = new THREE.DirectionalLight(0xffddaa, 1.2);
    dirLight.position.set(100, 200, -50); // Light from ahead/above to cast long shadows backward
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    scene.add(dirLight);

    // Add a point light to simulate a glowing engine/core
    const pointLight = new THREE.PointLight(0x0088ff, 1, 100);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

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
    const bodyMat = new THREE.MeshStandardMaterial({
        map: metalTexture,
        color: 0x2244ff,
        metalness: 0.6,
        roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1;
    body.castShadow = true;
    body.receiveShadow = true;
    player.add(body);

    // Wings
    const wingGeo = new THREE.BoxGeometry(10, 0.5, 3);
    const wingMat = new THREE.MeshStandardMaterial({
        map: metalTexture,
        color: 0x1122aa,
        metalness: 0.7,
        roughness: 0.4
    });
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.position.set(0, 0.8, 1);
    wing.castShadow = true;
    player.add(wing);

    // Cockpit
    const cockpitGeo = new THREE.BoxGeometry(2, 1, 4);
    const cockpitMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.9,
        roughness: 0.1
    });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 2, -1);
    cockpit.castShadow = true;
    player.add(cockpit);

    // Engine Glow
    const engineGeo = new THREE.CylinderGeometry(0.8, 1, 0.5, 16);
    const engineMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const engine1 = new THREE.Mesh(engineGeo, engineMat);
    engine1.rotation.x = Math.PI / 2;
    engine1.position.set(-1, 1, 4);
    player.add(engine1);

    const engine2 = engine1.clone();
    engine2.position.set(1, 1, 4);
    player.add(engine2);

    // Gun Mount (we will spawn projectiles from here)
    const gunGeo = new THREE.CylinderGeometry(0.2, 0.2, 2);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.2 });
    const gun1 = new THREE.Mesh(gunGeo, gunMat);
    gun1.rotation.x = Math.PI / 2;
    gun1.position.set(-2, 1.2, -3);
    gun1.castShadow = true;
    player.add(gun1);

    const gun2 = gun1.clone();
    gun2.position.set(2, 1.2, -3);
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
    gridHelper.position.y = -1.9; // Slightly above ground to prevent z-fighting
    scene.add(gridHelper);

    // Ground plane to receive shadows
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({
        map: groundTexture,
        roughness: 0.9,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Starry Sky
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPos = new Float32Array(starCount * 3);
    for(let i=0; i<starCount * 3; i+=3) {
        // Random position in a dome shape
        const r = 400;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = Math.abs(r * Math.sin(phi) * Math.sin(theta)); // Only upper hemisphere
        const z = r * Math.cos(phi);

        starPos[i] = x;
        starPos[i+1] = y;
        starPos[i+2] = z;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({color: 0xffffff, size: 0.5});
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
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
    // Projectile visual - glowing laser tracer
    // Using pre-allocated shared geometry and material
    const projectile = new THREE.Mesh(sharedProjGeo, sharedProjMat);

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

    // Animate Player Ship (Hovering and Banking)
    if (player) {
        // Hover bobbing
        const time = clock.getElapsedTime();
        player.position.y = Math.sin(time * 2) * 0.2;

        // Banking based on mouse position
        // When mouse is right (positive x), bank right (negative z rotation)
        const targetBank = -mouse.x * 0.5;
        // Smoothly interpolate current rotation to target bank
        player.rotation.z += (targetBank - player.rotation.z) * 5 * delta;

        // Slight pitch based on mouse y
        const targetPitch = mouse.y * 0.2;
        player.rotation.x += (targetPitch - player.rotation.x) * 5 * delta;
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
    // Group for complex enemy shape
    const enemy = new THREE.Group();

    // Core body
    // Using pre-allocated shared geometry and material
    const core = new THREE.Mesh(sharedEnemyCoreGeo, sharedEnemyCoreMat);
    core.castShadow = true;
    enemy.add(core);

    // Armor plates/spikes
    // Using pre-allocated shared geometry and material
    for (let i = 0; i < 4; i++) {
        const spike = new THREE.Mesh(sharedEnemySpikeGeo, sharedEnemySpikeMat);
        spike.rotation.x = Math.PI / 2;
        spike.position.set(Math.cos(i * Math.PI / 2) * 2, Math.sin(i * Math.PI / 2) * 2, 0);
        spike.castShadow = true;
        enemy.add(spike);
    }

    // Spawn far away, slightly randomized x position
    const xPos = (Math.random() - 0.5) * 60; // range -30 to 30
    enemy.position.set(xPos, 2.5, -300);

    // Add random rotation speed for visual interest
    enemy.userData = {
        hp: 1,
        rotSpeedX: (Math.random() - 0.5) * 2,
        rotSpeedY: (Math.random() - 0.5) * 2
    };

    scene.add(enemy);
    enemies.push(enemy);
}

function updateEnemies(delta) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        // Move towards player
        enemy.position.z += (gameState.speed + 20) * delta;

        // Rotate for visual interest
        enemy.rotation.x += enemy.userData.rotSpeedX * delta;
        enemy.rotation.y += enemy.userData.rotSpeedY * delta;

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
        sharedProjBox.setFromObject(proj);

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            sharedEnemyBox.setFromObject(enemy);

            if (sharedProjBox.intersectsBox(sharedEnemyBox)) {
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
    const particleCount = 40;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const colors = new Float32Array(particleCount * 3);

    const colorStart = new THREE.Color(0xffffff);
    const colorMid = new THREE.Color(0xffaa00);

    for (let i = 0; i < particleCount; i++) {
        // Start at center
        positions[i * 3] = position.x;
        positions[i * 3 + 1] = position.y;
        positions[i * 3 + 2] = position.z;

        // Random velocity outward with upward bias
        velocities.push({
            x: (Math.random() - 0.5) * 60,
            y: (Math.random() * 40) + 10,
            z: (Math.random() - 0.5) * 60
        });

        // Initial color (bright flash)
        colors[i * 3] = colorStart.r;
        colors[i * 3 + 1] = colorStart.g;
        colors[i * 3 + 2] = colorStart.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Additive blending for fiery look
    const material = new THREE.PointsMaterial({
        size: 2.5,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 1.0,
        depthWrite: false
    });

    const particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData = { velocities: velocities, life: 1.0, initialLife: 1.0 };

    scene.add(particleSystem);
    particles.push(particleSystem);
}

function updateParticles(delta) {
    const gravity = -50; // downward pull over time

    for (let i = particles.length - 1; i >= 0; i--) {
        const ps = particles[i];
        ps.userData.life -= delta;

        if (ps.userData.life <= 0) {
            // Clean up resources properly!
            ps.geometry.dispose();
            ps.material.dispose();
            scene.remove(ps);
            particles.splice(i, 1);
            continue;
        }

        const lifeRatio = ps.userData.life / ps.userData.initialLife;
        const positions = ps.geometry.attributes.position.array;
        const colors = ps.geometry.attributes.color.array;
        const velocities = ps.userData.velocities;

        // Interpolate colors: White -> Orange -> Dark Red/Grey
        let r = 1, g = 1, b = 1;
        if (lifeRatio > 0.7) {
            // White to Orange
            const t = (1.0 - lifeRatio) / 0.3;
            r = 1; g = 1 - (t * 0.4); b = 1 - t;
        } else {
            // Orange to Dark Smoke
            const t = lifeRatio / 0.7; // 1 to 0
            r = t; g = t * 0.6; b = t * 0.1;
        }

        for (let j = 0; j < velocities.length; j++) {
            // Apply gravity to velocity
            velocities[j].y += gravity * delta;
            // Apply drag
            velocities[j].x *= 0.95;
            velocities[j].z *= 0.95;

            // Move particle
            positions[j * 3] += velocities[j].x * delta;
            positions[j * 3 + 1] += velocities[j].y * delta;
            positions[j * 3 + 2] += velocities[j].z * delta;

            // Update color
            colors[j * 3] = r;
            colors[j * 3 + 1] = g;
            colors[j * 3 + 2] = b;
        }

        ps.geometry.attributes.position.needsUpdate = true;
        ps.geometry.attributes.color.needsUpdate = true;

        // Fade out at the very end
        if (lifeRatio < 0.3) {
             ps.material.opacity = lifeRatio / 0.3;
        }
    }
}

// Start
init();