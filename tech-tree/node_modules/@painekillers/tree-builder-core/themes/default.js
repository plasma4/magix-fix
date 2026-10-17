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

export default {
    background: Object.assign(new Image(),
        {src: "data:image/svg+xml," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
                <defs>
                    <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#f4f5f7"/>
                        <stop offset="100%" stop-color="#e8eaed"/>
                    </linearGradient>

                    <radialGradient id="light" cx="50%" cy="42%" r="65%">
                        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
                        <stop offset="60%" stop-color="#ffffff" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                    </radialGradient>

                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path
                            d="M 40 0 L 0 0 0 40"
                            fill="none"
                            stroke="#9da3ad"
                            stroke-width="1"
                            opacity="0.28"
                        />
                    </pattern>

                    <radialGradient id="fade" cx="50%" cy="50%" r="70%">
                        <stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>
                        <stop offset="100%" stop-color="#c8ccd3" stop-opacity="0.2"/>
                    </radialGradient>
                </defs>

                <rect width="1920" height="1080" fill="url(#base)"/>
                <rect width="1920" height="1080" fill="url(#light)"/>
                <rect width="1920" height="1080" fill="url(#grid)"/>
                <rect width="1920" height="1080" fill="url(#fade)"/>
            </svg>
        `)}
    ),

    focusButton: `
        <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="7"/>
            <circle cx="12" cy="12" r="2"/>
            <path d="M12 2V5"/>
            <path d="M12 19V22"/>
            <path d="M2 12H5"/>
            <path d="M19 12H22"/>
        </svg>
    `,

    rootButton: `
        <svg viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2.5"/>
            <circle cx="6" cy="19" r="2.5"/>
            <circle cx="18" cy="19" r="2.5"/>
            <path d="M12 7.5V12"/>
            <path d="M12 12L6 16.5"/>
            <path d="M12 12L18 16.5"/>
        </svg>
    `,

    searchButton: `
        <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6.5"></circle>
            <line x1="16" y1="16" x2="21" y2="21"></line>
        </svg>
    `,

    themeButton: `
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <circle cx="13.5" cy="6.5" r=".5"></circle>
            <circle cx="17.5" cy="10.5" r=".5"></circle>
            <circle cx="8.5" cy="7.5" r=".5"></circle>
            <circle cx="6.5" cy="12.5" r=".5"></circle>
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
        </svg>
    `,

    draw: {
        line(ctx, object) {
            ctx.save()

            ctx.lineCap = "round"

            ctx.shadowColor = "rgba(0, 0, 0, 0.12)"
            ctx.shadowBlur = 4
            ctx.shadowOffsetY = 1

            ctx.beginPath()

            ctx.moveTo(
                object.from.x,
                object.from.y
            )

            ctx.lineTo(
                object.to.x,
                object.to.y
            )

            ctx.lineWidth = object.width
            ctx.strokeStyle = "#999"
            ctx.stroke()

            ctx.restore()
        },

        node(ctx, object) {
            const pos = object.pos
            const size = object.size

            const width = size.width * object.scale
            const height = size.height * object.scale

            const x = pos.x - width / 2
            const y = pos.y - height / 2

            const radius = 10

            const fake = object.drawNode.layoutNode.original !== null

            ctx.save()

            ctx.shadowColor = "rgba(0, 0, 0, 0.14)"
            ctx.shadowBlur = object.hovered ? 16 : 8
            ctx.shadowOffsetY = object.hovered ? 4 : 2

            ctx.fillStyle = "#f8f8f8"

            ctx.beginPath()
            ctx.roundRect(x, y, width, height, radius)
            ctx.fill()

            ctx.shadowColor = "transparent"

            ctx.save()

            ctx.beginPath()
            ctx.roundRect(x, y, width, height, radius)
            ctx.clip()

            ctx.globalAlpha = object.hovered ? 1 : 0.92

            ctx.drawImage(
                object.image,
                x,
                y,
                width,
                height
            )

            ctx.restore()

            ctx.beginPath()
            ctx.roundRect(x, y, width, height, radius)

            ctx.lineWidth = 1
            ctx.strokeStyle = "rgba(0, 0, 0, 0.08)"

            if(fake) {
                ctx.setLineDash([4, 4])
            }

            ctx.stroke()
            ctx.setLineDash([])

            if(object.root) {
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
            }

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