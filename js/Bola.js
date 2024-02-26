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

//Variables globales
let camera, scene, renderer;
let bola, objetos;
let score = 0;
let time = 30;
let keys = {}

// Acciones
init();
loadScene();
render();

function init()
{
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('container').appendChild( renderer.domElement );

    // Crear la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5,0.5,0.5);

    // Crear la cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(15,15,0);

    //Luces
    var light = new THREE.DirectionalLight(0x000000, 1);
    scene.add(light);

    // Manejador de eventos para las teclas presionadas
    window.addEventListener('keydown', e => {
        keys[e.key] = true;
    });
    window.addEventListener('keyup', e => {
        keys[e.key] = false;
    });
}

function loadScene()
{

    // Suelo
    const materialSuelo = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
    const geometriaSuelo = new THREE.BoxGeometry (20,1,20);
    const suelo = new THREE.Mesh( geometriaSuelo, materialSuelo );
    scene.add(suelo);

    //Muros
    for(let i=0; i<4; i++){

    }

    // Crear la bola del jugador
    // Load texture
    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load('path/to/texture.jpg');
    const geometriaBola = new THREE.SphereGeometry(0.5, 32, 32);
    const materialBola = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    bola = new THREE.Mesh(geometriaBola, materialBola);
    scene.add(bola);

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

function update()
{
    // Actualizar la posición de la bola según las teclas presionadas
    const speed = 0.1;
    if (keys['w']) bola.position.x -= speed;
    if (keys['a']) bola.position.z += speed;
    if (keys['s']) bola.position.x += speed;
    if (keys['d']) bola.position.z -= speed;

    // Verificar colisiones entre la bola y los objetos
    objetos.children.forEach(objeto => {
        if (bola.position.distanceTo(objeto.position) < 1) {
            objetos.remove(objeto);
            score++;
        }
    });

    // Actualizar la cámara
    camera.lookAt(bola.position);
}

function render()
{
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}