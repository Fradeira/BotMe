function searchNode(data, message) {
    var nodeFound = -1;

    for (var i = 0; i < Object.keys(data.nodesModule.nodes).length; i++) {
        for (var j = 0; j < Object.keys(data.nodesModule.nodes[i].matches).length; j++) {
            if (message.indexOf(data.nodesModule.nodes[i].matches[j]) > -1) {
                if (data.nodesModule.nodes[i].intent == "welcome") {
                    nodeFound = i;
                }
                if (data.nodesModule.nodes[i].intent == "buy") {
                    nodeFound = i;
                }
            }
        }
    }
    if (nodeFound != -1)
        return nodeFound;
    return -1;
}

module.exports = { searchNode };