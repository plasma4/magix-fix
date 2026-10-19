export class Node {
    constructor(id, pa, ch, val){
        this.id = id
        this.pa = pa
        this.ch = ch
        this.val = val

        this.parents = []
        this.children = []
    }
}

export class Graph {
    constructor(nodes){
        this.nodes = new Map(nodes.map(n => [n.id, n]))

        if (this.nodes.size !== nodes.length) {
            console.warn(`Duplicate node IDs`)
        }

        // resolve parent and child references
        for (const node of this.nodes.values()) {
            const parentIds = node.pa;
            const childIds = node.ch;

            // node says X is its parent
            for (const parentId of parentIds) {
                const parent = this.nodeFromId(parentId);
                if(!parent) {
                    console.warn(`Parent with id ${parentId} not found for node ${node.id}`);
                    continue;
                }

                if (!node.parents.includes(parent)) {
                node.parents.push(parent);
                }

                if (!parent.children.includes(node)) {
                parent.children.push(node);
                }
            }

            // node says X is its child
            for (const childId of childIds) {
                const child = this.nodeFromId(childId);
                if(!child) {
                    console.warn(`Child with id ${childId} not found for node ${node.id}`);
                    continue;
                }

                if (!node.children.includes(child)) {
                node.children.push(child);
                }

                if (!child.parents.includes(node)) {
                child.parents.push(node);
                }
            }
        }
    }

    nodeFromId(id) {
        return this.nodes.get(id)
    }

}

export class LayoutNode {
    constructor(node, l, original = null) {
        this.node = node
        this.connected = []

        this.layer = l
        this.original = original
    }

    addConnection(c){
        this.connected.push(c)
    }
}

/*
Recursion settings
Null: No recursion
False: Creates fake nodes when encountering recursion
True: Connects back to existing instance of a node when recursing
#: Real recursion to depths #
*/

/*
Strategies
- [X] Current BFS (First) — Layer by shortest distance from root; first discovery determines placement.
- [X] Undirected BFS (Undirected) — Shortest distance to root; layering is on directional.
- [X] Directed BFS, outward only (Outwards) — Follow prerequisite-to-dependent edges only.
- [X] Furthest-parent layering (Furthest) — Place each node one layer below its deepest prerequisite.
*/

export class LayoutGraph {
    constructor(graph, root, recurse, strategy = "First") {
        if(strategy == "First" && typeof recurse == "number") {
            throw new Error(`Cannot use strategy ${strategy} with numeric recursion setting`);
        }

        this.layers = new Map()

        const rootNode = graph.nodeFromId(root)
        if(!rootNode) {
            throw new Error(`Root node with id ${root} not found in graph`);
        }

        if(recurse === 0) {
            this.layers.set(0, [new LayoutNode(rootNode, 0)])
            return
        }

        const visited = new Map()
        const connections = new Set()

        const addConnection = (ln, from) => {
            const fromNode =
                this.layers.get(from.layer)?.[from.ind]

            if(!fromNode) return

            const a = `${ln.layer}:${ln.ind}`
            const b = `${from.layer}:${from.ind}`

            const key = [a, b].sort().join("|")

            if(connections.has(key)) {
                return
            }

            connections.add(key)
            ln.addConnection(from)
        }

        const queue = [{
            node: rootNode,
            layer: 0,
            from: null
        }]

        let qi = 0

        while (qi < queue.length) {
            const { node, layer, from } = queue[qi++]

            if(typeof recurse == "number" && Math.abs(layer) > recurse) {
                continue
            }

            if(!this.layers.has(layer)) {
                this.layers.set(layer, [])
            }

            const key = typeof recurse == "number"
                ? `${node.id}|${layer}`
                : node.id

            if(visited.has(key)) {
                if(from) {
                    const pos = visited.get(key)
                    const ln = this.layers.get(pos.layer)[pos.ind]

                    //holy crap i cannot think bruh
                    if(((recurse === false) || (recurse === null)) && pos.layer !== layer) { 
                        if (
                            recurse == null ||
                            strategy == "Outwards" &&
                            from !== null &&
                            Math.abs(layer) < Math.abs(from.layer)
                        ) { continue }

                        if (
                            strategy == "Furthest" &&
                            (
                                (layer > 0 && !node.parents.every(val => visited.has(val.id)))
                                ||
                                (layer < 0 && !node.children.every(val => visited.has(val.id)))
                            )
                        ) { continue }

                        const fn = new LayoutNode(node, layer, this.layers.get(pos.layer)[pos.ind])
                        this.layers.get(layer).push(fn)

                        addConnection(fn, from)
                    } else {
                        addConnection(ln, from)

                    }
                }

                continue
            }

            if (
                strategy == "Outwards" &&
                from !== null &&
                Math.abs(layer) < Math.abs(from.layer)
            ) { continue }

            if (
                strategy == "Furthest" &&
                (
                    (layer > 0 && !node.parents.every(val => visited.has(val.id)))
                    ||
                    (layer < 0 && !node.children.every(val => visited.has(val.id)))
                )
            ) { continue }

            const ln = new LayoutNode(node, layer)

            this.layers.get(layer).push(ln)

            const pos = {
                layer,
                ind: this.layers.get(layer).length - 1
            }

            visited.set(key, pos)

            if(from) {
                addConnection(ln, from)
            }

            for (const child of node.children) {
                queue.push({
                    node: child,
                    layer: layer + 1,
                    from: pos
                })
            }

            for (const parent of node.parents) {
                queue.push({
                    node: parent,
                    layer: strategy !== "Undirected" ? layer - 1: layer + 1,
                    from: pos
                })
            }

        }
    }
}

export class DrawNode {
    constructor(layoutNode, x, y, width, height) {
        this.layoutNode = layoutNode
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }
}

export class DrawConnection {
    constructor(fromNode, toNode) {
        this.fromNode = fromNode
        this.toNode = toNode

        if (fromNode.y <= toNode.y) {
            this.from = {
                x: fromNode.x,
                y: fromNode.y + fromNode.height / 2
            }

            this.to = {
                x: toNode.x,
                y: toNode.y - toNode.height / 2
            }
        } else {
            this.from = {
                x: fromNode.x,
                y: fromNode.y - fromNode.height / 2
            }

            this.to = {
                x: toNode.x,
                y: toNode.y + toNode.height / 2
            }
        }
    }
}

export class DrawGraph {
    constructor(layoutGraph, nodeWidth, nodeHeight, layerSpacing, nodeSpacing) {
        this.nodes = []
        this.connections = []

        const drawNodes = new Map()

        const layers = Array.from(layoutGraph.layers.entries())
            .sort((a, b) => a[0] - b[0])

        for (const [layerIndex, layerNodes] of layers) {
            const layerWidth =
                layerNodes.length * nodeWidth +
                (layerNodes.length - 1) * nodeSpacing

            let x = -layerWidth / 2 + nodeWidth / 2

            const y =
                layerIndex * (nodeHeight + layerSpacing)

            for (const layoutNode of layerNodes) {
                const drawNode = new DrawNode(
                    layoutNode,
                    x,
                    y,
                    nodeWidth,
                    nodeHeight
                )

                this.nodes.push(drawNode)
                drawNodes.set(layoutNode, drawNode)

                x += nodeWidth + nodeSpacing
            }
        }

        for (const drawNode of this.nodes) {
            for (const connection of drawNode.layoutNode.connected) {
                const toLayoutNode =
                    layoutGraph.layers
                        .get(connection.layer)[connection.ind]

                const toDrawNode =
                    drawNodes.get(toLayoutNode)

                if (toDrawNode) {
                    this.connections.push(
                        new DrawConnection(drawNode, toDrawNode)
                    )
                }
            }
        }
    }
}