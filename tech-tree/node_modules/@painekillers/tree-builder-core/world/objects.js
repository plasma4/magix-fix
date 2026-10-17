class Object {
    #world

    constructor(world) {
        this.#world = world
    }

    get world() {
        return this.#world
    }
}

class PSInstance extends Object {
    #x
    #y

    #width
    #height

    constructor(world, x, y, width, height) {
        super(world)

        this.#x = x
        this.#y = y
        this.#width = width
        this.#height = height
    }

    set pos(p) {
        this.#x = p[0]
        this.#y = p[1]
        this.world.update()
    }

    set size(s) {
        this.#width = s[0]
        this.#height = s[1]
        this.world.update()
    }

    get pos() {
        return {
            x: this.#x,
            y: this.#y
        }
    }

    get size() {
        return {
            width: this.#width,
            height: this.#height
        }
    }
}

/*export class test extends PSInstance {
    constructor(world, x, y, width, height, value) {
        super(world, x, y, width, height)

        this.value = value
    }

    draw(ctx) {
        let pos = this.pos
        let size = this.size

        ctx.fillStyle = "red"
        ctx.fillRect(
            pos.x - size.width / 2,
            pos.y - size.height / 2,
            size.width,
            size.height
        )

        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = "16px sans-serif"
        ctx.fillText(
            this.value,
            pos.x,
            pos.y
        )
    }
}*/

const placeholder = new Image()

placeholder.src = "data:image/svg+xml," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <text x="100" y="105"
        text-anchor="middle"
        font-family="sans-serif"
        font-size="20"
        fill="#b0b0b5">
        No Image
    </text>
</svg>
`)

export class ImageInstance extends PSInstance {
    #image

    constructor(world, x, y, width, height, image) {
        super(world, x, y, width, height)

        this.image = image
    }

    set image(img) {
        this.#image = img
        this.world.update()
    }

    get image() {
        return this.#image ?? placeholder
    }

    draw(ctx, p, s) {
        let pos = p || this.pos
        let size = s || this.size

        ctx.drawImage(
            this.image,
            pos.x - size.width / 2,
            pos.y - size.height / 2,
            size.width,
            size.height
        )
    }
}

export class Line extends Object {
    constructor(world, from, to, width = 2) {
        super(world)

        this.from = from
        this.to = to
        this.width = width
    }

    draw(ctx) {
        this.world.theme.draw.line(ctx, this)
    }
}

export class NodeInstance extends ImageInstance {
    constructor(world, x, y, width, height, node, image, drawNode) {
        super(world, x, y, width, height, image)

        this.node = node
        this.hovered = false
        this.scale = 1
        this.animation = null
        this.root = false

        this.drawNode = drawNode
    }

    focus() {
        this.world.theme.focus(this)
    }

    mouseEnter() {
        this.world.theme.mouseEnter(this)
    }

    mouseLeave() {
        this.world.theme.mouseLeave(this)
    }

    draw(ctx) {
        this.world.theme.draw.node(ctx, this)
    }
}