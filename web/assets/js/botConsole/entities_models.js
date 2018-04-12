var isNumber = require('is-number'),
    dateFormat = require('dateformat'),
    moment = require("moment"),
    pluralize = require('pluralize'),
    dataStorage = require('./init.js');

//Tableau de hash, stock les informations à envoyer à l'API d'AirFrance
var remindConfig = {
    'departure': [],
    'arrival': [],
    'departureDate': "",
    'categories_age': {
        "adolescent": 0,
        "bebe": 0,
        "enfant": 0,
        "adulte": 0
    },
    'classe': "",
    'currency': "EUR",
    'timeDeparture': ['00:00', '23:59'],
    'price': [0, 99999]
};

var cacheValue;

//Permet la fragementation d'une string avec les caractères spécifiés
var separators = ['-', ',', '\\/', '.', '_', ':', ' ', ', '];
var wordSeparator = " ";

var MIN_TICKET_PRICE = 0;
var MAX_TICKET_PRICE = 99999;
var MIN_TIMESCHEDULE = "00:00";
var MAX_TIMESCHEDULE = "23:59";
var DEFAULT_YEAR = "2001";


//-----------------------------Config-----------------------------------------//

function resetConfig() {
    remindConfig['departure'] = [];
    remindConfig['arrival'] = [];
    remindConfig['departureDate'] = "";
    remindConfig['categories_age']['adolescent'] = 0;
    remindConfig['categories_age']['bebe'] = 0;
    remindConfig['categories_age']['enfant'] = 0;
    remindConfig['categories_age']['adulte'] = 0;
    remindConfig['classe'] = "";
    remindConfig['currency'] = "EUR";
    remindConfig['price'] = [0, 99999];
    remindConfig['timeDeparture'] = ['00:00', "23:59"];
}

function getMinPrice() {
    return MIN_TICKET_PRICE;
}

function getMaxPrice() {
    return MAX_TICKET_PRICE;
}

//____________________________________________________________________________//


//==============================================================================
//=========================== Entities =========================================
//==============================================================================



//------------------------------- Price --------------------------------------//
function isPrice(probEntity, probCurrency) {
    if ((probEntity != undefined && isNumber(probEntity.substring(0, probEntity.length - 1))
        && (currency = isCurrency(dataStorage.deviseListFr, pluralize.singular(probEntity.substring(probEntity.length - 1, probEntity.length))) == true))
        || (remindConfig['currency'] != "" && isNumber(probEntity.substring(0, probEntity.length - 1)))) {
        cacheValue = parseInt(currency == true ? probEntity.substring(0, probEntity.length - 1) : parseInt(probEntity));
        return 'price';
    }
    else if ((isNumber(probEntity) && ((remindConfig['currency'] != "") || (probCurrency != undefined && isCurrency(dataStorage.deviseListFr, pluralize.singular(probCurrency)) != false)))) {
        cacheValue = parseInt(probEntity);
        return 'price'
    }
    return null;
}

function isCurrency(str, currElem) {
    var count = 0;
    splitted = str.toString().split(',');

    for (var s = 0; s < splitted.length; s++) {
        s
        if (str[count][2] == splitted[s])
            count++;
        if (splitted[s] != undefined && currElem == splitted[s]) {
            remindConfig['currency'] = str[count][2].toString().substring(0, str[count][2].length - 1).toUpperCase();
            return true;
        }
    }
    return false;
}

//____________________________________________________________________________//

//----------------------------- Time -----------------------------------------//

function purgeTimeSyntax() {
    if (cacheValue.split(':')[0].length == 3)
        cacheValue = cacheValue.slice(1, cacheValue.length);
    if (cacheValue.split(':')[1].length == 3)
        cacheValue = cacheValue.split(':')[0] + ':' + cacheValue.slice(4, cacheValue.length);
}

function isTimeSyntax(element) {
    var index = 0;
    var formatedTime = "";
    var utilSize = dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].utils.length;

    for (var i = 0; i < utilSize; i++) {
        if ((index = (element.indexOf(dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].utils[i]))) > -1) {
            if (parseInt(element.slice(0, index)) >= 0 && parseInt(element.slice(0, index)) <= 23) {
                if (parseInt(element.slice(index + 1, element.length)) >= 0 && parseInt(element.slice(index + 1, element.length)) <= 59) {
                    cacheValue = (parseInt(element.slice(0, index)) >= 10 ? element.slice(0, index) : "0" + element.slice(0, index)) + ':'
                        + (parseInt(element.slice(index + 1, element.length)) >= 10 ? element.slice(index + 1, element.length) : "0" + element.slice(index + 1, element.length));
                    purgeTimeSyntax();
                    return true;
                }
                else {
                    cacheValue = (parseInt(element.slice(0, index)) >= 10 ? element.slice(0, index) : "0" + element.slice(0, index)) + ':00';
                    purgeTimeSyntax();
                    return true;
                }
            }
            return true;
        }
    }
    return false;
}

function isTimeSchedule(firstPart, SecondPart, thirdPart) {

    if (firstPart != undefined && isTimeSyntax(firstPart) == true)
        return 'timeDeparture';
    else if (firstPart != undefined && SecondPart != undefined && thirdPart != undefined && isTimeSyntax(SecondPart) == true) {
        if ((parseInt(firstPart) >= 0 && parseInt(firstPart) <= 23) && (parseInt(thirdPart) >= 0 && parseInt(thirdPart) <= 59)) {
            cacheValue = (parseInt(firstPart) >= 10 ? firstPart : "0" + firstPart) + ':' + (thirdPart >= 10 ? thirdPart : "0" + thirdPart);
            if (cacheValue.split(':')[0].length == 3)
                cacheValue = cacheValue.slice(1, cacheValue.length);
            return 'timeDeparture';
        }
    }
    return null;
}

//____________________________________________________________________________//

//-------------------------------- Operating ---------------------------------//

//-------------------------- --Check Operators Range----------------------------

function checkOperators(message) {
    var operatorIndex = -1;
    var operatorLenght = 0;
    var utils = dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].utils;
    var operators = dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].keywords;
    var linker = dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].keywords[6];
    var str = (message.toLowerCase()).split(wordSeparator);
    var select = dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].keywords[0];

    for (var i = 0; i < str.length; i++) {

        if (((operatorIndex = operators.indexOf(str[i] + wordSeparator + str[i + 1])) > -1
            || (operatorIndex = operators.indexOf(str[i] + wordSeparator + str[i + 1] + wordSeparator + str[i + 2])) > -1
            || (operatorIndex = operators.indexOf(str[i])) > -1) /*&& operatorIndex != 6*/) {
            operatorLenght = (dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].keywords[operatorIndex].split(wordSeparator)).length;
            if (isEntityLeftOperating(operatorIndex, str[i + operatorLenght], str[i + operatorLenght + 1], str[i + operatorLenght + 2]) != false) {

                return true;
            }
            if (isEntityRightOperating(str[i - 3], str[i - 2], str[i - 1], operatorIndex) != false
                || isEntityRightOperating(str[i - 2], str[i - 1], str[i], operatorIndex) != false
                || isEntityRightOperating(str[i - 1], str[i], str[i + 1], operatorIndex) != false) {
                return true;
            }
            if (isEntityOperatingBetween(
                operatorIndex,
                isNumber(str[i - 1]) == false
                    ? (isNumber(str[i - 2]) ? str[i - 2] + str[i - 1] : str[i - 1])
                    : (utils.indexOf(str[i - 2]) > -1 ? str[i - 3] + str[i - 2] + str[i - 1] : (isNumber(str[i - 1]) == true ? str[i - 1] : str[i - 2] + str[i - 1])),
                str[i],
                isNumber(str[i + 1]) == false
                    ? str[i + 1]
                    : (utils.indexOf(str[i + 2]) > -1 ? (isNumber(str[i + 3]) ? str[i + 1] + str[i + 2] + str[i + 3] : str[i + 1] + str[i + 2]) : str[i + 1] + str[i + 2]))) {
                return true;
            }
        }
        else if ((message.toLowerCase()).indexOf(dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].special[0] + wordSeparator + dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].special[1]) > -1
            || (message.toLowerCase()).indexOf(pluralize.plural(dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].special[0]) + wordSeparator + pluralize.plural(dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].special[1])) > -1
            || (message.toLowerCase()).indexOf(pluralize.singular(dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].special[0]) + wordSeparator + pluralize.singular(dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].special[1])) > -1)
            remindConfig['price'] = [MIN_TICKET_PRICE, MIN_TICKET_PRICE];
        else if ((message.toLowerCase()).indexOf(dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].special[0] + wordSeparator + dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].special[2]) > -1
            || (message.toLowerCase()).indexOf(pluralize.plural(dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].special[0]) + wordSeparator + pluralize.plural(dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].special[2])) > -1
            || (message.toLowerCase()).indexOf(pluralize.singular(dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].special[0]) + wordSeparator + pluralize.singular(dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].special[2])) > -1)
            remindConfig['price'] = [MAX_TICKET_PRICE, MAX_TICKET_PRICE];
    }
}
//------------------------------------------------------------------------------

function isEntityLeftOperating(leftOperator, firstElement, nextElement, lastElement) {
    var entityType = '';

    if ((leftOperator == 2 || leftOperator == 5)
        && ((entityType = (isPrice(firstElement, nextElement))) != null
            || (entityType = (isTimeSchedule(firstElement, nextElement, lastElement))) != null)) {
        if (leftOperator == 5 && entityType != null)
            remindConfig[entityType] = [cacheValue == undefined ? (entityType == 'price' ? MIN_TICKET_PRICE : MIN_TIMESCHEDULE) : cacheValue,
            entityType == 'price' ? MAX_TICKET_PRICE : MAX_TIMESCHEDULE];
        else if (leftOperator == 2 && entityType != null)
            remindConfig[entityType] = [entityType == 'price' ? MIN_TICKET_PRICE : MIN_TIMESCHEDULE,
            cacheValue == undefined ? (entityType == 'price' ? MAX_TICKET_PRICE : MAX_TIMESCHEDULE) : cacheValue];
        return true;
    }
    return false;
}

function isEntityRightOperating(firstElement, nextElement, lastElement, rightOperator) {
    var entityType = '';

    if (((entityType = (isPrice(firstElement, nextElement))) != null
        || (entityType = (isTimeSchedule(firstElement, nextElement, lastElement))) != null)
        && (rightOperator == 3 || rightOperator == 4)) {
        if (rightOperator == 3 && entityType != null)
            remindConfig[entityType] = [cacheValue == undefined ? (entityType == 'price' ? MIN_TICKET_PRICE : MIN_TIMESCHEDULE) : cacheValue,
            entityType == 'price' ? MAX_TICKET_PRICE : MAX_TIMESCHEDULE];
        else if (rightOperator == 4 && entityType != null)
            remindConfig[entityType] = [entityType == 'price' ? MIN_TICKET_PRICE : MIN_TIMESCHEDULE,
            cacheValue == undefined ? (entityType == 'price' ? MAX_TICKET_PRICE : MAX_TIMESCHEDULE) : cacheValue];
        return true;
    }
    return false;
}

function isEntityOperatingBetween(operator, leftEntity, linkOperator, rightEntity) {
    var entityType = '';

    if ((entityType = (isPrice(leftEntity.split(wordSeparator)[0], leftEntity.split(wordSeparator)[1]))) != null) {
        if (dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].keywords[6].indexOf(linkOperator) > -1 && entityType != null) {
            remindConfig[entityType][0] = (cacheValue == undefined ? (entityType == 'price' ? MIN_TICKET_PRICE : MIN_TIMESCHEDULE) : cacheValue);
            if ((entityType = (isPrice(rightEntity.split(wordSeparator)[0], rightEntity.split(wordSeparator)[1]))) != null) {
                remindConfig[entityType][1] = (cacheValue == undefined ? (entityType == 'price' ? MAX_TICKET_PRICE : MAX_TIMESCHEDULE) : cacheValue);
                return true;
            }
        }
    }
    else if ((entityType = (isTimeSchedule(leftEntity.split(wordSeparator)[0], leftEntity.split(wordSeparator)[1], leftEntity.split(wordSeparator)[2]))) != null && entityType != null) {
        if (dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.timebudgetStep].keywords[6].indexOf(linkOperator) > -1 && entityType != null) {
            remindConfig[entityType][0] = (cacheValue == undefined ? (entityType == 'price' ? MIN_TICKET_PRICE : MIN_TIMESCHEDULE) : cacheValue);
            if ((entityType = (isTimeSchedule(rightEntity.split(wordSeparator)[0], leftEntity.split(wordSeparator)[1], rightEntity.split(wordSeparator)[2]))) != null && entityType != null) {
                remindConfig[entityType][1] = (cacheValue == undefined ? (entityType == 'price' ? MAX_TICKET_PRICE : MAX_TIMESCHEDULE) : cacheValue);
                return true;
            }
        }
    }
    remindConfig[entityType] = [entityType == 'price' ? MIN_TICKET_PRICE : MIN_TIMESCHEDULE, entityType == 'price' ? MAX_TICKET_PRICE : MAX_TIMESCHEDULE];
    return false;
}

//____________________________________________________________________________//



//------------------------------- Utils --------------------------------------//

function searchPerfectMatch(str, sub, delim) {
    if (delim != "")
        str = str.split(delim);

    if (sub != "") {
        for (var s = 0; s < str.length; s++) {
            if (str[s] == sub) {
                return true;
            }
        }
    }
    return false;
}

//____________________________________________________________________________//

//----------------------------- Direction ------------------------------------//

function determineDirection(entities, direction) {
    if (direction != undefined && ((direction[0] == 1 && entities['arrival'].length != 0) || (direction[0] == 0 && entities['arrival'].length == 0))) {
        entities['tmp'] = entities['departure'];
        entities['departure'] = entities['arrival'];
        entities['arrival'] = entities['tmp'];
    }
    return entities;
}

//____________________________________________________________________________//

//==============================================================================
//========================== End Entities ======================================
//==============================================================================


//----------------------------Check Aeroports---------------------------------//
function checkAeroport(message, point) {
    var airportsNumber = dataStorage.airportsListFr.length;
    var paramSwitch = false;
    var direction = undefined;
    var locations = {
        'departure': remindConfig['departure'],
        'arrival': remindConfig['arrival'],
        'tmp': []
    };
    var str = (message.toUpperCase()).split(wordSeparator);
    var messageLength = str.length;

    for (var i = 0; i < messageLength; i++) {
        if (locations['departure'].length == 0 || locations['arrival'].length == 0) {
            IATACHECK:
            for (var j = 0; j < airportsNumber; j++) {
                if (dataStorage.airportsListFr[j][0] == str[i]) {
                    locations[point].push(dataStorage.airportsListFr[j][0]);
                    if (point == 'departure' && remindConfig['arrival'] == "") {
                        point = 'arrival';
                        if (str[i + 1] != undefined && dataStorage.directionalEntities[str[i + 1]] != undefined)
                            direction = str[i + 1].toString();
                        else if (dataStorage.directionalEntities[str[i]] != undefined)
                            direction = str[i].toString();
                        else if (dataStorage.directionalEntities[str[i - 1]] != undefined)
                            direction = str[i - 1].toString();
                    }
                    else
                        continue IATACHECK;
                }
            }
            for (var k = 0; k < airportsNumber; k++) {
                if (dataStorage.airportsListFr[k][1] != undefined && (dataStorage.airportsListFr[k][1] == str[i])
                    || dataStorage.airportsListFr[k][2] != undefined && dataStorage.airportsListFr[k][2] == str[i]
                    || dataStorage.airportsListFr[k][3] != undefined && dataStorage.airportsListFr[k][3] == str[i]) {
                    locations[point].push(dataStorage.airportsListFr[k][0]);
                    if (point == 'departure' && remindConfig['arrival'] == "") {
                        if (str[i + 1] != undefined && dataStorage.directionalEntities[str[i + 1]] != undefined)
                            direction = str[i + 1].toString();
                        else if (dataStorage.directionalEntities[str[i]] != undefined)
                            direction = str[i].toString();
                        else if (dataStorage.directionalEntities[str[i - 1]] != undefined)
                            direction = str[i - 1].toString();
                        paramSwitch = true;
                    }
                }
            }
            if (paramSwitch == true) {
                if (point == 'departure' && remindConfig['arrival'] == "")
                    point = 'arrival';
            }
        }
        else
            break;
    }
    locations = determineDirection(locations, dataStorage.directionalEntities[direction]);
    remindConfig['departure'] = locations['departure'];
    remindConfig['arrival'] = locations['arrival'];
}
//------------------------------------------------------------------------------

//------------------------------Check Date--------------------------------------

function checkDate(message) {
    var dateFormatChecker = message.split(new RegExp('[' + separators.join('') + ']', 'g'));
    var actualDate = new Date();
    for (var i = 0; i < dateFormatChecker.length; i++) {
        if (isNumber(dateFormatChecker[i]) == true && (dateFormatChecker[i] > 0 && dateFormatChecker[i] < 32)
            && isNumber(dateFormatChecker[i + 1]) == true && (dateFormatChecker[i + 1] > 0 && dateFormatChecker[i + 1] < 13)) {
            remindConfig['departureDate'] = moment(new Date(dateFormatChecker[i] + '-' + dateFormatChecker[i + 1] + '-' + dateFormatChecker[i + 2]).toUTCString()).format('YYYY-MM-DD');
            if (remindConfig['departureDate'].split('-')[0] == DEFAULT_YEAR)
                remindConfig['departureDate'] = actualDate.getFullYear() + '-' + remindConfig['departureDate'].split('-')[1] + '-' + remindConfig['departureDate'].split('-')[2];
            return 0;
        }
        else if (isNumber(dateFormatChecker[i]) == true && (dateFormatChecker[i] > 0 && dateFormatChecker[i] < 32)
            && ((dataStorage.nodesModule.nodes[dataStorage.getCurrentNode()].steps[dataStorage.dateStep].keywords.indexOf(dateFormatChecker[i + 1])) > -1)) {
            var month = dataStorage.nodesModule.nodes[dataStorage.getCurrentNode()].steps[dataStorage.dateStep].keywords.indexOf(dateFormatChecker[i + 1]) + 1;
            remindConfig['departureDate'] = moment(new Date(dateFormatChecker[i + 2] + '-' + month + '-' + dateFormatChecker[i]).toUTCString()).format('YYYY-MM-DD');
            if (remindConfig['departureDate'].split('-')[0] == DEFAULT_YEAR)
                remindConfig['departureDate'] = actualDate.getFullYear() + '-' + remindConfig['departureDate'].split('-')[1] + '-' + remindConfig['departureDate'].split('-')[2];
            return 0;
        }
        else if (dateFormatChecker[i] == dataStorage.nodesModule.nodes[dataStorage.getCurrentNode()].steps[dataStorage.dateStep].utils[0]) {
            for (var sp = 0; sp < dataStorage.nodesModule.nodes[dataStorage.getCurrentNode()].steps[dataStorage.dateStep].special.length; sp++) {
                if (dateFormatChecker[i + 1] != undefined && dateFormatChecker[i + 1] == dataStorage.nodesModule.nodes[dataStorage.getCurrentNode()].steps[dataStorage.dateStep].special[sp]
                    || (dateFormatChecker[i + 2] != undefined && dateFormatChecker[i + 1] + '-' + dateFormatChecker[i + 2] == dataStorage.nodesModule.nodes[dataStorage.getCurrentNode()].steps[dataStorage.dateStep].special[sp])) {
                    if (sp == 0)
                        remindConfig['departureDate'] = moment(actualDate.toUTCString()).format("YYYY-MM-DD");
                    else if (sp == 1)
                        remindConfig['departureDate'] = moment(actualDate.toUTCString()).add('1', 'day').format("YYYY-MM-DD");
                    else if (sp == 2)
                        remindConfig['departureDate'] = moment(actualDate.toUTCString()).add('2', 'day').format("YYYY-MM-DD");
                }
            }
        }
    }
    return -1;
}
//------------------------------------------------------------------------------


//-------------------------- Check Age ----------------------------------------
function checkAge(message) {

    var valueList = message.split(new RegExp('[' + separators.join('') + ']', 'g'));

    for (var i = 0; i < valueList.length; i++) {
        if (dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.ageStep].special.indexOf(pluralize.singular(valueList[i])) > -1) {
            if (isNumber(valueList[i - 1]))
                remindConfig['categories_age'][pluralize.singular(valueList[i]) == "personne" ? "adulte" : pluralize.singular(valueList[i])] += (isNaN(valueList[i - 1]) == true ? 1 : parseInt(valueList[i - 1]));
        }
    }

    if (remindConfig['categories_age']['bebe'] == 0 && remindConfig['categories_age']['adolescent'] == 0 && remindConfig['categories_age']['adulte'] == 0 && remindConfig['categories_age']['enfant'] == 0) {
        for (var i = valueList.length - 1; i > 0; i--) {
            if (dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.ageStep].keywords.indexOf(pluralize.singular(valueList[i])) > -1) {
                for (var j = 1; j < i; j++) {
                    if (isNumber(valueList[i - j])) {
                        if (valueList[i - j] < 2) {
                            remindConfig['categories_age']['bebe']++;
                        } else if (valueList[i - j] >= 2 && valueList[i - j] <= 11) {
                            remindConfig['categories_age']['enfant']++;
                        } else if (valueList[i - j] >= 12 && valueList[i - j] <= 15) {
                            remindConfig['categories_age']['adolescent']++;
                        } else if (valueList[i - j] >= 16) {
                            remindConfig['categories_age']['adulte']++;
                        }
                    }
                    else if (dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.ageStep].utils.indexOf(pluralize.singular(valueList[i - j])) <= -1 && isNaN(pluralize.singular(valueList[i - j]).charCodeAt(0)) == false)
                        break;
                }
            }
        }
    }

    if (remindConfig['categories_age']['bebe'] == 0 && remindConfig['categories_age']['adolescent'] == 0 && remindConfig['categories_age']['adulte'] == 0 && remindConfig['categories_age']['enfant'] == 0)
        remindConfig['categories_age']['adulte']++;
    return 0;

}
// -------------------------- END Check Age ------------------------------------

// -------------------------- Check Class In Flight ----------------------------
function checkClass(message) {
    for (var i = 0; i < dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.classStep].keywords.length; i++) {
        if (message.indexOf(dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.classStep].keywords[i]) != -1) {
            if (dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.classStep].keywords.indexOf(dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.classStep].keywords[i]) == 0 ||
                dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.classStep].keywords.indexOf(dataStorage.nodesModule.nodes[dataStorage.buyNode].steps[dataStorage.classStep].keywords[i]) == 1) {
                remindConfig['classe'] = "ECONOMY";
            } else {
                remindConfig['classe'] = "BUSINESS";
            }
        }
    }

    if (remindConfig['classe'] == "" || remindConfig['classe'] == undefined || remindConfig['classe'].length == 0) {
        remindConfig['classe'] = "ECONOMY";
    }
}
// -------------------------- END Check Class In Flight ------------------------

module.exports = { isEntityLeftOperating, isEntityRightOperating, isEntityOperatingBetween, checkAeroport, checkDate, checkAge, checkOperators, checkClass, dataStorage, remindConfig, resetConfig, getMinPrice, getMaxPrice };