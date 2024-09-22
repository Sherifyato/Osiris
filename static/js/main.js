// Variables for Three.js setup
let scene, camera, renderer, controls, raycaster, mouse, labelDiv;
let planetGroup = [];
let panSpeed = 2;

// Initialize the 3D scene
function init() {
    // Create the scene
    scene = new THREE.Scene();

    // Create a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    // Create a renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Create OrbitControls for camera interaction
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth controls
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xaaaaaa); // Soft white light
    scene.add(ambientLight);

    // Directional light to simulate sunlight
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(50, 50, 50);
    sunLight.castShadow = true; // Enable shadows
    scene.add(sunLight);

    // Create a raycaster for detecting clicks
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Create a label div for displaying information
    labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    document.body.appendChild(labelDiv);

    // Load exoplanet data
    fetch('/exoplanet_data')
        .then(response => response.json())
        .then(data => {
            data.forEach(exoplanet => {
                let exoGeometry = new THREE.SphereGeometry(2, 32, 32); // Adjust size as needed
                let exoMaterial = new THREE.MeshStandardMaterial({
                    color: 0xaaaaaa, // Change to a more realistic color
                    roughness: 0.7,
                    metalness: 0.1
                });
                let exoplanetMesh = new THREE.Mesh(exoGeometry, exoMaterial);

                exoplanetMesh.position.set(exoplanet.x, exoplanet.y, exoplanet.z);
                exoplanetMesh.userData = {
                    name: exoplanet.pl_name,
                    distance: exoplanet.sy_dist, // Include additional data as needed
                };

                planetGroup.push(exoplanetMesh); // Add to group for raycasting
                scene.add(exoplanetMesh);
            });
        })
        .catch(error => console.error('Error fetching exoplanet data:', error));

    // Event listener for mouse movement
    window.addEventListener('mousemove', onMouseMove, false);
    // Event listener for mouse click
    window.addEventListener('click', onMouseClick, false);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // Update controls
        renderer.render(scene, camera); // Render scene
    }

    document.addEventListener('keydown', onKeyDown, false);
    animate();
}

// Function to handle mouse movement and update raycaster
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
    mouse.x = (event.clientX / window   .innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Function to handle mouse click and detect object under mouse
function onMouseClick(event) {
    // Update the raycaster based on the mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(planetGroup);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;

        // Display label with information near the clicked object
        labelDiv.style.display = 'block';
        labelDiv.innerHTML = `
            <strong>Planet Name:</strong> ${intersectedObject.userData.name} <br>
            <strong>Distance:</strong> ${intersectedObject.userData.distance} pc
        `;

        // Convert 3D position to 2D position on screen
        const vector = new THREE.Vector3();
        intersectedObject.getWorldPosition(vector);
        vector.project(camera);

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

        labelDiv.style.left = `${x}px`;
        labelDiv.style.top = `${y - 30}px`; // Adjust offset for better positioning
    } else {
        // Hide the label if no object is intersected
        labelDiv.style.display = 'none';
    }
}

// Function to handle keyboard controls for panning
function onKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
            camera.position.y += panSpeed; // Move up
            break;
        case 'ArrowDown':
            camera.position.y -= panSpeed; // Move down
            break;
        case 'ArrowLeft':
            camera.position.x -= panSpeed; // Move left
            break;
        case 'ArrowRight':
            camera.position.x += panSpeed; // Move right
            break;
    }
}

// Function to toggle the sidebar visibility
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggle-btn');
toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize the scene
init();
