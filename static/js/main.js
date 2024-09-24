// global variables for scene setup
let scene, camera, renderer, controls, raycaster, mouse, labelDiv;
let planetGroup = [];
let panSpeed = 2;

// earth is the reference point for distance and size
function calcDistance(x, y, z) {
    distance = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    return Math.round(distance * 100) / 100;
}

class Exoplanet {
    constructor(name, distance, x, y, z) {
        this.name = name;
        this.distance = distance;
        this.x = x;
        this.y = y;
        this.z = z;
    }

}

// Initialize the 3D scene
function init() {

    sceneSetup();
    loadExoplanetData();
    applyEventListeners();

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}

// mouse movement and raycaster
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick(event) {
    // Update the raycaster based on the mouse position
    raycaster.setFromCamera(mouse, camera);
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
        labelDiv.style.display = 'none';
    }
}

// handle keyboard controls for panning (currently off)
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

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function applyFilters() {
    //placeholder for filtering
}

function resetFilters() {
    //placeholder for resetting filters
}


function loadExoplanetData() {
    fetch('/exoplanet_data')
        .then(response => response.json())
        .then(data => {
            data.forEach(exoplanet => {
                let exoGeometry = new THREE.SphereGeometry(2, 32, 32);
                let exoMaterial = new THREE.MeshStandardMaterial({
                    color: 0xaaaaaa, // Change to a more realistic color
                    roughness: 0.7,
                    metalness: 0.1
                });
                let exoplanetMesh = new THREE.Mesh(exoGeometry, exoMaterial);

                exoplanetMesh.position.set(exoplanet.x, exoplanet.y, exoplanet.z);
                exoplanetMesh.userData = {
                    name: exoplanet.pl_name,
                    distance: calcDistance(exoplanet.x, exoplanet.y, exoplanet.z)
                };

                planetGroup.push(exoplanetMesh); // Add to group for raycasting
                scene.add(exoplanetMesh);
            });
        })
        .catch(error => console.error('Error fetching exoplanet data:', error));
}

function sceneSetup() {
    scene = new THREE.Scene(); //scene

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100; // camera

    renderer = new THREE.WebGLRenderer({antialias: true}); // renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth controls
    controls.dampingFactor = 0.25;
    controls.enableZoom = true; // orbit controls

    const ambientLight = new THREE.AmbientLight(0xaaaaaa); // Soft white light
    scene.add(ambientLight); // ambient light

    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(50, 50, 50);
    sunLight.castShadow = true; // Enable shadows
    scene.add(sunLight); // sunlight

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(); // raycaster and mouse

    labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    document.body.appendChild(labelDiv);
}

function applyEventListeners() {

    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onMouseClick, false);

    // slider inputs and buttons
    const distanceSlider = document.getElementById('distanceSlider');
    const sizeSlider = document.getElementById('sizeSlider');
    const distanceValue = document.getElementById('distanceValue');
    const sizeValue = document.getElementById('sizeValue');

    distanceSlider.addEventListener('input', () => {
        distanceValue.textContent = distanceSlider.value;
        distanceFilter = parseFloat(distanceSlider.value);
    });
    sizeSlider.addEventListener('input', () => {
        sizeValue.textContent = sizeSlider.value;
        sizeFilter = parseFloat(sizeSlider.value);
    });

    const applyBtn = document.getElementById('apply-btn');
    applyBtn.addEventListener('click', () => {
        applyFilters();
    });
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => {
        resetFilters();
    });

    document.addEventListener('keydown', onKeyDown, false);

    // sidebar toggle button
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-btn');
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    window.addEventListener('resize', onWindowResize, false);
}

init();
