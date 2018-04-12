var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    dateFormat = require('dateformat'),
    https = require('https'),
    promise = require("bluebird"),
    request = require('request'),
    sansAccent = require('sans-accent')(),
    sanitizer = require('sanitizer'),
    entitiesModels = require('./entities_models'),
    nodeManager = require('./node_manager'),
    fetch = require('node-fetch');

entitiesModels.dataStorage.initEnv();

io.sockets.on('connection', function (socket, pseudo) {
    var now = new Date();
    var date = dateFormat(now, "dd.mm.yyyy");
    var tim = dateFormat(now, "H:MM:ss");
    var theEnd = date + ' à ' + tim;

    socket.emit("messagec", { pseudo: entitiesModels.dataStorage.nodesModule.name, message: ent.encode(entitiesModels.dataStorage.nodesModule.nodes[0].response), date: theEnd });

    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function (pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouveau_client', pseudo);
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {
        var now = new Date();
        var date = dateFormat(now, "dd.mm.yyyy");
        var tim = dateFormat(now, " H:MM:ss");
        var theEnd = date + ' à ' + tim;
        message = message.trim();
        message = sanitizer.sanitize(message);
        message = sansAccent(message);
        var lmsg = message.toLowerCase();

        if (entitiesModels.dataStorage.getCurrentNode() == -1) {
            entitiesModels.dataStorage.setCurrentNode(nodeManager.searchNode(entitiesModels.dataStorage, lmsg));
            if (entitiesModels.dataStorage.getCurrentNode() == -1) {
                entitiesModels.dataStorage.setCurrentNode(entitiesModels.dataStorage.unknownNode);
                socket.emit('messagec', { pseudo: entitiesModels.dataStorage.nodesModule.name, message: ent.encode(entitiesModels.dataStorage.nodesModule.nodes[entitiesModels.dataStorage.getCurrentNode()].response), date: theEnd });
            }
        }

        if (entitiesModels.dataStorage.nodesModule.nodes[entitiesModels.dataStorage.getCurrentNode()].intent == "welcome") {
            socket.emit('messagec', { pseudo: entitiesModels.dataStorage.nodesModule.name, message: ent.encode("En quoi puis-je vous aider ?"), date: theEnd });
        }

        if (entitiesModels.dataStorage.nodesModule.nodes[entitiesModels.dataStorage.getCurrentNode()].intent == "buy") {
            var buyProm = new Promise(function (resolver, reject) {
                if (entitiesModels.remindConfig['categories_age']['adolescent'] == 0 && entitiesModels.remindConfig['categories_age']['bebe'] == 0
                    && entitiesModels.remindConfig['categories_age']['bebe'] == 0 && entitiesModels.remindConfig['categories_age']['adulte'] == 0)
                    entitiesModels.checkAge(message);
                if (entitiesModels.remindConfig['departureDate'] == "")
                    entitiesModels.checkDate(message);
                if (entitiesModels.remindConfig['classe'] == "")
                    entitiesModels.checkClass(message);
                entitiesModels.checkOperators(message);
                if (entitiesModels.remindConfig['departure'].length == 0 || entitiesModels.remindConfig['arrival'].length == 0)
                    entitiesModels.checkAeroport(message.toUpperCase(), entitiesModels.remindConfig['departure'].length == 0 ? 'departure' : 'arrival');
                if (entitiesModels.remindConfig['departure'].length == 0) {
                    socket.emit('messagec', {
                        pseudo: entitiesModels.dataStorage.nodesModule.name,
                        message: ent.encode("Afin d'établir un billet, j'ai besoin de votre "
                            + (entitiesModels.remindConfig['departure'].length == 0 ? "lieu de départ." : "")),
                        date: theEnd
                    });
                }
                else if (entitiesModels.remindConfig['arrival'].length == 0) {
                    socket.emit('messagec', {
                        pseudo: entitiesModels.dataStorage.nodesModule.name,
                        message: ent.encode("Merci ! Quel sera votre "
                            + (entitiesModels.remindConfig['arrival'].length == 0 ? " destination ?" : "")),
                        date: theEnd
                    });
                }
                else if (entitiesModels.remindConfig['departure'].length == entitiesModels.remindConfig['arrival'].length) {
                    var nb = 0;
                    for (var i = 0; i < entitiesModels.remindConfig['departure'].length; i++) {
                        for (var j = 0; j < entitiesModels.remindConfig['arrival'].length; j++) {
                            if (entitiesModels.remindConfig['departure'][i] == entitiesModels.remindConfig['arrival'][j]) {
                                nb++;
                                if (nb == entitiesModels.remindConfig['departure'].length) {
                                    entitiesModels.remindConfig['arrival'] = [];
                                    socket.emit('messagec', {
                                        pseudo: entitiesModels.dataStorage.nodesModule.name,
                                        message: ent.encode("Attention, votre destination ne peut être la même que votre arrivée. Merci de renseigner une autre" + (entitiesModels.remindConfig['arrival'].length == 0 ? " destination." : "")), date: theEnd
                                    });
                                }
                            }
                        }
                    }
                }
                else if ((entitiesModels.remindConfig['departure'].length != 0 && entitiesModels.remindConfig['arrival'].length != 0) && entitiesModels.remindConfig['departureDate'] == "") {
                    socket.emit('messagec', {
                        pseudo: entitiesModels.dataStorage.nodesModule.name,
                        message: ent.encode("Très bon choix ! Pourriez-vous me préciser votre"
                            + (entitiesModels.remindConfig['departureDate'] == "" ? " date de départ ?" : "")),
                        date: theEnd
                    });
                }
                else {
                    entitiesModels.dataStorage.setCurrentNode(-1);

                    socket.emit('waiting', { pseudo: entitiesModels.dataStorage.nodesModule.name, date: theEnd });

                    resolver(entitiesModels.remindConfig);
                }
            });

            buyProm.then(function (result) {

                //Affichage log pour dev
                // console.log(result);

                for (var dep = 0; dep < result['departure'].length; dep++) {
                    for (var arr = 0; arr < result['arrival'].length; arr++) {

                        var body = {
                            "cabinClass": result['classe'],
                            "discountCode": "",
                            "passengerCount": {
                                "YOUNG_ADULT": result['categories_age']['adolescent'],
                                "INFANT": result['categories_age']['bebe'],
                                "CHILD": result['categories_age']['enfant'],
                                "ADULT": result['categories_age']['adulte']
                            },
                            "currency": result['currency'],
                            "minimumAccuracy": "",
                            "requestedConnections": [
                                {
                                    "origin": {
                                        "airport": {
                                            "code": result['departure'][dep]
                                        }
                                    },
                                    "destination": {
                                        "airport": {
                                            "code": result['arrival'][arr]
                                        }
                                    },
                                    "departureDate": result['departureDate']
                                }
                            ],
                            "shortest": true
                        };

                        var header_data = {
                            "content-type": "application/json",
                            "accept": "application/hal+json;profile=com.afklm.flightoffers.available-offers.v2;charset=utf8",
                            "accept-language": "fr-FR",
                            "afkl-travel-country": "FR",
                            "afkl-travel-host": "AF",
                            "api-key": entitiesModels.dataStorage.key,
                        };

                        var recup_data = {
                            method: 'POST',
                            headers: header_data,
                            body: JSON.stringify(body),
                            mode: 'cors',
                            cache: 'default'
                        };

                        fetch('https://api.klm.com/opendata/flightoffers/available-offers', recup_data).then(function (response) {
                            if (response.status == 200)
                                return response.json();
                            else
                                return 400;
                        }).then(function (json) {
                            if (json != undefined && json.itineraries != undefined && Object.keys(json.itineraries).length != 0 && json != 400) {

                                //Initialisation du tableau des billets
                                var tmp = { 'itineraries': [] };

                                for (var i = 0; i < Object.keys(json.itineraries).length; i++) {

                                    //Si l'utilisateur demande le billet le moins cher (on prend tous les billets les moins chers)
                                    if (entitiesModels.remindConfig['price'][0] == entitiesModels.getMinPrice() && result['price'][1] == entitiesModels.getMinPrice()) {
                                        if (Object.keys(tmp['itineraries']).length == 0) {
                                            tmp['itineraries'].push(json.itineraries[0]);
                                        } else if (tmp['itineraries'][0].flightProducts[0].price.totalPrice > json.itineraries[i].flightProducts[0].price.totalPrice) {
                                            tmp['itineraries'] = [];
                                            tmp['itineraries'].push(json.itineraries[i]);
                                        } else if (tmp['itineraries'][0].flightProducts[0].price.totalPrice == json.itineraries[i].flightProducts[0].price.totalPrice) {
                                            tmp['itineraries'].push(json.itineraries[i]);
                                        }
                                    }
                                    //Si l'utilisateur demande le plus le plus cher (on prend tous les billets les plus chers)
                                    else if (entitiesModels.remindConfig['price'][0] == entitiesModels.getMaxPrice() && result['price'][1] == entitiesModels.getMaxPrice()) {
                                        if (Object.keys(tmp['itineraries']).length == 0) {
                                            tmp['itineraries'].push(json.itineraries[0]);
                                        } else if (tmp['itineraries'][0].flightProducts[0].price.totalPrice < json.itineraries[i].flightProducts[0].price.totalPrice) {
                                            tmp['itineraries'] = [];
                                            tmp['itineraries'].push(json.itineraries[i]);
                                        } else if (tmp['itineraries'][0].flightProducts[0].price.totalPrice == json.itineraries[i].flightProducts[0].price.totalPrice) {
                                            tmp['itineraries'].push(json.itineraries[i]);
                                        }
                                    }
                                    //Si l'utilisateur demande une tranche de prix pour les billets (exemple : entre 100 et 300 euros) + Tranche horaire
                                    else {
                                        if (parseInt((json.itineraries[i].connections[0].segments[0].departureDateTime.split('T')[1]).split(':')[0]) > parseInt(entitiesModels.remindConfig['timeDeparture'][0].split(':')[0])
                                            && parseInt((json.itineraries[i].connections[0].segments[0].departureDateTime.split('T')[1]).split(':')[0]) < parseInt(entitiesModels.remindConfig['timeDeparture'][1].split(':')[0])
                                            && parseInt(json.itineraries[i].flightProducts[0].price.totalPrice) > entitiesModels.remindConfig['price'][0]
                                            && parseInt(json.itineraries[i].flightProducts[0].price.totalPrice) < entitiesModels.remindConfig['price'][1])
                                            tmp['itineraries'].push(json.itineraries[i]);
                                        else if (parseInt((json.itineraries[i].connections[0].segments[0].departureDateTime.split('T')[1]).split(':')[0]) == parseInt(entitiesModels.remindConfig['timeDeparture'][0].split(':')[0])
                                            && parseInt((json.itineraries[i].connections[0].segments[0].departureDateTime.split('T')[1]).split(':')[1]) >= parseInt(entitiesModels.remindConfig['timeDeparture'][0].split(':')[1])
                                            && parseInt((json.itineraries[i].connections[0].segments[0].departureDateTime.split('T')[1]).split(':')[0]) == parseInt(entitiesModels.remindConfig['timeDeparture'][1].split(':')[0])
                                            && parseInt((json.itineraries[i].connections[0].segments[0].departureDateTime.split('T')[1]).split(':')[1]) <= parseInt(entitiesModels.remindConfig['timeDeparture'][1].split(':')[1])
                                            && parseInt(json.itineraries[i].flightProducts[0].price.totalPrice) > entitiesModels.remindConfig['price'][0]
                                            && parseInt(json.itineraries[i].flightProducts[0].price.totalPrice) < entitiesModels.remindConfig['price'][1])
                                            tmp['itineraries'].push(json.itineraries[i]);
                                        else {
                                            //Insert les billest tel quel dans le tableau si rien n'est précisé
                                            tmp['itineraries'].push(json.itineraries[i]);
                                        }
                                    }
                                }

                                socket.emit('recap', result['classe']);
                                socket.emit('recap', tmp);

                                entitiesModels.resetConfig();
                            }
                        });
                    }
                }
            });
            process.on('unhandledRejection', (reason, p) => {
                console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
            });

        }
        else
            entitiesModels.dataStorage.setCurrentNode(-1);
    });
});

server.listen(3615);
console.log("Starting Bot Console !");