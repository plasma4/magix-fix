const animate = node => {
    if(node.animation) return

    const animate = () => {
        const target = node.hovered ? 1.04 : 1
        const difference = target - node.scale

        if(Math.abs(difference) < 0.001) {
            node.scale = target
            node.animation = null
            node.world.update()
            return
        }

        node.scale += difference * 0.18

        node.world.update()

        node.animation = requestAnimationFrame(animate)
    }

    node.animation = requestAnimationFrame(animate)
}

const frames = new Image()
frames.src = "../Magix/frames.png"

export default {
    background: (() => {
        const canvas = document.createElement("canvas")
        canvas.width = 1920
        canvas.height = 1080

        const ctx = canvas.getContext("2d")
        const image = new Image()

        const rock = new Image()
        const borders = new Image()

        let loaded = 0

        const compose = () => {
            if (++loaded !== 2) return

            ctx.drawImage(rock, 0, 0, 1920, 1080)
            ctx.drawImage(borders, 0, 0, 1920, 1080)

            image.src = canvas.toDataURL()
        }

        rock.onload = compose
        borders.onload = compose

        rock.src = "../img/bgMidRock.jpg"
        borders.src = "../img/darkBorders.png"

        return image
    })(),

    draw: {
        line(ctx, object) {
            const { from, to, width } = object

            const dx = to.x - from.x
            const dy = to.y - from.y
            const length = Math.hypot(dx, dy) || 1

            const nx = -dy / length
            const ny = dx / length

            ctx.save()
            ctx.lineCap = "round"
            ctx.lineJoin = "round"

            // Outline, fading near connected nodes
            const outline = ctx.createLinearGradient(
                from.x, from.y,
                to.x, to.y
            )

            outline.addColorStop(0, "rgba(48, 37, 27, 0.15)")
            outline.addColorStop(0.15, "rgba(48, 37, 27, 0.75)")
            outline.addColorStop(0.85, "rgba(48, 37, 27, 0.75)")
            outline.addColorStop(1, "rgba(48, 37, 27, 0.15)")

            ctx.beginPath()
            ctx.moveTo(from.x, from.y)
            ctx.lineTo(to.x, to.y)
            ctx.lineWidth = width + 1.5
            ctx.strokeStyle = outline
            ctx.stroke()

            // Main body
            ctx.beginPath()
            ctx.moveTo(from.x, from.y)
            ctx.lineTo(to.x, to.y)
            ctx.lineWidth = width
            ctx.strokeStyle = "#796044"
            ctx.stroke()

            // Subtle highlight
            ctx.beginPath()
            ctx.moveTo(from.x - nx * width * 0.22, from.y - ny * width * 0.22)
            ctx.lineTo(to.x - nx * width * 0.22, to.y - ny * width * 0.22)
            ctx.lineWidth = Math.max(1, width * 0.2)
            ctx.strokeStyle = "rgba(190, 157, 108, 0.5)"
            ctx.stroke()

            ctx.restore()
        },

        node(ctx, object) {
            const pos = object.pos
            const size = object.size
            const tile = object.tile

            const width = size.width * object.scale
            const height = size.height * object.scale

            const x = pos.x - width / 2
            const y = pos.y - height / 2

            const radius = 0

            const fake = object.drawNode.layoutNode.original !== null

            ctx.save()

            ctx.shadowColor = "rgba(0, 0, 0, 0.14)"
            ctx.shadowBlur = object.hovered ? 16 : 8
            ctx.shadowOffsetY = object.hovered ? 4 : 2

            ctx.fillStyle = "#796044"

            ctx.beginPath()
            ctx.roundRect(x, y, width * 0.99, height * 0.99, radius)
            ctx.fill()

            ctx.shadowColor = "transparent"

            ctx.save()

            ctx.globalAlpha = object.hovered ? 1 : 0.96

            ctx.imageSmoothingEnabled = false;

            if (tile) {
                ctx.drawImage(
                    object.image,
                    tile.x, tile.y, tile.width, tile.height,
                    x,
                    y,
                    width,
                    height,
                )
            } else {
                ctx.drawImage(
                    object.image,
                    x,
                    y,
                    width,
                    height,
                )
            }
            
            ctx.restore()

            ctx.imageSmoothingEnabled = false;

            ctx.globalAlpha = 1
            ctx.shadowColor = "transparent"
            ctx.shadowBlur = 16
            ctx.shadowOffsetY = 4

            const frame = object.root
                ? { x: 339, y: 1, width: 50, height: 50 }
                : { x: 0, y: 0, width: 51, height: 52 }

            ctx.drawImage(
                frames,
                frame.x, frame.y, frame.width, frame.height,
                x, y, width, height
            )

            /*ctx.beginPath()
            ctx.roundRect(x, y, width, height, radius)

            ctx.lineWidth = 1
            ctx.strokeStyle = "rgba(0, 0, 0, 0.08)"

            if(fake) {
                ctx.setLineDash([4, 4])
            }

            ctx.stroke()
            ctx.setLineDash([])*/

            /*if(object.root) {
                ctx.beginPath()
                ctx.arc(
                    x + width - 9,
                    y + 9,
                    3,
                    0,
                    Math.PI * 2
                )

                ctx.fillStyle = "rgba(0, 0, 0, 0.25)"
                ctx.fill()
            }*/

            ctx.restore()
        }
    },

    focus(node) {
        setTimeout(() => {
            node.hovered = true
            animate(node)

            setTimeout(() => {
                if(node.world.hover !== node) {
                    node.hovered = false
                    animate(node)
                }
            }, 600)
        }, 150)
    },

    mouseEnter(node) {
        node.hovered = true
        animate(node)
    },

    mouseLeave(node) {
        node.hovered = false
        animate(node)
    }
}