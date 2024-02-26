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

// Variables de consenso
let renderer, scene, camera;

// Otras globales
let cameraControls, effectController;

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

    // Escena
    scene = new THREE.Scene();
    const backloader = new THREE.CubeTextureLoader();
    const fondo = backloader.load([
        'images/skypx.jpg', // Derecha
        'images/skynx.jpg', // Izquierda
        'images/sky.jpg', // Arriba
        'images/sky.jpg', // Abajo
        'images/skypz.jpg', // Frente
        'images/skynz.jpg'  // Atrás
    ]);
    scene.background = fondo;

    // Camara
    // Instanciar la camara
    camera= new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,1,100);
    camera.position.set(0.5,2,7);
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,1,0);
    camera.lookAt(0,1,0);

    // Eventos
    renderer.domElement.addEventListener('dblclick', animate );
}

function loadScene()
{
    //Luces
    var light = new THREE.DirectionalLight(0x000000, 1);
    scene.add(light);

    // Construcción del Tablero
    const board = new THREE.Object3D();
    //Geometria y material de las casillas
    let cubo
    const geoCubo = new THREE.BoxGeometry(1,0.1,1)
    const materialBlanco = new THREE.MeshBasicMaterial({color: 0xdce1b4 })
    const materialVerde = new THREE.MeshBasicMaterial({color: 0x3c963f })
    let materialactual
    
    for(let x=0;x<8;x++){
        if(x%2 == 0) materialactual = "negro"
        else materialactual = "blanco"
        for(let z=0;z<8;z++){
            if(materialactual == "negro"){
                cubo = new THREE.Mesh(geoCubo,materialVerde)
                materialactual = "blanco"
            }else{
                cubo = new THREE.Mesh(geoCubo,materialBlanco)
                materialactual = "negro"
            }
            cubo.position.set(x,0,z)
            board.add(cubo)
        }
    }
    
    scene.add(board)
}

function update()
{

}

function render()
{
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}