# Proyecto Three.js en 3D

##  Introducción

Three.js es una biblioteca de JavaScript de código abierto utilizada para crear y mostrar gráficos 3D en un navegador web. Esta biblioteca facilita la creación de escenas 3D interactivas mediante la utilización de WebGL, una API de gráficos 3D para navegadores web que permite renderizar gráficos 3D de alto rendimiento en tiempo real.

Este proyecto es un diseño sobre un videojuego web usando Three.js para la asignatura AGM (Aplicaciones gráficas multimedia). En las siguientes lineas se explicará brevemente el diseño y el funcionamiento.

## Diseño

### Generación del terreno

El terreno esta conformado por un suelo con textura de hierba y cuatro muros que delimitan el mapa y los diferentes elementos que lo conforman.

### Objetos (Tornillos y tuercas)

El objetivo es recoger los tornillos y las tuercas que se generan aleatoriamente en el mapa y que están animados mediante Tween (Balanceo y rotación).

### Modelos

Para la realización del proyecto se ha usado un modelo de un robot con sus animaciones (correr, andar, quedarse parado, morir) y un modelo para los enemigos. Además, si un enemigo te alcanza morirás y se reiniciará el juego.

### Fondo e iluminación

El fondo se ha diseñado mediante un skybox y se ha añadido un sol. La iluminación estara formada por una luz focal que sale desde el sol y apunta hacia el mapa y por una ambiental para darle realismo.

## Funcionamiento

Con el ratón se puede mover la camara horizontalmente

Con las teclas w y s se mueve el personaje principal hacia delante 

Pulsar shift alterna entre correr y andar

## Referencias

grass https://opengameart.org/content/grass-1
skybox https://opengameart.org/content/sky-box-sunny-day

Robot model https://poly.pizza/m/QCm7qe9uNJ
Enemy model https://poly.pizza/m/lF3jeRJwiH