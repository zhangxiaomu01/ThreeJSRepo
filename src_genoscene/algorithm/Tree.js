class Node {
    constructor(newValue) {
        this._this = this;
        this.value = newValue;
        this.children = [];
    }
}

class AlgorithmTest {
    /**
     * A default constructor.
     * @constructor
     */
    constructor() {
        console.log("AlgorithmTest executed!");
    }

    static Run() {
        let rootNode = new Node(1);
        let num = 2;
        for (let ii = 0; ii < 6; ++ii) {
            rootNode.children.push(new Node(num++));
        }
        for (let jj = 0; jj < 3; ++jj) {
            let childNode = rootNode.children[jj];
            console.log(rootNode.children);
            childNode.children.push(new Node(num++));
        }
        console.log(rootNode);
        this.PostOrderTraversal(rootNode);
    }

    static PostOrderTraversal(rootNode) {
        if (!rootNode || !rootNode.children)
            return;

        for (let ii = 0; ii < rootNode.children.length; ++ii) {
            let child = rootNode.children[ii];
            this.PostOrderTraversal(child);
        }

        console.log(rootNode.value);
    }
};

export {AlgorithmTest}