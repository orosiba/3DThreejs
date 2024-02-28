/**
 * Escena.js
 * 
 * Seminario AGM #1. Escena basica en three.js: 
 * Transformaciones, animacion basica y modelos importados
 * 
 * @author <rvivo@upv.es>, 2023
 * 
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";

// --VARIABLES GLOBALES--
// Camara escena y render
let camera, scene, renderer;
let controls;

// Variables de movimiento
let mouseX = 0, mouseY = 0;
let previousMouseX = 0, previousMouseY = 0;
let ballVelocity = new THREE.Vector3();

// Objetos
let robot, objetos;
let keys = {};

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

    // Luces
    const light = new THREE.DirectionalLight(0xffffff, 5);
    light.position.set(10, 10, 0);
    scene.add(light);

    // Eventos
    // Ecento de tecla pulsada
    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });
    // Evento de tecla soltada
    document.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });
    // Evento de ratón movido
    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
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
    let posiciones = [[0,4.5,25],[25,4.5,0],[0,4.5,-25],[-25,4.5,0]]
    var texture = textureLoader.load('images/wall.png');
    // Propiedades de repetición de textura
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(50, 20);
    const geometriaMuro = new THREE.BoxGeometry(50, 10, 1);
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

        scene.add(robot);
        // Animaciones
        const animacion = gltf.animations[0];
        const mixer = new THREE.AnimationMixer(robot);
        const action = mixer.clipAction(animacion);
        action.play();
    });

    // Crear objetos para recolectar
    objetos = new THREE.Object3D();
    scene.add(objetos);
    for (let i = 0; i < 20; i++) {
        const geometriaObjeto = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const materialObjeto = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const objeto = new THREE.Mesh(geometriaObjeto, materialObjeto);
        objeto.position.set(Math.random() * 20 - 10, 0, Math.random() * 20 - 10);
        objetos.add(objeto);
    }
}

function animate()
{
    // Movimiento de la cámara para seguir al personaje
    camera.position.x = robot.position.x;
    camera.position.z = robot.position.z + 1;

    // Movimiento de la camara en los tres ejes con el raton siguiendo al personaje
    let deltaX = mouseX - previousMouseX;
    let deltaY = mouseY - previousMouseY;
    robot.rotation.y -= deltaX * 0.01;
    camera.position.x = robot.position.x + Math.sin(robot.rotation.y) * 1;
    camera.position.z = robot.position.z + Math.cos(robot.rotation.y) * 1;
    //camera.position.y = robot.position.y + Math.sin(deltaY * 0.01) * 1
    camera.lookAt(robot.position);
    previousMouseX = mouseX;
    previousMouseY = mouseY;

    // Movimiento del personaje con las teclas
    if (keys['w']) {
        robot.position.x -= Math.sin(robot.rotation.y) * 0.1;
        robot.position.z -= Math.cos(robot.rotation.y) * 0.1;
    }
    if (keys['s']) {
        robot.position.x += Math.sin(robot.rotation.y) * 0.1;
        robot.position.z += Math.cos(robot.rotation.y) * 0.1;
    }
    if (keys['a']) {
        robot.position.x += Math.sin(robot.rotation.y - Math.PI / 2) * 0.1;
        robot.position.z += Math.cos(robot.rotation.y - Math.PI / 2) * 0.1;
    }
    if (keys['d']) {
        robot.position.x += Math.sin(robot.rotation.y + Math.PI / 2) * 0.1;
        robot.position.z += Math.cos(robot.rotation.y + Math.PI / 2) * 0.1;
    }

}

function render()
{
    requestAnimationFrame( render );
    animate();
    renderer.render( scene, camera );
}