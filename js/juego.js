// Autor: Oscar Rosello Ibañez
// Versión: 1.0
// Descripción: Código de un juego en 3D con three.js


// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {GUI} from "../lib/lil-gui.module.min.js";
import { TWEEN } from "../lib/tween.module.min.js";
import * as CANNON from "../lib/cannon-es.module.js";


// --VARIABLES GLOBALES--
// Camara escena y render
let camera, scene, renderer, world;

// Variables de movimiento
let mouseX = 0, mouseY = 0;
let previousMouseX = 0, previousMouseY = 0;

// Objetos
let robot, robotBody, objetos, enemigos, muros;

//Teclas
let keys = {};

// Animaciones
let accionesRobot = {};
let clock, mixer, accionActiva, accionPrevia;

// Puntuacion y estado
let gui;
let puntuacion = { 'puntuacion': 0 };
let muerto = false;

// --ACCIONES--
init();
loadScene();
createGUI();
setTimeout(() => { render(); }, 500);

// --FUNCIONES--

// Realizar un fade entre dos animaciones
function fadeToAction( accion, duracion ) {

    accionPrevia = accionActiva;
    accionActiva = accionesRobot[ accion ];

    if ( accionPrevia !== accionActiva ) {

        accionPrevia.fadeOut( duracion ).stop();
        accionActiva
        .reset()
        .setEffectiveWeight( 1 )
        .fadeIn( duracion )
        .play();

    }

}

// Funcion para la animación de los objetos
function objectBalance(){
    // Animacion de balanceo de los objetos
    objetos.children.forEach(objeto => {
        new TWEEN.Tween(objeto.position)
        .to({ y: [-0.05,-0.1] }, 2000)
        .easing(TWEEN.Easing.Linear.None)
        .repeat(Infinity)
        .start();
        // Animacion de rotacion de los objetos
        new TWEEN.Tween(objeto.rotation)
        .to({ y: Math.PI * 2 }, 2500)
        .easing(TWEEN.Easing.Linear.None)
        .repeat(Infinity)
        .start();
    });
}

// Metodo de geometria de un tornillo
function tornillo() {
    let tornillo = new THREE.Object3D();
    var geometry = new THREE.CylinderGeometry( 0.02, 0.02, 0.075, 7 );
    var material = new THREE.MeshBasicMaterial( { color: 0x808080 } );
    var cylinder = new THREE.Mesh( geometry, material );
    tornillo.add(cylinder);
    // Cabeza hemiesferica, alterar el thetaLength para que sea un cuarto de esfera
    var geometry = new THREE.SphereGeometry( 0.05, 15, 15, 0, Math.PI * 2, 0, Math.PI / 2);
    var material = new THREE.MeshBasicMaterial( { color: 0x808080 } );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.y = 0.025;
    tornillo.add(sphere);
    // Punta final del tornillo
    var geometry = new THREE.CylinderGeometry( 0.019, 0.001, 0.035, 7 );
    var material = new THREE.MeshBasicMaterial( { color: 0x808080 } );
    var cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.y = -0.055;
    tornillo.add(cylinder);
    return tornillo;
}

// Metodo de la geometria de una tuerca
function tuerca() {
    var geometry = new THREE.TorusGeometry( 0.05, 0.0175, 3, 7 );
    var material = new THREE.MeshBasicMaterial( { color: 0x808080 } );
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

    //Sombras
    renderer.shadowMap.enabled = true; 
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

    // Crear el mundo fisico
    world = new CANNON.World();
    world.gravity.set(0,-9.8,0);


    // Crear la cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0,0,0);

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
    const materialSuelo = new THREE.MeshLambertMaterial({ map: texture });
    const geometriaSuelo = new THREE.BoxGeometry (40,1,40);
    const suelo = new THREE.Mesh( geometriaSuelo, materialSuelo);
    suelo.rotation.y = Math.PI/2
    suelo.position.y = -0.75;
    suelo.receiveShadow = true;
    scene.add(suelo);

    // Crear un cuerpo que se adapte al suelo
    var shape = new CANNON.Box(new CANNON.Vec3(20, 0.5, 20));
    var body = new CANNON.Body({ mass: 0 });
    body.addShape(shape);
    body.position.copy(suelo.position);
    body.quaternion.copy(suelo.quaternion);
    world.addBody(body);

    // Muros
    // Propiedades de los muros
    let rotation = 0;
    let posiciones = [[0,2,20],[20,2,0],[0,2,-20],[-20,2,0]]
    var texture = textureLoader.load('images/wall.jpg');
    const geometriaMuro = new THREE.BoxGeometry(40, 5, 1);
    const materialMuro = new THREE.MeshLambertMaterial({ map: texture });
    // Propiedades de repetición de textura
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 4);
    muros = new THREE.Object3D();
    scene.add(muros);
    for(let i=0; i<4; i++){
        const muro = new THREE.Mesh(geometriaMuro, materialMuro);
        muro.position.set(posiciones[i][0],posiciones[i][1],posiciones[i][2])
        muro.rotation.y = rotation
        muro.receiveShadow = true;
        muro.castShadow = true;
        muros.add(muro)
        rotation += Math.PI/2

        // Crear un cuerpo que se adapte al muro
        var shape = new CANNON.Box(new CANNON.Vec3(20, 2.5, 0.5));
        var body = new CANNON.Body({ mass: 0 });
        body.addShape(shape);
        body.position.copy(muro.position);
        body.quaternion.copy(muro.quaternion);
        world.addBody(body);
    }

    // Personaje principal modelo gltf robot
    var loader = new GLTFLoader();
    loader.load('models/Robot/Robot.glb', function (gltf) {
        robot = gltf.scene;
        robot.scale.set(0.05, 0.05, 0.05);
        robot.position.y = -0.25;
        // Crear un cuerpo con forma de caja
        robotBody = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0,1,0),
            shape: new CANNON.Box(new CANNON.Vec3(0.2,0.2,0.2))
        });
        world.addBody(robotBody);

        // Animaciones
        const animations = gltf.animations;

        mixer = new THREE.AnimationMixer(robot);

        accionesRobot['idleAnimation'] = mixer.clipAction(animations[2]);
        accionesRobot['walkAnimation'] = mixer.clipAction(animations[10]);
        accionesRobot['runAnimation'] = mixer.clipAction(animations[6]);
        accionesRobot['deathAnimation'] = mixer.clipAction(animations[1]);
        
        // Activar las animacciones y establecer pesos
        
        accionesRobot['idleAnimation'].setEffectiveWeight(1).play();
        accionActiva = accionesRobot['idleAnimation'];
        accionesRobot['deathAnimation'].setLoop(THREE.LoopOnce);
        accionesRobot['deathAnimation'].clampWhenFinished = true;

        scene.add(robot);
    });

    // Crear arboles con la geometria de un cilindro y una esfera

    // Tronco
    let geometriaTronco = new THREE.CylinderGeometry( 0.1, 0.1, 0.75, 8 );
    // Texura wood
    var texture = textureLoader.load('images/tree.png');
    let materialTronco = new THREE.MeshLambertMaterial( { map: texture } );

    // Hojas
    var geometriaHojas = new THREE.SphereGeometry( 0.5, 15, 15 );
    // Textura leaves
    var texture = textureLoader.load('images/leaves.jpg');
    // Tiling properties
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    var materialHojas = new THREE.MeshLambertMaterial( { map: texture } );

    for (let i = 0; i < 15; i++) {
        // Tronco
        var cylinder = new THREE.Mesh( geometriaTronco, materialTronco );
        // Hojas
        var sphere = new THREE.Mesh( geometriaHojas, materialHojas );
        sphere.position.y = 0.7;
        // Arbol
        var arbol = new THREE.Object3D();
        arbol.add(cylinder);
        arbol.add(sphere);
        arbol.position.set(Math.random() * 30 - 15, 0, Math.random() * 30 - 15);
        scene.add(arbol);
        // Crear un cuerpo con forma de cilindro
        var shape = new CANNON.Cylinder(0.1, 0.1, 1, 8);
        var body = new CANNON.Body({ mass: 0 });
        body.addShape(shape);
        body.position.copy(arbol.position);
        world.addBody(body);
        // Sombras del arbol
        cylinder.castShadow = true;
        sphere.castShadow = true;
    }


    // Crear objetos para recolectar
    objetos = new THREE.Object3D();
    scene.add(objetos);
    for (let i = 0; i < 25; i++) {
        // Aleatorio entre tornillo y tuerca
        let objeto;
        if (Math.random() > 0.5) {
            objeto = tornillo();
        } else {
            objeto = tuerca();
        }
        objeto.position.set(Math.random() * 30 - 15, -0.1, Math.random() * 30 - 15);
        objetos.add(objeto);
    }

    objectBalance();

    // Añadir 3 enemigos usando el modelo gltf Enemy
    enemigos = new THREE.Object3D();
    scene.add(enemigos);
    for (let i = 0; i < 3; i++) {
        loader.load('models/Enemy/Enemy.glb', function (gltf) {
            let enemigo = gltf.scene;
            enemigo.scale.set(0.25, 0.25, 0.25);
            enemigo.position.set(Math.random() * 30 - 15, 0.25, Math.random() * 30 - 15);
            enemigos.add(enemigo);
        });
    }

    // Creación del sol
    const sol = new THREE.Mesh( new THREE.SphereGeometry(5), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
    sol.position.set(0, 25, 70);
    scene.add(sol);
    // Luz del sol
    var sunlight = new THREE.SpotLight(0xffffff, 1);
    sunlight.position.set(0, 25, 70);
    sunlight.target = suelo;
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.width = 1024;
    sunlight.shadow.mapSize.height = 1024;
    sunlight.shadow.camera.near = 10;
    sunlight.shadow.camera.far = 200;
    scene.add(sunlight);
    // Luz ambiental
    var ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
}

// Crea la interfaz de usuario
function createGUI()
{
    // Creacion de la interfaz con la puntuacion
    gui = new GUI();
    gui.add(puntuacion, 'puntuacion').name('Puntuacion').listen();
}

// Animar la escena
function animate()
{
    // --ACTUALIZACIONES--

    // Actualizar el reloj
    let UpdateDelta = clock.getDelta();

    // Actualizar Tween y mixer
    TWEEN.update();
    mixer.update( UpdateDelta );
    
    // Cannon
    world.step(1/60);

    // -- ANIMACIONES Y MOVIMIENTOS --

    // Movimiento de la camara en los tres ejes con el raton siguiendo al personaje
    let deltaX = mouseX - previousMouseX;
    let deltaY = mouseY - previousMouseY;
    robot.rotation.y -= deltaX * 0.005;
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
        robotBody.position.x += Math.sin(robot.rotation.y) * speed * UpdateDelta;
        robotBody.position.z += Math.cos(robot.rotation.y) * speed * UpdateDelta;
    } else if (keys['s'] && !muerto) {
        // Movimiento del personaje
        robotBody.position.x -= Math.sin(robot.rotation.y) * speed * UpdateDelta;
        robotBody.position.z -= Math.cos(robot.rotation.y) * speed * UpdateDelta;
    } else if (!muerto) {
        // Activa la animacion de idle
        fadeToAction('idleAnimation', 0.25);
        speed = 0;
    }
    robot.position.x = robotBody.position.x;
    robot.position.z = robotBody.position.z;

    // Movimiento de los enemigos buscando al personaje
    enemigos.children.forEach(enemigo => {
        let direccion = new THREE.Vector3();
        direccion.subVectors(robot.position, enemigo.position).normalize();
        enemigo.lookAt(robot.position);
        enemigo.position.x += direccion.x * 0.5 * UpdateDelta;
        enemigo.position.z += direccion.z * 0.5 * UpdateDelta;
    });

    // --COLISIONES--

    // Colisiones con los objetos
    objetos.children.forEach(objeto => {
        if (robot.position.distanceTo(objeto.position) < 0.5) {
            objetos.remove(objeto);
            puntuacion['puntuacion'] += 1;
        }
    });

    // Colisiones con los enemigos
    enemigos.children.forEach(enemigo => {
        if (robot.position.distanceTo(enemigo.position) < 0.6 && !muerto) {
            muerto = true;

            // Activa la animacion de death
            fadeToAction('deathAnimation', 0.25);
            
            // Esperar un segundo y medio y recargar la pagina
            setTimeout(() => {
                location.reload(true);
            }, 1500);
        }
    });
}

function render()
{
    requestAnimationFrame( render );
    animate();
    renderer.render( scene, camera );
}