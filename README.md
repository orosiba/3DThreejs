# Proyecto Three.js en 3D

## Introducción

Three.js es una biblioteca de JavaScript de código abierto utilizada para crear y mostrar gráficos 3D en un navegador web. Esta biblioteca facilita la creación de escenas 3D interactivas mediante la utilización de WebGL, una API de gráficos 3D para navegadores web que permite renderizar gráficos 3D de alto rendimiento en tiempo real.

Este proyecto es un diseño sobre un videojuego web usando Three.js para la asignatura AGM (Aplicaciones gráficas multimedia). En las siguientes líneas se explicará brevemente el diseño y el funcionamiento.

## Diseño

### Objetos y Texturas

El terreno: está conformado por un suelo con textura de hierba, cuatro muros con textura de piedra que delimitan el mapa y árboles con textura de tronco y hojas que decoran la escena y que se generan aleatoriamente. Además, se ha usado un skybox del cielo para el fondo.

El robot: Es un modelo gltf que representa un robot y que será el personaje principal que controle el usuario.

Los enemigos: Son modelos gltf de robots voladores que debemos evitar.

Tornillos y tuercas: El objetivo es recoger los tornillos y las tuercas que se generan aleatoriamente en el mapa y que aumentarán la puntuación que se ve desde la GUI.

El sol: Es una esfera amarilla que representará el sol y de la cual surgirá la luz.

La camara: La camara se colocara en todo momento detrás del robot para que el usuario pueda controlarlo.

### Iluminación y sombras

La iluminación estará formada por una luz focal y una ambiental que trabajan juntas para crear una iluminación más realista.

La luz focal se origina desde un solo punto y se irradia en una dirección específica. En el juego, la luz focal sale desde el sol y apunta hacia el suelo. Esta luz también tiene la capacidad de proyectar sombras en la escena, lo que añade un nivel adicional de realismo. Las sombras se reflejarán sobre el suelo y los muros.

Se irradia en todas las direcciones y afecta a todos los objetos de la escena por igual, independientemente de su posición o dirección. En el juego, se usa la luz ambiental para suavizar las sombras y asegurarte de que las partes de la escena que no están directamente iluminadas por la luz focal aún sean visibles.

### Animaciones

Se utiliza un objeto THREE.Clock para rastrear el tiempo transcurrido. Esto es útil para animaciones que dependen del tiempo, como mover el robot. Utilizando el método getDelta del reloj se obtiene el tiempo transcurrido desde la última vez que se llamó a getDelta. Esto se almacena en UpdateDelta y se usa para hacer las animaciones dependientes del tiempo y no de la tasa de fotogramas.

Se utiliza la biblioteca TWEEN para crear animaciones suaves. TWEEN permite especificar los valores inicial y final de una propiedad y luego animar suavemente esa propiedad a lo largo del tiempo. Se utiliza para proporcionar balanceo y rotación a los tornillos y las tuercas y que el usuario perciba que es un objeto que se puede recojer. Se actualizan todas las animaciones de TWEEN con TWEEN.update().

Mixer se utiliza para reproducir animaciones. Un AnimationMixer puede controlar varias animaciones a la vez y permite cosas como mezclar animaciones, pausarlas, detenerlas, etc. En el código, se esta utilizando para las animaciones de quedarse quieto, andar, correr y morirse del robot y se actualiza el mixer con mixer.update(UpdateDelta).

Se mueve la cámara y el personaje en función de la posición del ratón. Esto se hace calculando la diferencia entre la posición actual del ratón y la posición anterior (deltaX y deltaY), y luego ajustando la rotación del personaje y la posición de la cámara en consecuencia. La camara siempre mira al personaje y este se puede mover hacia la dirección a la que apunta con w o en reversa con s (Si se pulsa shift se alterna entre correr y andar).

Además, si el personaje entra en contacto con un objeto lo recogerá y si entra en contacto con un enemigo morirá.

### Fisicas

Se utiliza la biblioteca Cannon.js para simular la física en el juego. Aquí hay una descripción general de cómo se implementa:

En Cannon.js, un World es el contenedor principal de todos los objetos físicos y controla cómo interactúan entre sí. En el juego, se crea un nuevo World y se configura la gravedad para que los objetos caigan hacia abajo.

Se creán cuerpos rígidos que se adaptan a el robot, los troncos, los muros y el suelo para que estos colisonen. Para el movimiento del robot, se actualiza la posicion del robot para que siga su cuerpo rigido.

El mundo de Cannon.js de actualiza en cada fotograma con world.step(1/60). Esto avanza la simulación física en 1/60 de segundo, lo que significa que se apunta a una tasa de actualización de 60Hz.

## Funcionalidad

Con el ratón se puede mover la cámara horizontalmente.

Con las teclas w y s se mueve el personaje principal hacia delante y hacia atrás.

Pulsar shift alterna entre correr y andar.

## Referencias

* grass: https://opengameart.org/content/grass-1
* skybox: https://opengameart.org/content/sky-box-sunny-day
* walls: https://opengameart.org/content/wall-of-large-bricks
* wood: https://opengameart.org/content/seamless-tiling-tree-bark-texture
* leaves: https://opengameart.org/content/bush-with-small-round-leaves-seamless-texture-with-normalmap-0
* Robot model: https://poly.pizza/m/QCm7qe9uNJ
* Enemy model: https://poly.pizza/m/lF3jeRJwiH
