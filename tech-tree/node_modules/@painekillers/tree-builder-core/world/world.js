export default class World {
    /** @type {HTMLCanvasElement} */
    #canvas
    #ctx

    #camera
    #theme

    #paused = false

    updateRate = 1/60

    #objects = []
    #background

    constructor(canvas, theme) {
        this.#theme = theme
        this.#canvas = canvas
        this.#ctx = canvas.getContext("2d")

    }

    set paused(value) {
        this.#paused = value

        if (value) {
            this.#hoveredObject?.mouseLeave?.()
            this.#hoveredObject = null
        }
    }

    get paused() {
        return this.#paused
    }

    set theme(value) {
        this.#theme = value
        this.update()
    }

    get theme() {
        return this.#theme
    }

    set camera(cam) {
        this.#camera = cam
        this.update()
    }

    get camera() {
        return this.#camera
    }

    set background(bg) {
        this.#background = bg
        this.update()
    }

    get hover() {
        return this.#hoveredObject
    }

    addObject(obj) {
        if (this.#paused) return

        let index = this.#objects.findIndex(e => e.z > obj.z)

        if (index === -1) {
            this.#objects.push(obj)
        } else {
            this.#objects.splice(index, 0, obj)
        }

        this.update()
    }

    removeObject(obj) {
        if (this.#paused) return

        const index = this.#objects.indexOf(obj)

        if (index !== -1) {
            this.#objects.splice(index, 1)
        }

        if (this.#hoveredObject === obj) {
            this.#hoveredObject = null
        }

        this.update()
    }

    bulkRemove(func) {
        if (this.#paused) return

        this.#objects = this.#objects.filter(obj => {
            if (func(obj)) {
                if (this.#hoveredObject === obj) {
                    this.#hoveredObject = null
                }
                return false
            }

            return true
        })

        this.update()
    }

    clear() {
        if (this.#paused) return

        this.#objects = []
        this.#hoveredObject = null

        this.update()
    }

    get objects() {
        return this.#objects
    }

    #draw() {
        this.#ctx.clearRect(
            0,
            0,
            this.#canvas.width,
            this.#canvas.height
        )

        if (this.#background) {
            this.#ctx.drawImage(
                this.#background,
                0,
                0,
                this.#canvas.width,
                this.#canvas.height
            )
        }

        this.#ctx.save()

        const cpos = this.#camera.pos

        this.#ctx.translate(
            this.#canvas.width / 2,
            this.#canvas.height / 2
        )

        this.#ctx.scale(
            this.#camera.zoom,
            this.#camera.zoom
        )

        this.#ctx.translate(
            -cpos.x,
            -cpos.y
        )

        this.#objects.forEach(e => e.draw(this.#ctx))

        this.#ctx.restore()
    }

    #frameRequested = false

    update() {
        if (this.#paused) return
        if (this.#frameRequested) return

        this.#frameRequested = true

        requestAnimationFrame(() => {
            this.#frameRequested = false

            this.#draw()
        })
    }

    resize(width, height) {
        this.#canvas.width = width
        this.#canvas.height = height
        
        this.#draw()

        this.#camera.viewport = [width, height]
    }

    #hoveredObject = null

    mouseWorldPosition(e) {
        if (!e) {
            return {
                x: null,
                y: null
            }
        }

        const rect = this.#canvas.getBoundingClientRect()

        const x =
            e.clientX -
            rect.left -
            this.#canvas.width / 2

        const y =
            e.clientY -
            rect.top -
            this.#canvas.height / 2

        return {
            x: x / this.#camera.zoom + this.#camera.pos.x,
            y: y / this.#camera.zoom + this.#camera.pos.y
        }
    }

    objectAt(x, y) {
        for (let i = this.#objects.length - 1; i >= 0; i--) {
            const object = this.#objects[i]

            if (!object.pos || !object.size) {
                continue
            }

            const pos = object.pos
            const size = object.size

            if (
                x >= pos.x - size.width / 2 &&
                x <= pos.x + size.width / 2 &&
                y >= pos.y - size.height / 2 &&
                y <= pos.y + size.height / 2
            ) {
                return object
            }
        }

        return null
    }
}