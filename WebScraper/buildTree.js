const fs = require('fs')

var buildTree = function(originalString) {
    let node = tree
    let splitString = originalString.split(' ')
    while(splitString.length !== 0) {
        let keys = Object.keys(node.children)
        if (!keys.includes(splitString[0])) {
            var isEnd = splitString.length === 1
            node.children[splitString[0]] = new Node(isEnd)
        }
        node = node.children[splitString[0]]
        splitString.shift()
    }
}

var text = fs.readFileSync('./textFile.txt','utf8')
text = text.replace(/\uFFFD/g, '').split(',')
var Node = function(isEnd) {
    this.isEnd = isEnd
    // While I would rather use a map, they can't be converted in JSON.stringify
    this.children = {}
}
let tree = new Node(false, 'root')
for (var i = 0; i < text.length; i ++) {
    buildTree(text[i])
}
fs.writeFile('tree.txt', JSON.stringify(tree));



