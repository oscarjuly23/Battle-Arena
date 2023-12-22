let gameStart = false;
let player;
//Declaramos id de los Interval para el refresh
let idInterval;
let idIsAlive;

/* Usando JQuery comprobamos si estas imagenes, si lo estan cambiamos el display a 'none'  */
$("#player-img").on("error", function (event) {
  $(event.target).css("display", "none");
});
$("#object-img").on("error", function (event) {
  $(event.target).css("display", "none");
});

/* En el Onload de la página mostramos un mensaje en nuestra consola */
window.onload = function () {
  $(".mo-fire").css("display", "none");
  showLog('Bienvenido! Pulsa "Nueva Partida" o "Cargar Partida" para empezar.');
}

/* Función para crear nueva partida */
function nuevaPartida() {
  let token;
  let code;
  //Cuando tenemos el click  de comfirmar crear partida
  $('#new-btn-dialog').one('click', () => {
    //Nos guardamos el nombre i spawneamos el jugador
    var name = $('#name-field').val();
    //Llamada a la función de API de spawn
    spawn(name)
      .then(data => {
        //Indicamos mediante un boleano que empezamos partida y hacemos el SetPlayer
        gameStart = true;
        token = data.token;
        code = data.code;
        setPlayer(token, code);
      })
      .catch(error => showLog(error.message));
  })
}

/* Función para eliminar jugador */
function eliminarJugador() {
  //Llamada a la función de API de remove
  remove(player.token, player.code)
    .then(() => {
      //Mostramos alerta y mensajes de jugador eliminado por consola
      alerts.message = 'Jugador eliminado: ' + player.name;
      showLog('Jugador eliminado: ' + player.name);
      showLog('Juego finalizado! Inicia o carga una nueva partida.');
      //Llamamos función endGame
      endGame();
      //Indicamos duración de la alerta de dos segundos
      $('#alerts')[0].showModal();
      setTimeout(function () { $('#alerts')[0].close() }, 2000);
    })
    .catch(error => showLog(error.message));
}

/* Función para respawnear jugador */
function respawnJugador() {
  //Llamada a la función de API de respawn
  respawn(player.token).then(() => {
    //Llamada a la función de API que obtiene datos del jugador
    getPlayer(player.token).then(playerData => {
      //Hacemos el clearInterval para obtener un correcto orden de ejecución
      clearInterval(idInterval);
      clearInterval(idIsAlive);
      //Guardamos nuevos datos del jugador en nuestro objeto
      player.x = playerData.x;
      player.y = playerData.y;
      player.image = playerData.image;
      player.vp = playerData.vitalpoints;
      player.maxVp = playerData.vitalpoints;
      showLog('Jugador ' + player.name + ' respawned');
    }).then(() => {
      //Una vez tengamos los datos del jugador, ya podemos iniciar partida
      initGame();
    })
      .catch(error => showLog(error.message));
  })
    .catch(error => showLog(error.message));
}

/* Función para coger datos de jugador */
function setPlayer(token, code) {
  //Llamada a la función de API que obtiene datos del jugador
  getPlayer(token).then(playerData => {
    player = new Player(playerData);
    player.token = token;
    player.code = code;
    showLog('Partida iniciada. Jugador: ' + player.name);
  }).then(() => {
    $(document).off('keydown');
    //Una vez tengamos los datos del jugador, ya podemos iniciar partida
    initGame();
  })
    .catch(error => showLog(error.message));
}

/* Función para iniciar la partida */
function initGame() {
  $(document).off('keydown');
  $(".mo-fire").css("display", "none");
  $("#player-img").css("display", "block");
  $('.brujula').css("display", "block");
  //Llenamos todos los contenedores de corazones
  stats.hp.forEach(element => {
    element.style = 'nes-icon is-large heart';
  });
  //Cambiamos la vista del Visor y pasamos los datos del jugador a los displays de la pantalla
  game.imagen = '../src/imgs/vista.jpg';
  info.image = '../src/imgs/battlearena-avatars/my_character-' + player.image + '.png';
  info.name = player.name;
  info.x = player.x;
  info.y = player.y;
  info.direction = player.direction;
  stats.attack = player.attack;
  stats.defense = player.defense;
  objects.name = player.object.name;
  objects.attack = player.object.attack;
  objects.defense = player.object.defense;
  objects.image = player.object.image;
  //Tenemos que activar el display que por defecte está desactuvado
  if (objects.image != null) {
    $("#object-img").css("display", "block");
  }
  //Ponemos la brújula según la direccion en la que iniciamos
  rotarBrujula();
  //Obtenemos datos del mapa
  getMap(player.token);
  //Llamamos la función de movimiento del jugador
  movementsPlayer();
  // Llamamos las siguientes funciones con un intervalo de 1,5s
  idInterval = setInterval(refreshGame, 1500);
  setInterval(resetFlama, 1500);
  idIsAlive = setInterval(checkIsAlive, 1500);
}

/* Función para terminar la partida */
function endGame() {
  //Hacemos el clearInterval para obtener un correcto orden de ejecución

  clearInterval(idInterval);
  clearInterval(idIsAlive);
  //Escondemos todas las imagenes
  $('#map').css("display", "none");
  $(".mo-fire").css("display", "none");
  $('.brujula').css("display", "none");
  $('#enemigo').css("display", "none");
  //Indicamos que se ha terminado la partida en el boolean y cambiamos la imagen del Visor
  gameStart = false;
  game.imagen = '../src/imgs/black.jpg';
  //Reseteamos todos los valores de los displays de player
  info.image = '';
  info.name = '';
  info.x = '';
  info.y = '';
  info.direction = '';
  stats.attack = 0;
  stats.defense = 0;
  objects.name = '';
  objects.attack = '';
  objects.defense = '';
  objects.image = '';
  //Ponemos todos los contenedores de corazones vacíos
  stats.hp.forEach(element => {
    element.style = 'nes-icon is-large is-transparent heart';
  })
  //Ponemos a null nuestro jugador
  player = null;
  $(document).off('keydown');
}

/* Función para guardar la partida */
function saveGame() {
  //Mostramos mensajes de que se ha guardado la partida
  alerts.message = 'Partida guardada';
  showLog('Partida guardada');
  $('#alerts')[0].showModal();
  setTimeout(function () { $('#alerts')[0].close() }, 2000);
  //Hacemos el Local Storage para guardar nuestro jugador en el storage del nagegador
  localStorage.setItem('player', JSON.stringify(player));
  localStorage.setItem('saved', gameStart);
}

/* Función para cargar la partida */
function loadGame() {
  //Mostramos mensajes de que se ha cargado la partida
  alerts.message = 'Partida cargada';
  showLog('Partida cargada');
  $('#alerts')[0].showModal();
  setTimeout(function () { $('#alerts')[0].close() }, 2000);
  //Limpiamos todos los datos para evitar conflictos
  if (gameStart) {
    endGame();
  }
  // Cargamos los datos guardados en el LocalStorage del nagegador
  let jugador, token, code, obj;
  obj = localStorage.getItem('player');
  jugador = JSON.parse(obj);
  code = jugador._code;
  token = jugador._token;
  gameStart = localStorage.getItem('saved');
  //Seteamos los datos obtenidos en nuestro jugador
  setPlayer(token, code);
}

/* Función para mover jugador */
function movementsPlayer() {
  //Leemos el código ASCII de las teclas que tienen funcionalidades en nuestro juego
  const mv = {
    UP: '38', LEFT: '37', DOWN: '40', RIGHT: '39', PICKUP: '80', JUMP: '32', ATTACK: '65'
  }
  $(document).keydown(function (e) {
    //Segun el las flechas del teclado nos movemos en la direccion especificada llamando la función move de player
    if (e.keyCode == mv.LEFT) {
      if (player.direction == 'O') {
        player.move('S');
      } else if (player.direction == 'S') {
        player.move('E');
      } else if (player.direction == 'E') {
        player.move('N');
      } else {
        player.move('O');
      }
    } else if (e.keyCode == mv.UP) {
      if (player.direction == 'O') {
        player.move('O');
      } else if (player.direction == 'S') {
        player.move('S');
      } else if (player.direction == 'E') {
        player.move('E');
      } else {
        player.move('N');
      }
    } else if (e.keyCode == mv.RIGHT) {
      if (player.direction == 'O') {
        player.move('N');
      } else if (player.direction == 'S') {
        player.move('O');
      } else if (player.direction == 'E') {
        player.move('S');
      } else {
        player.move('E');
      }
    } else if (e.keyCode == mv.DOWN) {
      if (player.direction == 'O') {
        player.move('E');
      } else if (player.direction == 'S') {
        player.move('N');
      } else if (player.direction == 'E') {
        player.move('O');
      } else {
        player.move('S');
      }
      //Para recoger el objeto llamamos la función pickup de player
    } else if (e.keyCode == mv.PICKUP) {
      player.pickup();
      //Hemos configurado que con el espacio saltemos dos posiciones en la dirección que estemos mirando
      //Esto lo haremos llamando dos veces la función move de player
    } else if (e.keyCode == mv.JUMP) {
      if (player.direction == 'O') {
        player.move('O');
        player.move('O');
      } else if (player.direction == 'S') {
        player.move('S');
        player.move('S');
      } else if (player.direction == 'E') {
        player.move('E');
        player.move('E');
      } else {
        player.move('N');
        player.move('N');
      }
      //Para atacar a un enemigo llamamos la función attackPlayer de player
    } else if (e.keyCode == mv.ATTACK) {
      $(".mo-fire").css("display", "block");
      player.attackPlayer();
    }
  })
}

/* Función de refresco del mapa */
function refreshGame() {
  //Llamamos la función que nos retorna los datos del mapa
  getMap(player.token);
  //Llamamos la función que mira si tenemos enemigos cerca
  checkEnemy();
}

/* funcion que comprueba si hay enemigo */
function checkEnemy() {
  //Solo nos guardamos el enemigo cuando el jugador y el enemigo se estan mirando de frente
  let enemy = null;
    //Funcion que llamamos a la API para devolver jugador y objetos
  getPlayersObjects(player.token).then(data => {
    for (let i = 0; i < data.enemies.length; i++) {
      //Si el enemigo esta vivo
      if (data.enemies[i].vitalpoints > 0) {
        //Si el jugador mira hacia el norte y el enemigo hacia el sur -  Estan de frente
        if (player.direction == 'N' && data.enemies[i].direction == 'S' && player.y < data.enemies[i].y && player.x == data.enemies[i].x) {
          enemy = data.enemies[i];
          break;
        //Si el jugador mira hacia el sur y el enemigo hacia el norte - Estan de frente
        } else if (player.direction == 'S' && data.enemies[i].direction == 'N' && player.y > data.enemies[i].y && player.x == data.enemies[i].x) {
          enemy = data.enemies[i];
          break;
        //Si el jugador mira hacia el este y el enemigo hacia el oeste - Estan de frente
        } else if (player.direction == 'E' && data.enemies[i].direction == 'O' && player.x < data.enemies[i].x && player.y == data.enemies[i].y) {
          enemy = data.enemies[i];
          break;
        //Si el jugador mira hacia el oeste y el enemigo hacia el este - Estan de frente
        } else if (player.direction == 'O' && data.enemies[i].direction == 'E' && player.x > data.enemies[i].x && player.y == data.enemies[i].y) {
          enemy = data.enemies[i];
          break;
        }
      }
    }
    //Si hay enemigo en frente
    if (enemy != null) {
      //Activamos la imagen del enemigo
      $('#enemigo').css("display", "block");
      //Mostramos la imagen del enemigo y mostramos un log en el Visor indicando la vida del enemigo
      game.enemy = '../src/imgs/battlearena-avatars/my_character-' + enemy.image + '.png';
      showLog("Enemigo encontrado: " + enemy.vitalpoints + " hp");
      //Si no hay enemigo en frente inicializamos el enemigo y desactivamos la imagen del enemigo
    } else {
      $('#enemigo').css("display", "none");
      game.enemy = '';
    }
  }).catch(error => showLog(error.message));
}

/* funcion que comprueba si el jugador esta vivo */
function checkIsAlive() {
  //Funcion que llamamos a la API para devolver la info del jugador
  getPlayer(player.token).then(playerData => {
    player.vp = playerData.vitalpoints;
  })
    .catch(error => showLog(error.message));

  //Si el jugador no tiene vida  
  if (player.vp <= 0) {
    //Reseteamos todos los campos
    objects.name = '';
    objects.image = '';
    objects.attack = '';
    objects.defense = '';
    $('#alerts')[0].close();
    //Mostramos de que el juego ha acabado y el jugador ha sido eliminado
    alerts.message = 'GAME OVER';
    showLog('Has sido eliminado');
    //Mostramos una alerta con un dialago de 2segundos informando al usuario
    $('#alerts')[0].showModal();
    setTimeout(function () { $('#alerts')[0].close() }, 2000);
    //Recorremos el objeto de stats en Vue y por cada corazon añadimos un stilo, que es el corazon sin color rojo. Indicando que no tiene vida
    stats.hp.forEach(element => {
      element.style = 'nes-icon is-large is-transparent heart';
    });
    //Hacemos el clearInterval de isIsAlive para obtener un correcto orden de ejecución
    clearInterval(idIsAlive);
    //Si el jugador aun esta vivo
  } else {
    let hearts = 5;
    //El valor que vale cada corazon.
    let heart = Math.round(player.maxVp / hearts);
    //La vida que le sacan al jugador
    let diff = player.maxVp - player.vp;
     
    //Si le sacan vida y no pasa de la mitad del valor de heart pintamos el primer corazon a la mitad. (Indicando que le quedan 4,5 vidas)
    if (diff >= (heart * 0.5) && diff < heart) {
      stats.hp[hearts - 1].style = 'nes-icon is-large is-half heart';
    }
    //Si le sacan vida y pasa de la mitad del valor de heart pintamos el primer corazon sin color rojo. (Indicando que le quedan 4 vidas)
    if (diff >= heart) {
      stats.hp[hearts - 1].style = 'nes-icon is-large is-transparent heart';
    }
    //Si le sacan vida y pasa del valor de heart pero menos del doble de heart, pintamos el primer corazon sin color rojo y la mitad del segundo (Indicando que le quedan 3,5 vidas)
    if (diff > heart && diff < heart * 2) {
      stats.hp[hearts - 1].style = 'nes-icon is-large is-transparent heart';
      stats.hp[hearts - 2].style = 'nes-icon is-large is-half heart';
    }
    //Si le sacan vida y pasa del doble del valor de heart pintamos el segundo corazon sin color rojo (Indicando que le quedan 3 vidas)
    if (diff >= heart * 2) {
      stats.hp[hearts - 2].style = 'nes-icon is-large is-transparent heart';
    }
    //Si le sacan vida y pasa más del doble del valor de heart pero menor que el triple de heart, pintamos el tercer corazon y el segundo a la mitad (Indicando que le quedan 2,5 vidas)
    if (diff > heart * 2 && diff < heart * 3) {
      stats.hp[hearts - 2].style = 'nes-icon is-large is-transparent heart';
      stats.hp[hearts - 3].style = 'nes-icon is-large is-half heart';
    }
    //Si le sacan vida y pasa del triple del valor de heart pintamos el tercer corazon sin color rojo (Indicando que le quedan 2 vidas)
    if (diff >= heart * 3) {
      stats.hp[hearts - 3].style = 'nes-icon is-large is-transparent heart';
    }
    //Si le sacan vida y pasa más del triple del valor de heart pero menor que el cuadruple de heart, pintamos el tercer corazon y el cuarto a la mitad (Indicando que le quedan 1,5 vidas)
    if (diff > heart * 3 && diff < heart * 4) {
      stats.hp[hearts - 3].style = 'nes-icon is-large is-transparent heart';
      stats.hp[hearts - 4].style = 'nes-icon is-large is-half heart';
    }
    //Si le sacan vida y pasa del cuadruple del valor de heart pintamos el cuarto corazon sin color rojo (Indicando que le quedan 1 vidas)
    if (diff >= heart * 4) {
      stats.hp[hearts - 4].style = 'nes-icon is-large is-transparent heart';
    }
    //Si le sacan vida y pasa más del cuadruple del valor de heart pero menor que el quintuple de heart, pintamos el cuarto corazon y el quinto a la mitad (Indicando que le quedan 0,5 vidas)
    if (diff > heart * 4 && diff < heart * 5) {
      stats.hp[hearts - 4].style = 'nes-icon is-large is-transparent heart';
      stats.hp[hearts - 5].style = 'nes-icon is-large is-half heart';
    }
    //Si le sacan vida y pasa del quintuple del valor de heart pintamos el cuarto corazon sin color rojo (Indicando que le quedan 0 vidas)
    if (diff >= heart * 5) {
      stats.hp[hearts - 5].style = 'nes-icon is-large is-transparent heart';
    }
  }
}

/* funcion que rota la brujula hacia donde el jugador esta mirando */
function rotarBrujula() {
  $('#brujula-img').css('transform', 'rotate(' + 0 + 'deg)');
  if (gameStart) {
    //Dependiendo de donde este mirando el jugador se aplica un rotate a la brujula
    switch (player.direction) {
      case 'N':
        break;
      case 'O':
        $('#brujula-img').css('transform', 'rotate(' + 90 + 'deg)');
        break;
      case 'E':
        $('#brujula-img').css('transform', 'rotate(' + -90 + 'deg)');
        break;
      case 'S':
        $('#brujula-img').css('transform', 'rotate(' + 180 + 'deg)');
        break;
      default:
        break;
    }
  }
}

/* funcion que pinta dentro de cada celda del minimapa */
function drawSquare(context, x, y, color, gw, gh) {
  context.fillStyle = color;
  var rx = x * gw;
  var ry = y * gh;
  //fillRect pinta la casilla
  context.fillRect(rx, ry, gw, gh);
}

/* funcion que pinta el minimapa como una cuadricula, printa filas y columnas */
function drawTable(context, gw, gh, canvas) {
  //Pintamos las lineas de color flanco con un ancho de 0.2
  context.strokeStyle = "white";
  context.lineWidth = 0.2;

  //Pintamos las lineas verticales
  for (i = gw; i < canvas.width; i += gw) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i, canvas.height);
    context.stroke();
  }

  //Pintamos las lineas horizontales
  for (i = gh; i < canvas.height; i += gh) {
    context.beginPath();
    context.moveTo(0, i);
    context.lineTo(canvas.width, i);
    context.stroke();
  }
}

/* funcion que pone de negro el fondo del minimapa */
function fillBackground(context) {
  context.fillStyle = '#000';
  context.fillRect(0, 0, 300, 300);
}

/* funcion que introduce css para que desaparezca la flama */
function resetFlama() {
  $(".mo-fire").css("display", "none");
}

/* funcion que muestra los logs en el VISOR */
function showLog(msg) {
  //Creamos las variables para coger el dia y la hora justo cuando se crea un log
  var today = new Date();
  var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = '[' + date + ' ' + time + '] ';
  //Seleccionamos la respuesta, el contenido dentro del visor mediante JQUERY y hacemos un append por cada mensaje
  $('#respuesta').append('<p class="respuesta">' + dateTime + msg + '</p>');
  //Para que cuando haya scroll no tire hacia arriba al haber un nuevo mensaje
  $(".terminal").scrollTop($(".terminal")[0].scrollHeight);
}