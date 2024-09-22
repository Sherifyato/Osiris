let scene, camera, renderer, controls, raycaster, mouse, labelDiv;
let planetGroup = [];

function init() {
    // Create the scene
    scene = new THREE.Scene();

    // Create a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(200, 200, 200); // Start with a higher position to get an overview

    // Create a renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Create OrbitControls for camera interaction
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth controls
    controls.dampingFactor = 0.25;
    controls.enableZoom = true; // Enable zoom
    controls.enablePan = true; // Enable panning
    controls.panSpeed = 0.5; // Adjust panning speed
    controls.screenSpacePanning = true; // Enable panning in screen space (not orbiting)
    controls.target.set(0, 0, 0); // You can change this to any position you want to focus on

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
    labelDiv.style.position = 'absolute';
    labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    labelDiv.style.color = 'white';
    labelDiv.style.padding = '8px';
    labelDiv.style.borderRadius = '5px';
    labelDiv.style.fontFamily = 'Arial, sans-serif';
    labelDiv.style.fontSize = '14px';
    labelDiv.style.border = '1px solid white';
    labelDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.5)';
    labelDiv.style.transition = 'all 0.3s ease';
    labelDiv.style.display = 'none'; // Hide initially
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
    window.addEventListener('mousedown', onMouseDown, false);

    // Event listener for keyboard controls
    window.addEventListener('keydown', function (event) {
        switch (event.code) {
            case 'ArrowUp':
                controls.target.y += 10; // Move up
                break;
            case 'ArrowDown':
                controls.target.y -= 10; // Move down
                break;
            case 'ArrowLeft':
                controls.target.x -= 10; // Move left
                break;
            case 'ArrowRight':
                controls.target.x += 10; // Move right
                break;
        }
        controls.update(); // Update the controls to apply the changes
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // Update controls
        renderer.render(scene, camera); // Render scene
    }

    animate();
}

// Function to handle mouse movement and update raycaster
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Function to handle mouse click and detect object under mouse
function onMouseDown(event) {
    if (event.button === 0) { // Left mouse button only for object selection
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
}

window.onload = init;

// Update window size dynamically
window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
