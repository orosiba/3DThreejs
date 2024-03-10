// Autor: Oscar Rosello Ibañez
// Versión: 1.0
// Descripción: Código de un juego en 3D con three.js


// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {GUI} from "../lib/lil-gui.module.min.js";
import { TWEEN } from "../lib/tween.module.min.js";


// --VARIABLES GLOBALES--
// Camara escena y render
let camera, scene, renderer;

// Variables de movimiento
let mouseX = 0, mouseY = 0;
let previousMouseX = 0, previousMouseY = 0;

// Objetos
let robot, objetos, enemigos, muros;

//Teclas
let keys = {};

// Animaciones
let acciones = {};
let clock, mixer, accionActiva, accionPrevia;

// Puntuacion y estado
let puntuacion = 0;
let muerto = false;

// --ACCIONES--
init();
loadScene();
createGUI();
setTimeout(() => { render(); }, 500);

// --FUNCIONES--
//Realizar un fade entre dos animaciones
function fadeToAction( accion, duracion ) {

    accionPrevia = accionActiva;
    accionActiva = acciones[ accion ];

    if ( accionPrevia !== accionActiva ) {

        accionPrevia.fadeOut( duracion ).stop();
        accionActiva
        .reset()
        .setEffectiveWeight( 1 )
        .fadeIn( duracion )
        .play();

    }

}

// Metodo de geometria de un tornillo
function tornillo() {
    var geometry = new THREE.CylinderGeometry( 0.1, 0.1, 0.5, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var cylinder = new THREE.Mesh( geometry, material );
    return cylinder;
}

// Metodo de la geometria de una tuerca
function tuerca() {
    var geometry = new THREE.TorusGeometry( 0.05, 0.015, 5, 6 );
    var material = new THREE.MeshPhongMaterial( { color: 0x808080 } );
    var torus = new THREE.Mesh( geometry, material );
    return torus;
}

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
    camera.position.set(0,0,-1);

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
    const materialSuelo = new THREE.MeshPhongMaterial({ map: texture });
    const geometriaSuelo = new THREE.BoxGeometry (40,1,40);
    const suelo = new THREE.Mesh( geometriaSuelo, materialSuelo);
    suelo.rotation.y = Math.PI/2
    suelo.position.y = -0.75
    scene.add(suelo);

    // Muros
    // Propiedades de los muros
    let rotation = 0;
    let posiciones = [[0,2,20],[20,2,0],[0,2,-20],[-20,2,0]]
    var texture = textureLoader.load('images/wall.png');
    const geometriaMuro = new THREE.BoxGeometry(40, 5, 1);
    const materialMuro = new THREE.MeshPhongMaterial({ map: texture });
    // Propiedades de repetición de textura
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20);
    muros = new THREE.Object3D();
    scene.add(muros);
    for(let i=0; i<4; i++){
        const muro = new THREE.Mesh(geometriaMuro, materialMuro);
        muro.position.set(posiciones[i][0],posiciones[i][1],posiciones[i][2])
        muro.rotation.y = rotation
        muros.add(muro)
        rotation += Math.PI/2
    }

    // Personaje principal modelo gltf robot
    var loader = new GLTFLoader();
    loader.load('models/Soldier/soldier.glb', function (gltf) {
        robot = gltf.scene;
        robot.scale.set(0.05, 0.05, 0.05);
        robot.position.y = -0.25;

        // Animaciones
        const animations = gltf.animations;

        mixer = new THREE.AnimationMixer(robot);

        acciones['idleAnimation'] = mixer.clipAction(animations[2]);
        acciones['walkAnimation'] = mixer.clipAction(animations[10]);
        acciones['runAnimation'] = mixer.clipAction(animations[6]);
        acciones['deathAnimation'] = mixer.clipAction(animations[1]);
        
        // Activar las animacciones y establecer pesos
        
        acciones['idleAnimation'].setEffectiveWeight(1).play();
        accionActiva = acciones['idleAnimation'];
        acciones['deathAnimation'].setLoop(THREE.LoopOnce);
        acciones['deathAnimation'].clampWhenFinished = true;

        scene.add(robot);

    });

    // Crear objetos para recolectar
    objetos = new THREE.Object3D();
    scene.add(objetos);
    for (let i = 0; i < 50; i++) {
        const objeto = tuerca();
        objeto.position.set(Math.random() * 40 - 5, -0.1, Math.random() * 40 - 5);
        objetos.add(objeto);
    }

    // Enemigos
    enemigos = new THREE.Object3D();
    scene.add(enemigos);
    for (let i = 0; i < 10; i++) {
        const geometriaEnemigo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const materialEnemigo = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const enemigo = new THREE.Mesh(geometriaEnemigo, materialEnemigo);
        enemigo.position.set(Math.random() * 30 - 15, 0, Math.random() * 30 - 15);
        enemigos.add(enemigo);
    }

    // Creación del sol
    const sol = new THREE.Mesh( new THREE.SphereGeometry(5), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
    sol.position.set(0, 25, 70);
    scene.add(sol);
    // Luz del sol
    var sunlight = new THREE.SpotLight(0xffffff, 1);
    sunlight.position.set(0, 25, 70);
    sunlight.target = suelo;
    scene.add(sunlight);
    // Helper de luz direccional
    var helper = new THREE.SpotLightHelper(sunlight, 5);
    scene.add(helper);
    // Luz ambiental
    var ambientLight = new THREE.AmbientLight(0x404040, 3); // Soft white light
    scene.add(ambientLight);
}

// Crea la interfaz de usuario
function createGUI()
{
	// Creacion interfaz
	const gui = new GUI();
    // Creacion de estadisticas de puntuacion
    const stats = gui.addFolder('Estadisticas');
    stats.add({ puntuacion: 0 }, 'puntuacion').listen().name('Puntuacion');
    stats.open();
}

// Animar la escena
function animate()
{

    // Actualizar Tween
    TWEEN.update();

    // Actualizar interfaz
    const puntuacionGUI = { puntuacion: puntuacion };
    const gui = new GUI();
    const stats = gui.addFolder('Estadisticas');
    stats.add(puntuacionGUI, 'puntuacion').listen().name('Puntuacion');
    stats.open();

    // Balanceo de los objetos usando Tween
    objetos.children.forEach(objeto => {
    
    objeto.rotation.y += 0.1;
    const tween = new TWEEN.Tween(objeto.position)
        .to({ y: 0.5 }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            objeto.position.y = -0.1;
        })
        .yoyo(true)
        .repeat(Infinity)
        .start();
    });

    let UpdateDelta = clock.getDelta();

    mixer.update( UpdateDelta );

    // Movimiento de la camara en los tres ejes con el raton siguiendo al personaje
    let deltaX = mouseX - previousMouseX;
    let deltaY = mouseY - previousMouseY;
    robot.rotation.y -= deltaX * 0.01;
    camera.position.x = robot.position.x - Math.sin(robot.rotation.y) * 1;
    camera.position.z = robot.position.z - Math.cos(robot.rotation.y) * 1;
    camera.lookAt(robot.position);
    previousMouseX = mouseX;
    previousMouseY = mouseY;

    // Animaciones y movimiento del personaje
    let speed;

    // Si se pulsa shift, el personaje corre
    if (keys['Shift'] && !muerto) {
        // Activa la animacion de run
        fadeToAction('runAnimation', 0.25);
        speed = 1;
    } else if (!muerto) {
        // Activa la animacion de walk
        fadeToAction('walkAnimation', 0.25);
        speed = 0.5;
    }

    // Movimiento del personaje con las teclas independiente de los fps
    if (keys['w'] && !muerto) {
        // Movimiento del personaje
        robot.position.x += Math.sin(robot.rotation.y) * speed * UpdateDelta;
        robot.position.z += Math.cos(robot.rotation.y) * speed * UpdateDelta;
    } else if (keys['s'] && !muerto) {
        // Movimiento del personaje
        robot.position.x -= Math.sin(robot.rotation.y) * speed * UpdateDelta;
        robot.position.z -= Math.cos(robot.rotation.y) * speed * UpdateDelta;
    } else if (!muerto) {
        // Activa la animacion de idle
        fadeToAction('idleAnimation', 0.25);
        speed = 0;
    }

    // Movimiento de los enemigos
    enemigos.children.forEach(enemigo => {
        enemigo.lookAt(robot.position);
        enemigo.position.x += Math.sin(enemigo.rotation.y) * 0.025;
        enemigo.position.z += Math.cos(enemigo.rotation.y) * 0.025;
    });

    // Colisiones con los objetos
    objetos.children.forEach(objeto => {
        if (robot.position.distanceTo(objeto.position) < 0.5) {
            objetos.remove(objeto);
            puntuacion++;
            updateGUI();
        }
    });

    // Colisiones con los enemigos
    enemigos.children.forEach(enemigo => {
        if (robot.position.distanceTo(enemigo.position) < 0.5) {
            muerto = true;

            // Activa la animacion de death
            fadeToAction('deathAnimation', 0.25);
            
            // Esperar un segundo y reiniciar el script
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    });
}

function render()
{
    requestAnimationFrame( render );
    animate();
    renderer.render( scene, camera );
}