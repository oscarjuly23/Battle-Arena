//Token
const group_token = 'b89f8f96';

/*  API: Eliminar el jugador indicado */
async function remove(token, code) {
    //Espera la respuesta de la API
    const response = await fetch('http://battlearena.danielamo.info/api/remove/' + group_token + '/' + token + '/' + code);
    //Si la respuesta no ha sido correcta lanza un error
    if (!response.ok) {
        let error = `An error has occured: ${response.status}`;
        throw new Error(error);
    }
    //Muestra el código de retorno de la api
    showLog('Remove player status: ' + response.status);
}

/*  API: Genera un nuevo jugador */
async function spawn(name) {
    //Espera la respuesta de la API
    const response = await fetch('http://battlearena.danielamo.info/api/spawn/' + group_token + '/' + name);
    //Si la respuesta no ha sido correcta lanza un error
    if (!response.ok) {
        let error = `An error has occured: ${response.status}`;
        throw new Error(error);
    }
    //Convierte la respuesta de la API en un JSON
    const data = await response.json();
    //Devolvemos los datos
    return data;
}

/*  API: Regenera el jugador indicado */
async function respawn(token) {
    //Espera la respuesta de la API
    const response = await fetch('http://battlearena.danielamo.info/api/respawn/' + group_token + '/' + token);
    //Si la respuesta no ha sido correcta lanza un error
    if (!response.ok) {
        let error = `An error has occured: ${response.status}`;
        throw new Error(error);
    }
    //Muestra el código de retorno de la api
    showLog('Respawn player status: ' + response.status)
}

/*  API: Devuelve los jugadores y objetos en las celdas colindantes al jugador */
async function getPlayersObjects(token) {
    //Espera la respuesta de la API
    const response = await fetch('http://battlearena.danielamo.info/api/playersobjects/' + group_token + '/' + token);
    //Si la respuesta no ha sido correcta lanza un error
    if (!response.ok) {
        let error = `An error has occured: ${response.status}`;
        throw new Error(error);
    }
    //Convierte la respuesta de la API en un JSON
    const data = await response.json();
    //Devolvemos los datos
    return data;
}

/*  API: Devuelve la posición de los enemigos y los dibuja en el mapa */
function getMap(token) {
    //Se realiza la solicitud a la API y se trata la promesa
    fetch('http://battlearena.danielamo.info/api/map/' + group_token + '/' + token)
        //Si se resuelve convierte la respuesta en json y se devuelve
        .then(function (response) {
            return response.json();
        })
        .then(function (mapa) {
            //Se muestra el canvas donde se printará el mapa
            $('#map').css("display", "block");
            //Se establece el tamaño del canvas
            $('#canvas')[0].width = 300;
            $('#canvas')[0].height = 300;
            //Establecemos que tendrá 40x40 celdas
            var vertical = 40, horizontal = 40;
            var posicion = { x: 0, y: 0 };
            var gw = $('#canvas')[0].width / horizontal;
            var gh = $('#canvas')[0].height / vertical;
            var context;
            context = $('#canvas')[0].getContext('2d');
            posicion.x = player.x;
            posicion.y = player.y;
            //Se pinta el fondo del canvas
            fillBackground(context);
            //Recorremos los enemigos y se pintaran el la posición x,y del canvas
            for (let i = 0; i < mapa.enemies.length; i++) {
                drawSquare(context, mapa.enemies[i].x, (vertical - 1) - mapa.enemies[i].y, "#ff0000", gw, gh);
            }
            //Recorremos los objetos y se pintaran el la posición x,y del canvas
            for (let i = 0; i < mapa.objects.length; i++) {
                drawSquare(context, mapa.objects[i].x, (vertical - 1) - mapa.objects[i].y, "#1DCF1D", gw, gh);
            }
            //Pintamos la posición del jugador
            drawSquare(context, posicion.x, (vertical - 1) - posicion.y, "#0067FC", gw, gh);
            //Pintamos las linas para separar los elementos en celdas
            drawTable(context, gw, gh, $('#canvas')[0]);
            //En caso de error al pedir el map a la API 
        }).catch(function (err) {
            showLog(err);
        });
}

/*  API: Devuelve la información del jugador indicado */
async function getPlayer(token) {
    //Espera la respuesta de la API
    const response = await fetch('http://battlearena.danielamo.info/api/player/' + group_token + '/' + token);
    //Si la respuesta no ha sido correcta lanza un error
    if (!response.ok) {
        let error = `An error has occured: ${response.status}`;
        throw new Error(error);
    }
    //Convierte la respuesta de la API en un JSON
    const data = await response.json();
    //Devolvemos los datos
    return data;
}

/*  API: Mueve el jugador indicado hacia la dirección indicada */
async function movePlayer(token, direction) {
    //Espera la respuesta de la API
    const response = await fetch('http://battlearena.danielamo.info/api/move/' + group_token + '/' + token + '/' + direction);
    //Si el codigo de retorno esta entre 500 y 600 lanzamos un error para poder controlarlo
    if (response.status >= 500 && response.status < 600) {
        let error = `Pared encontrada: ${response.status}`;
        throw new Error(error);
    }
    //Muestra el código de retorno de la api
    showLog('Move player status: ' + response.status);
}

/*  API: Ataca a un enemigo en la dirección indicada */
async function attackEnemy(token, direction) {
    //Espera la respuesta de la API
    const response = await fetch('http://battlearena.danielamo.info/api/attack/' + group_token + '/' + token + '/' + direction);
    //Si el codigo de retorno esta entre 500 y 600 lanzamos un error para poder controlarlo
    if (response.status >= 500 && response.status < 600) {
        let error = `Error al atacar: ${response.status}`;
        throw new Error(error);
    }
    showLog('Attack player status: ' + response.status);
    //Convierte la respuesta de la API en un JSON
    const data = await response.json();
    //Devolvemos los datos
    return data;
}

/*  API: Crea un objeto */
function craftObject(token, object) {
    //Devuelve una promesa
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        //Se pasan los parámetros del objeto por body
        var params = 'name=' + object.name + '&image=' + object.image + '&attack=' + object.attack + '&defense=' + object.defense;
        //Se realiza el POST
        xhr.open("POST", "http://battlearena.danielamo.info/api/craft/" + group_token + "/" + token, false);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send(params);
        showLog('Craft Object status: ' + xhr.status);
        //Si el POST se ha realiza correctamente se resuelve la promesa
        if (xhr.status === 200) {
            resolve();
            //En caso incorrecto se hace un reject
        } else {
            reject("Error " + xhr.status + " to craft object");
        }
    })
}

/*  API: Recoge un objeto */
async function pickupObject(token, object) {
    //Espera la respuesta de la API
    const response = await fetch('http://battlearena.danielamo.info/api/pickup/' + group_token + '/' + token + '/' + object);
    //Si la respuesta no ha sido correcta lanza un error
    if (!response.ok) {
        let error = `An error has occured: ${response.status}`;
        throw new Error(error);
    }
    //Muestra el código de retorno de la api
    showLog('Pickup object ' + response.status)
}