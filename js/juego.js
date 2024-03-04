// Autor: Oscar Rosello Ibañez
// Versión: 1.0
// Descripción: Código de un juego en 3D con three.js

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";

// --VARIABLES GLOBALES--
// Camara escena y render
let camera, scene, renderer;

// Variables de movimiento
let mouseX = 0, mouseY = 0;
let previousMouseX = 0, previousMouseY = 0;

// Objetos
let robot, objetos;

//Teclas
let keys = {};

// Animaciones
let clock, mixer, idleAnimation, walkAnimation, runAnimation;

// --ACCIONES--
init();
loadScene();
setTimeout(() => { render(); }, 500);

// --FUNCIONES--
// Inicializar el entorno
function init()
{
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('container').appendChild( renderer.domElement );

    // Reloj
    clock = new THREE.Clock();

    // Crear la escena
    scene = new THREE.Scene();
    const backloader = new THREE.CubeTextureLoader();
    const fondo = backloader.load([
        'images/SkyBox/posx.bmp', // Derecha
        'images/SkyBox/negx.bmp', // Izquierda
        'images/SkyBox/posy.bmp', // Arriba
        'images/SkyBox/negy.bmp', // Abajo
        'images/SkyBox/posz.bmp', // Frente
        'images/SkyBox/negz.bmp'  // Atrás
    ]);
    scene.background = fondo;

    // Crear la cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0,0.25,-1.5);

    // Eventos
    // Ecento de tecla pulsada
    document.addEventListener('keydown', (event) => {
        if (event.key == 'Shift') {
            keys['Shift'] = !keys['Shift'];
        }else{
            keys[event.key] = true;
        }
    });
    // Evento de tecla soltada
    document.addEventListener('keyup', (event) => {
        if (event.key in keys && event.key != "Shift"){
            keys[event.key] = false;
        }
    });
    // Evento de ratón movido
    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });
    // Evento de redimensionar la ventana
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

//Cargar objetos de la escena
function loadScene()
{
    //Definir texture loader
    var textureLoader = new THREE.TextureLoader();

    // Suelo
    var texture = textureLoader.load('images/grass.png');
    // Set tiling properties
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    const materialSuelo = new THREE.MeshBasicMaterial({ map: texture });
    const geometriaSuelo = new THREE.BoxGeometry (50,1,50);
    const suelo = new THREE.Mesh( geometriaSuelo, materialSuelo);
    suelo.rotation.y = Math.PI/2
    suelo.position.y = -0.75
    scene.add(suelo);

    // Muros
    let rotation = 0;
    let posiciones = [[0,2,25],[25,2,0],[0,2,-25],[-25,2,0]]
    var texture = textureLoader.load('images/wall.png');
    // Propiedades de repetición de textura
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(50, 20);
    const geometriaMuro = new THREE.BoxGeometry(50, 5, 1);
    const materialMuro = new THREE.MeshBasicMaterial({ map: texture });
    for(let i=0; i<4; i++){
        const muro = new THREE.Mesh(geometriaMuro, materialMuro);
        muro.position.set(posiciones[i][0],posiciones[i][1],posiciones[i][2])
        muro.rotation.y = rotation
        scene.add(muro)
        rotation += Math.PI/2
    }

    // Personaje principal modelo gltf robot
    var loader = new GLTFLoader();
    loader.load('models/Soldier/soldier.glb', function (gltf) {
        robot = gltf.scene;
        robot.scale.set(0.25, 0.25, 0.25);
        robot.position.y = -0.25;

        // Animaciones
        const animations = gltf.animations;

        mixer = new THREE.AnimationMixer(robot);

        idleAnimation = mixer.clipAction(animations[0]);
        walkAnimation = mixer.clipAction(animations[3]);
        runAnimation = mixer.clipAction(animations[1]);
        
        idleAnimation.play();
        idleAnimation.setEffectiveWeight(1);
        walkAnimation.play();
        walkAnimation.setEffectiveWeight(0);
        runAnimation.play();
        runAnimation.setEffectiveWeight(0);

        scene.add(robot);
    });

    // Crear objetos para recolectar
    objetos = new THREE.Object3D();
    scene.add(objetos);
    for (let i = 0; i < 50; i++) {
        const geometriaManiqui = new THREE.BoxGeometry(1, 2, 0.5);
        const materialManiqui = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const maniqui = new THREE.Mesh(geometriaManiqui, materialManiqui);
        maniqui.position.set(Math.random() * 50 - 10, 0, Math.random() * 50 - 10);
        objetos.add(maniqui);
        const geometriaObjeto = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const materialObjeto = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const objeto = new THREE.Mesh(geometriaObjeto, materialObjeto);
        objeto.position.set(Math.random() * 50 - 10, 0, Math.random() * 50 - 10);
        objetos.add(objeto);
    }

    // Creación del sol
    const sol = new THREE.Mesh( new THREE.SphereGeometry(5), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
    sol.position.set(0, 20, 0);
    scene.add(sol);
    // Creación de la luz
    const luz = new THREE.PointLight(0xffffff, 1);
    luz.position.set(0, 20, 0);
    scene.add(luz);
    // Creación de la luz ambiental
    const luzAmbiente = new THREE.AmbientLight(0x404040);
    scene.add(luzAmbiente);
}

function animate()
{

    let mixerUpdateDelta = clock.getDelta();

    mixer.update( mixerUpdateDelta );

    // Movimiento de la cámara para seguir al personaje
    camera.position.x = robot.position.x;
    camera.position.z = robot.position.z + 1;

    // Movimiento de la camara en los tres ejes con el raton siguiendo al personaje
    let deltaX = mouseX - previousMouseX;
    let deltaY = mouseY - previousMouseY;
    robot.rotation.y -= deltaX * 0.01;
    camera.position.x = robot.position.x + Math.sin(robot.rotation.y) * 1;
    camera.position.z = robot.position.z + Math.cos(robot.rotation.y) * 1;
    //camera.position.y = robot.position.y + deltaY * 0.01;
    camera.lookAt(robot.position);
    previousMouseX = mouseX;
    previousMouseY = mouseY;

    // Animaciones y movimiento del personaje
    let speed;

    // Si se pulsa shift, el personaje corre
    if (keys['Shift']) {
        // Activa la animacion de run
        walkAnimation.setEffectiveWeight(0);
        runAnimation.setEffectiveWeight(1);
        idleAnimation.setEffectiveWeight(0);
        speed = 0.1;
    } else {
        // Activa la animacion de walk
        walkAnimation.setEffectiveWeight(1);
        runAnimation.setEffectiveWeight(0);
        idleAnimation.setEffectiveWeight(0);
        speed = 0.05;
    }

    // Movimiento del personaje con las teclas
    if (keys['w']) {
        // Movimiento del personaje
        robot.position.x -= Math.sin(robot.rotation.y) * speed;
        robot.position.z -= Math.cos(robot.rotation.y) * speed;
    } else if (keys['s']) {
        // Movimiento del personaje
        robot.position.x += Math.sin(robot.rotation.y) * speed;
        robot.position.z += Math.cos(robot.rotation.y) * speed;
    } else {
        // Activa la animacion de idle
        walkAnimation.setEffectiveWeight(0);
        runAnimation.setEffectiveWeight(0);
        idleAnimation.setEffectiveWeight(1);
        speed = 0;
    }
}

function render()
{
    requestAnimationFrame( render );
    animate();
    renderer.render( scene, camera );
}