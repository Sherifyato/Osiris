let scene, camera, renderer, controls, planetGroup;

function init() {
    // Create the scene
    scene = new THREE.Scene();

    // Add background texture (Milky Way or galaxy image)
    const loader = new THREE.TextureLoader();
    loader.load('path_to_your_background_image.jpg', function(texture){
        scene.background = texture;
    });

    // Create a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    // Create a renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadows
    document.getElementById('container').appendChild(renderer.domElement);

    // Create OrbitControls for camera interaction
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth controls

    // Ambient light to illuminate the scene
    scene.add(new THREE.AmbientLight(0x555555));

    // Directional light to simulate sunlight
    let sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(50, 50, 50);
    sunLight.castShadow = true; // Enable shadows
    scene.add(sunLight);

    // Create a group to hold all planets and stars
    planetGroup = new THREE.Group();
    scene.add(planetGroup);

    // Load exoplanet data
    fetch('/exoplanet_data')
        .then(response => response.json())
        .then(data => {
            data.forEach(exoplanet => {
                // Create planet with texture and realistic size
                let planetTexture = new THREE.TextureLoader().load('path_to_planet_texture.jpg');
                let exoGeometry = new THREE.SphereGeometry(1, 50, 50); // Adjust size for realism
                let exoMaterial = new THREE.MeshPhongMaterial({
                    map: planetTexture,
                    bumpMap: planetTexture,
                    bumpScale: 0.05
                });
                let exoplanetMesh = new THREE.Mesh(exoGeometry, exoMaterial);
                exoplanetMesh.position.set(exoplanet.x, exoplanet.y, exoplanet.z);
                exoplanetMesh.castShadow = true; // Enable shadows

                // Add interactive event listener
                exoplanetMesh.userData = { name: exoplanet.pl_name };
                exoplanetMesh.callback = function() {
                    displayInfoPanel(this.userData.name); // Show planet info
                };

                planetGroup.add(exoplanetMesh);
            });
        })
        .catch(error => console.error('Error fetching exoplanet data:', error));

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // Update controls
        renderer.render(scene, camera); // Render scene
    }

    animate();
}

// Function to display planet information
function displayInfoPanel(planetName) {
    // Implement logic to display a panel with planet details (e.g., name, discovery method, etc.)
    let infoPanel = document.getElementById('info-panel');
    infoPanel.innerHTML = `Selected Planet: ${planetName}`;
    infoPanel.style.display = 'block';
}

// Update window size dynamically
window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

window.onload = init;
