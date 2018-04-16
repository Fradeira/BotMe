var fs = require('fs'),
    fetch = require('node-fetch');
//Clef API pour Air France
var key = 'g4stvh2updjutnbdayawwy2m';

//Nodes predefinis dynamiquement
var buyNode;
var welcomeNode;
var unknownNode;

// Etape d'achat predefinis depuis le fichier JSON
var placeStep;
var ageStep;
var dateStep;
var classStep;
var timebudgetStep;

//Node actuel du fichier JSON, set à -1 en position initiale, l'utilisateur n'ayant pas encore écrit de message
var currentNode = -1;
//Recupere les nodes
var nodesModule = JSON.parse(fs.readFileSync("./json/node.json"));
var directionalEntities = JSON.parse(fs.readFileSync("./json/directional_entities.json"));

//Stock les informations "airports" dans un tableau
var airportsListEn = [];
var airportsListFr = [];
var deviseListFr = [];

var list;

function findNode(node) {
    for (var i = 0; i < Object.keys(nodesModule.nodes).length; i++) {
        if (nodesModule.nodes[i].intent == node)
            return i;
    }
    return -1;
}

function findStep(step, node) {
    for (var i = 0; i < Object.keys(nodesModule.nodes[node].steps).length; i++) {
        if (nodesModule.nodes[node].steps[i].s == step) {
            return i;
        }
    }
    return -1;
}

function initEnv() {
    var step;

    var airportsFileEn = fs.readFileSync("./json/airports_en").toString().split('\n');
    var airportsFileFr = fs.readFileSync("./json/airports_fr").toString().split('\n');
    var deviseFileFr = fs.readFileSync("./json/devises_fr").toString().split('\n');

    if (!airportsFileEn) return -1;
    if (!airportsFileFr) return -2;
    if (!deviseListFr) return -3;
    if (!this.nodesModule) return -4;
    if (!this.directionalEntities) return -5;


    for (var d = 0; d < deviseFileFr.length; d++)
        this.deviseListFr[d] = deviseFileFr[d].toLowerCase().split('|');

    for (var i = 0, j = 0, k = 0; i < airportsFileEn.length; i++) {
        this.airportsListEn[step] = airportsFileEn[i].toUpperCase().split('|');
        while (airportsFileFr[j] != undefined && (airportsFileFr[j].split('|'))[0] != this.airportsListEn[step][0])
            j++;
        if (airportsFileFr[j] != undefined)
            this.airportsListFr[k++] = airportsFileFr[j].toUpperCase().split('|');
        step++;

    }
    step = 0;

    this.buyNode = findNode('buy');
    this.welcomeNode = findNode('welcome');
    this.unknownNode = findNode('unknown');
    if (this.buyNode == -1 || this.welcomeNode == -1 || this.unknownNode == -1)
        return -6;


    this.placeStep = findStep('place', this.buyNode);
    this.ageStep = findStep('age', this.buyNode);
    this.dateStep = findStep('date', this.buyNode);
    this.classStep = findStep('classe', this.buyNode);
    this.timebudgetStep = findStep('timebudget', this.buyNode);
    if (this.placeStep == -1 || this.ageStep == -1 || this.dateStep == -1 || this.placeStep == -1 || this.timebudgetStep == -1)
        return -7;

    //Recuperation des Aeroports d'AIR FRANCE - Version FR
    // var header_data ={
    //   "content-type": "application/json",
    //   "accept": "application/hal+json",
    //   "accept-language": "fr-FR",
    //   "afkl-travel-country": "FR",
    //   "afkl-travel-host": "AF",
    //   "api-key": key,
    // };
    //
    // var recup_data = {
    //   method: 'GET',
    //   headers: header_data
    // };
    //
    // fetch('https://api.klm.com/opendata/flightoffers/reference-data?country=FR', recup_data).then(function(response){
    //   if (response.status == 200)
    //     return response.json();
    //   else
    //     return 400;
    // }).then(function(json){
    //     if (json.length != 0 && json != 400){
    //       //Parcours des Continents
    //       for (var i = 0; i < Object.keys(json.continents).length; i++) {
    //         //Parcours des Pays par Continents
    //         for (var j = 0; j < Object.keys(json.continents[i].countries).length; j++) {
    //           //Parcours des villes par Pays
    //           if (json.continents[i].countries[j].cities != undefined) {
    //             for (var k = 0; k < Object.keys(json.continents[i].countries[j].cities).length; k++) {
    //               //Parcours des Aeroports par Ville
    //               for (var l = 0; l < Object.keys(json.continents[i].countries[j].cities[k].airports).length; l++) {
    //                 list += json.continents[i].countries[j].cities[k].airports[l].code+"|"+json.continents[i].countries[j].cities[k].airports[l].name+"|"+json.continents[i].countries[j].name+"|"+json.continents[i].name+"\n";
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //
    //     fs.writeFileSync("../listOfAirportFR.json", list, "UTF-8");
    //  });

    return 0
}

function getCurrentNode() {
    return currentNode;
}

function setCurrentNode(nodeIndex) {
    currentNode = nodeIndex;
}

module.exports = {
    initEnv, key, nodesModule, directionalEntities,
    airportsListEn, airportsListFr, deviseListFr,
    getCurrentNode, setCurrentNode, buyNode, unknownNode, welcomeNode,
    placeStep, ageStep, dateStep, classStep, timebudgetStep
};
