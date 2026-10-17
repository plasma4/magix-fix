import { LayoutGraph, DrawGraph } from "../graph.js"
import { NodeInstance, Line } from "./objects.js"

export default class Bridge {
    constructor(graph, world) {
        this.graph = graph
        this.world = world

        this.layout = null
        this.draw = null
        this.obj = null
        this.toObj = null
        this.toNode = null

        this.root = null
    }

    #cleanWorld() {
        if(this.obj) {
            this.world.bulkRemove(obj => this.obj.includes(obj))

            this.obj = null
            this.toObj = null
            this.toNode = null
        }
    }

    calculateLayout(root, recurse){ // Real maxdepth, since we cant actually make it infinite
        this.layout = new LayoutGraph(this.graph, root, recurse)
        // Since JS is goofy like this ill just have recurse be a number when we want recursive
        this.root = this.graph.nodes.get(root)

        // Invalidate everything else
        this.draw = null
        this.#cleanWorld()
    }

    calculateDraw(width, height, padX, padY){
        if(!this.layout){
            console.warn("calculateLayout must be called prior to this")
            return
        }

        this.draw = new DrawGraph(this.layout, width, height, padX, padY)
        this.#cleanWorld()
    }

    createObjects(maxDepth){
        if(!this.draw){
            console.warn("calculateDraw must be called prior to this")
            return
        }

        this.#cleanWorld()
        
        this.obj = []
        this.toObj = new Map()
        this.toNode = new Map()

        // Add edges first so nodes render on top
        for (const connection of this.draw.connections) {
            if(
                maxDepth !== null &&
                (
                    Math.abs(connection.fromNode.layoutNode.layer) > maxDepth ||
                    Math.abs(connection.toNode.layoutNode.layer) > maxDepth
                )
            ){
                continue
            }

            let obj = new Line(
                this.world,
                connection.from,
                connection.to,
                2
            )

            this.obj.push(obj)
            this.world.addObject(obj)
        }

        // Add nodes
        for (const drawNode of this.draw.nodes) {
            if(
                maxDepth !== null &&
                Math.abs(drawNode.layoutNode.layer) > maxDepth
            ){
                continue
            }

            let obj = new NodeInstance(
                this.world,
                drawNode.x,
                drawNode.y,
                drawNode.width,
                drawNode.height,
                drawNode.layoutNode.node,
                drawNode.layoutNode.node.val?.icon,
                drawNode
            )

            obj.root =
                drawNode.layoutNode.node === this.root

            this.obj.push(obj)

            if (drawNode.layoutNode.original === null) {
                this.toNode.set(
                    obj,
                    drawNode.layoutNode.node
                )

                this.toObj.set(
                    drawNode.layoutNode.node,
                    obj
                )
            }

            this.world.addObject(obj)
        }

        this.focus(this.root)
    }

    focus(node) {
        if(!this.toObj) {
            console.warn("createObjects must be called prior to this")
            return
        }

        const obj = this.toObj.get(node)

        if(!obj) {
            console.warn(`Node ${node.id} is not currently visible`)
            return
        }

        this.world.camera.pos = [
            obj.pos.x,
            obj.pos.y
        ]

        this.world.camera.zoom = 1.5

        obj.focus()

        this.world.update?.()
    }
}