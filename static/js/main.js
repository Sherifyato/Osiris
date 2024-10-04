// global variables for scene setup
let scene, camera, renderer, controls, raycaster, mouse, labelDiv;
let planetGroup = [];
let inScene = [];
let panSpeed = 2;

// earth is the reference point for distance and size
function calcDistance(x, y, z) {
    distance = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    return Math.round(distance * 100) / 100;
}

starColours = ['#37ff00', '#ff9900', '#ff6600', '#ff3300', '#1aa9de']
// starColoursg
// starColoursb
// convert to rgb

stars = [];

function addStarField() {
    starGeometry = [];
    starmaterial = [];
    colourCount = starColours.length;

    for (let num = 0; num < colourCount; num++) {
        starGeometry.push(new THREE.BufferGeometry())
        let starCount = 1000
        let starVertices = [];

        // Randomly place stars around the viewer's perspective
        for (let i = 0; i < starCount; i++) {
            let x = (Math.random() - 0.5) * 2000; // Random x-coordinate
            let y = (Math.random() - 0.5) * 2000; // Random y-coordinate
            let z = (Math.random() - 0.5) * 2000; // Random z-coordinate
            starVertices.push(x, y, z);
        }

        // starGeometry[num].setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        // starMaterial = new THREE.PointsMaterial({color: starColours[num]});
        // stars.push(new THREE.Points(starGeometry, starMaterial));
        // starVertices.length = 0;
        // objLoader for stars moon.obj

        starGeometry[num].setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

        // stars shape is moon.obj
        // stars[num] = new THREE.ObjectLoader().load('/static/models/moon.obj', (model) =>{
        //     model.traverse((child) => {
        //         if(child.isMesh){
        //             child.material.color.set(starColours[num]);
        //         }
        //     })
        //     scene.add(model);
        // });

        starmaterial.push(new THREE.PointsMaterial({color: starColours[num]}));
        stars.push(new THREE.Points(starGeometry[num], starmaterial[num]));


    }

    for (let i = 0; i < colourCount; i++) {
        scene.add(stars[i]);
    }

}

function addGalaxyBackground() {
    const galaxyTexture = new THREE.TextureLoader().load('/static/images/galaxy.jpg');
    // set galaxy geometry to cover full screen
    const galaxyGeometry = new THREE.PlaneGeometry(1000, 1000);
    const galaxyMaterial = new THREE.MeshBasicMaterial({
        map: galaxyTexture,
        //make side anything but backside
        side: THREE.DoubleSide
    });
    const galaxyMesh = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
    scene.add(galaxyMesh);
}

// Call this function after initializing the scene


function animate() {
    requestAnimationFrame(animate);
    // Rotate the star field and
    // scene.getObjectByName('stars').rotation.y += 0.0001;
    // scene.getObjectByName('galaxyMesh').rotation.y += 0.0001;

    controls.update();
    renderer.render(scene, camera);
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
    // addStarField();
    // addGalaxyBackground();

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
    //     <iframe src="https://eyes.nasa.gov/apps/solar-system/#/home?embed=true" width="400" height="250"></iframe>
    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;

        // Display label with information near the clicked object
        labelDiv.style.display = 'block';
        let planetName = intersectedObject.userData.name;
        // if there is spaces in the name, replace with _
        planetName = planetName.replace(/\s/g, "_");
        let url = `https://eyes.nasa.gov/apps/exo/#/planet/${planetName}?embed=true&logo=false&menu=false`;
        labelDiv.innerHTML = `
            <a href="http://127.0.0.1:5000/${planetName}" target="_blank">${intersectedObject.userData.name}</a><br>
            <strong>Distance:</strong> ${intersectedObject.userData.distance} pc
            <iframe src="https://eyes.nasa.gov/apps/exo/#/planet/${planetName}?embed=true&featured=false&logo=false&menu=false" width="400" height="200"></iframe>        `;

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
    distanceFilter = parseFloat(document.getElementById('distanceSlider').value);
    sizeFilter = parseFloat(document.getElementById('sizeSlider').value);
    planetGroup.forEach(planet => {
        if (inScene[planet.userData.name] == false) {
            if (planet.userData.distance < distanceFilter)
                scene.add(planet), inScene[planet.userData.name] = true;
        } else {
            if (planet.userData.distance > distanceFilter)
                scene.remove(planet), inScene[planet.userData.name] = false;
        }
    });

}

function resetFilters() {
    document.getElementById('distanceSlider').value = 1000;
    document.getElementById('sizeSlider').value = 2;
    // edit in label
    document.getElementById('distanceValue').textContent = 1000;
    document.getElementById('sizeValue').textContent = 2;
    // clear old scene
    planetGroup.forEach(planet => {
        if (inScene[planet.userData.name] == false) {
            scene.add(planet);
            inScene[planet.userData.name] = true;
        }
    });
}


function loadExoplanetData() {
    fetch('/exoplanet_data')
        .then(response => response.json())
        .then(data => {
            data.forEach(exoplanet => {
                let exoGeometry = new THREE.SphereGeometry(2, 32, 32);
                let exoMaterial = new THREE.MeshStandardMaterial({
                    color: 0x0000ff,
                    roughness: 0.7,
                    metalness: 0.1
                });
                let exoplanetMesh = new THREE.Mesh(exoGeometry, exoMaterial);

                exoplanetMesh.position.set(exoplanet.x, exoplanet.y, exoplanet.z);
                exoplanetMesh.userData = {
                    name: exoplanet.pl_name,
                    distance: calcDistance(exoplanet.x, exoplanet.y, exoplanet.z)
                };

                planetGroup.push(exoplanetMesh);
                scene.add(exoplanetMesh);
                inScene[exoplanet.pl_name] = true;
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
