/* Componente VUE que contiene los elementos del menú del juego */
var menu = new Vue({
  //ID del div al que hace referencia
  el: '#menu',
  //Datos que tiene el objeto, en este caso un array con los atributos que pasaremos a los botones del menú
  data: {
    options: [
      { id: 'new', text: 'Nueva partida', style: 'nes-btn is-success' },
      { id: 'respawn', text: 'Revivir jugador', style: 'nes-btn is-warning' },
      { id: 'remove', text: 'Eliminar jugador', style: 'nes-btn is-error' },
      { id: 'save', text: 'Guardar partida', style: 'nes-btn' },
      { id: 'load', text: 'Cargar partida', style: 'nes-btn' }
    ]
  },
  //Métodos que implementa
  methods: {
    //Función que recibe el id del button que se ha clicado y realiza la acción pertinente
    say: function (id) {
      switch (id) {
        //Nueva partida
        case this.options[0].id:
          //Si el juego no esta empezado se muestra el dialog y se crea una nueva partida
          if (!gameStart) {
            $('#dialog-dark')[0].showModal();
            //Nueva partida
            nuevaPartida();
            //Si el juego esta empezado se muesta un alerta al jugador
          } else {
            alerts.message = 'Ya hay una partida en curso';
            $('#alerts')[0].showModal();
            setTimeout(function () { $('#alerts')[0].close() }, 2000);
          }
          break;
        //Revivir jugador
        case this.options[1].id:
          //Si el juego esta empezado se puede revivir al jugador
          if (gameStart) {
            //Revivir jugador
            respawnJugador();
            //Si el juego no esta empezado se muesta un alerta al jugador
          } else {
            alerts.message = 'No hay jugador creados para respawnear';
            $('#alerts')[0].showModal();
            setTimeout(function () { $('#alerts')[0].close() }, 2000);
          }
          break;
        //Eliminar jugador
        case this.options[2].id:
          //Si el juego esta empezado se puede eliminar el jugador
          if (gameStart) {
            //Se limpia el localStorage en caso de que hayan datos guardados
            localStorage.clear();
            //Se da un tiempo antes de limpiar los intervalos para que acabe la función
            setInterval(() => {
              clearInterval(idInterval);
              clearInterval(idIsAlive);
            }, 500);
            //Se elimina al jugador
            eliminarJugador();
            //Si el juego no esta empezado se muesta un alerta al jugador
          } else {
            alerts.message = 'No hay jugador a eliminar';
            $('#alerts')[0].showModal();
            setTimeout(function () { $('#alerts')[0].close() }, 2000);
          }
          break;
        //Guardar partida
        case this.options[3].id:
          //Si el juego esta empezado se puede guardar partida
          if (gameStart) {
            //Guardar partida
            saveGame();
          } else {
            //Si el juego no esta empezado se muesta un alerta al jugador
            alerts.message = 'No se puede guardar, no hay partida empezada';
            $('#alerts')[0].showModal();
            setTimeout(function () { $('#alerts')[0].close() }, 2000);
          }
          break;
        //Cargar partida
        case this.options[4].id:
          //Si hay datos guardados se puede cargar la partida
          if (localStorage.getItem('player') != null) {
            //Se da un tiempo antes de limpiar los intervalos para que acabe la función
            setInterval(() => {
              clearInterval(idInterval);
              clearInterval(idIsAlive);
            }, 500);
            //Carga la partida
            loadGame();
            //En caso de que no haya datos guardado se muestra una alerta al jugador
          } else {
            alerts.message = 'No hay datos para cargar';
            $('#alerts')[0].showModal();
            setTimeout(function () { $('#alerts')[0].close() }, 2000);
          }
          break;
      }
    }
  }
})

/* Componente VUE que contiene los elementos que se mostrán en el juego */
var game = new Vue({
  //ID del div al que hace referencia
  el: '#game',
  //Datos que tiene el componente, en este caso imagen de fondo y enemigo que aparece
  data: {
    imagen: '../src/imgs/black.jpg',
    enemy: ''
  }
})

/* Componente VUE que contiene los elementos que se mostrán en el div de información del jugador */
var info = new Vue({
  //ID del div al que hace referencia
  el: '#player-info',
  //Datos que tiene el componente, en este caso los atributos principales de un jugador
  data: {
    image: '',
    name: '',
    x: '',
    y: '',
    direction: ''
  }
})

/* Componente VUE que contiene los elementos que se mostrán en el div de estadisticas del jugador */
var stats = new Vue({
  //ID del div al que hace referencia
  el: '#stats',
  //Datos que tiene el componente, en este caso array con cada uno de los 5 corazones de la vida, el ataque y la defensa el jugador
  data: {
    hp: [
      { id: 'h1', style: 'nes-icon is-large heart is-transparent' },
      { id: 'h2', style: 'nes-icon is-large heart is-transparent' },
      { id: 'h3', style: 'nes-icon is-large heart is-transparent' },
      { id: 'h4', style: 'nes-icon is-large heart is-transparent' },
      { id: 'h5', style: 'nes-icon is-large heart is-transparent' }
    ],
    attack: 0,
    defense: 0
  }
})

/* Componente VUE que contiene los elementos que se mostrán en el div de información del objeto */
var objects = new Vue({
  //ID del div al que hace referencia
  el: '#object',
  //Datos que tiene el componente, en este caso array con cada uno de los objetos posibles que puede craftear el jugador, nombre, imagen, ataque y defensa del objeto equipado
  data: {
    name: '',
    image: '',
    attack: 0,
    defense: 0,
    items: [
      { id: '0', name: 'Flor de fuego', image: 'https://3.bp.blogspot.com/-THyAWaXwN8o/VJ9svc-XRII/AAAAAAAADVQ/KN8SeG6uhDE/s1600/200px-FireFlowerMK8.png', attack: 4, defense: 0 },
      { id: '1', name: 'Estrella', image: 'https://www.mariowiki.com/images/thumb/f/f5/StarMK8.png/629px-StarMK8.png', attack: 3, defense: 4 },
      { id: '2', name: 'Sunshine', image: 'https://supermario3dallstars.nintendo.com/assets/img/super-mario-sunshine/star.png', attack: 1, defense: 4 },
      { id: '3', name: 'Bob-omb', image: 'https://www.mariowiki.com/images/thumb/1/16/Bob-ombMK8.png/620px-Bob-ombMK8.png', attack: 2, defense: 2 },
      { id: '4', name: 'Cham. Dorado', image: 'https://2.bp.blogspot.com/-xrDWzE01rwQ/UDUK5zssONI/AAAAAAAAAZ0/26l6Cxi8DI8/s1600/new-super-mario-bros-2-artwork-1.png', attack: 5, defense: 5 },
      { id: '5', name: 'Flor Dorada', image: 'https://www.jing.fm/clipimg/full/15-150579_mario-clipart-gold-coin-fan-made-mario-items.png', attack: 5, defense: 2 },
    ]
  },
  //Métodos que implementa
  methods: {
    //Función que muestra el dialog para selecionar el objeto cuando el button de craftear ha sido clicado
    say: function () {
      //Si ha empezado una partida se puede craftear
      if (gameStart) {
        $('#dialog-object')[0].showModal();
        //Si no hay partida empezado se muestra una alerta al jugador
      } else {
        alerts.message = 'No puedes craftear, no ha empezado ninguna partida';
        $('#alerts')[0].showModal();
        setTimeout(function () { $('#alerts')[0].close() }, 2000);
      }
    },
    //Una vez selecionado el objeto se llama a la función craft del jugador
    getObject: function () {
      player.craft();
    }
  }
})

/* Objeto VUE que contiene los elementos que se mostrán en el div de información del jugador */
var alerts = new Vue({
  //ID del div al que hace referencia
  el: '#alerts',
  //Mensaje de alerta que se mostrará
  data: {
    message: ''
  }
})