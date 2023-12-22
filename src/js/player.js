class Player {
    /* Constructor */
    constructor(data) {
        this._token = null;
        this._code = null;
        this._name = data.name;
        this._x = data.x;
        this._y = data.y;
        this._direction = data.direction;
        this._attack = data.attack;
        this._defense = data.defense;
        this._vp = data.vitalpoints;
        this._image = data.image;
        this._object = data.object;
        this._maxVp = data.vitalpoints;
    }

    /* Get and set Token*/
    get token() {
        return this._token;
    }

    set token(token) {
        this._token = token;
    }

    /* Get and set Code*/
    get code() {
        return this._code;
    }

    set code(code) {
        this._code = code;
    }

    /* Get and set Name*/
    get name() {
        return this._name;
    }

    set name(name) {
        this._name = name;
    }

    /* Get and set X*/
    get x() {
        return this._x;
    }

    set x(x) {
        this._x = x;
    }

    /* Get and set Y*/
    get y() {
        return this._y;
    }

    set y(y) {
        this._y = y;
    }

    /* Get and set Direction*/
    get direction() {
        return this._direction;
    }

    set direction(direction) {
        this._direction = direction;
    }

    /* Get and set Attack*/
    get attack() {
        return this._attack;
    }

    set attack(attack) {
        this._attack = attack;
    }

    /* Get and set Defense*/
    get defense() {
        return this._defense;
    }

    set defense(defense) {
        this._defense = defense;
    }

    /* Get and set VitalPoints*/
    get vp() {
        return this._vp;
    }

    set vp(vp) {
        this._vp = vp;
    }

    /* Get and set Image*/
    get image() {
        return this._image;
    }

    set image(image) {
        this._image = image;
    }

    /* Get and set Object*/
    get object() {
        return this._object;
    }

    set object(object) {
        this._object = object;
    }

    /* Get and set maxVp*/
    get maxVp() {
        return this._maxVp;
    }

    set maxVp(maxVp) {
        this._maxVp = maxVp;
    }

    /* Move player */
    move(direction) {
        //Llamada a la función de la API para mover el jugador
        movePlayer(this._token, direction).then(() => {
            //Llamada a la función que devuelve el jugador de la API
            getPlayer(this._token).then(playerData => {
                //Setemos la nueva x,y,direction
                this._x = playerData.x;
                this._y = playerData.y;
                this._direction = playerData.direction;
                //Setemos los valores x,y,direction al objeto vue para renderizarlos
                info.x = this._x;
                info.y = this._y;
                info.direction = this._direction;
                //Movemos la brujula
                rotarBrujula();
                //En caso de error al pedir los datos de jugador a la API
            }).catch(error => showLog(error.message));
            game.imagen = '../src/imgs/vista.jpg';
            //En caso de error en la API al mover de posición el jugador 
        }).catch(error => {
            game.imagen = '../src/imgs/muro.png';
            showLog(error.message);
        });
    }

    /* Attack */
    attackPlayer() {
        //Llamada a la función de la API para atacar
        attackEnemy(this._token, this.direction).then(data => {
            //Mostramos el daño inflingido en el ataque
            showLog('Ataque realizado: ' + data + ' de daño');
            //En caso de error en la API al atacar 
        }).catch(error => {
            showLog('Ataque fallado, no hay enemigos cerca');
            showLog(error);
        }
        );
    }

    /* Craft object */
    craft() {
        //Guardamos el objeto que el usuario a selecionado
        var id = $("#dark_select").val();
        var obj = objects.items[id];
        //Generamos un random para que haya una probabilidad de que el objeto este maldito
        let numRand = Math.floor((Math.random() * 10) + 1);
        if (numRand == 1) {
            obj.attack = -2;
            obj.defense = -2;
            showLog('Objeto maldito!');
        }
        //Llamada a la función de la API para craftear un nuevo objeto
        craftObject(this._token, obj).then(() => {
            //Llamada a la función que devuelve el jugador de la API
            getPlayer(this._token).then(playerData => {
                //Seteamos el objeto del jugador
                this._object = playerData.object;
                //Setemos los valores del objeto al objeto vue para renderizarlos
                objects.name = obj.name;
                objects.attack = obj.attack;
                objects.defense = obj.defense;
                objects.image = obj.image;
                //Mostramos al imagen del objeto
                $("#object-img").css("display", "block");
                //Actualizamos las stats de ataque y defense al objeto vue para renderizarlos
                stats.attack = this._attack;
                stats.defense = this._defense;
                stats.attack = parseInt(stats.attack) + parseInt(objects.attack);
                stats.defense = parseInt(stats.defense) + parseInt(objects.defense);
                showLog('Objeto ' + objects.name + ' crafteado');
                //En caso de error al pedir los datos de jugador a la API
            }).catch(error => showLog(error));
            //En caso de error en la API al atacar 
        }).catch(error => showLog(error));
    }

    /* Player pickup an object */
    pickup() {
        let objeto = null;
        //Llamada a la función de la API para comprobar los objetos y jugadores cerca del jugador
        getPlayersObjects(this._token).then(data => {
            //En caso que hayan objetos miramos si esta en la misma casilla que el jugador
            if (data.objects.length > 0) {
                for (let i = 0; i < data.objects.length; i++) {
                    if (player.x == data.objects[i].x && player.y == data.objects[i].y) {
                        //Guardamos el objeto encontrado
                        objeto = data.objects[i];
                        break;
                    }
                }
            }
            //Comprobamos si la varible donde se ha guardado el objeto no es nula
            if (objeto != null) {
                //Llamada a la función de la API para recoger un objeto del mapa
                pickupObject(this._token, objeto.token).then(() => {
                    //Llamada a la función que devuelve el jugador de la API
                    getPlayer(this._token).then(playerData => {
                        //Setamos el objeto del jugador
                        this._object = playerData.object;
                        //Setemos los valores del objeto al objeto vue para renderizarlos
                        objects.name = this._object.name;
                        objects.attack = this._object.attack;
                        objects.defense = this._object.defense;
                        objects.image = this._object.image;
                        //Actualizamos las stats de ataque y defense al objeto vue para renderizarlos
                        stats.attack = this._attack;
                        stats.defense = this._defense;
                        stats.attack = parseInt(stats.attack) + parseInt(this._object.attack);
                        stats.defense = parseInt(stats.defense) + parseInt(this._object.defense);
                        showLog('Objeto ' + objects.name + ' recogido');
                        //En caso de error al pedir los datos de jugador a la API
                    }).catch(error => showLog(error));
                    //En caso de error en la API añ recoger un objeto
                }).catch(error => {
                    showLog("No se ha podido recoger el objeto porque no tienes uno equipado");
                    showLog(error);
                });
                //En caso de no haber objeto en la casilla se informa al jugador
            } else {
                showLog("No hay ningun objeto en esta casilla");
            }
            //En caso de error en la API al pedir los objetos y jugadores cercanos
        }).catch(error => {
            showLog(error.message);
        });
    }
}