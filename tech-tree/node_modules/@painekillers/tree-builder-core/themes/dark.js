export default {
    background: Object.assign(new Image(),
        {
            src: "data:image/svg+xml," + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path
                                d="M 40 0 L 0 0 0 40"
                                fill="none"
                                stroke="#3f4147"
                                stroke-width="1"
                                opacity="0.35"
                            />
                        </pattern>
                    </defs>

                    <rect
                        width="1920"
                        height="1080"
                        fill="#111112"
                    />

                    <rect
                        width="1920"
                        height="1080"
                        fill="url(#grid)"
                    />
                </svg>
            `)
        }
    ),

    draw: {
        line(ctx, object) {
            ctx.save()

            ctx.lineCap = "round"

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
            ctx.strokeStyle = "#4b4d52"
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

            ctx.shadowColor = "rgba(0, 0, 0, 0.35)"
            ctx.shadowBlur = object.hovered ? 14 : 7
            ctx.shadowOffsetY = object.hovered ? 3 : 2

            ctx.fillStyle = "#2b2d31"

            ctx.beginPath()
            ctx.roundRect(
                x,
                y,
                width,
                height,
                radius
            )
            ctx.fill()

            ctx.shadowColor = "transparent"

            ctx.save()

            ctx.beginPath()
            ctx.roundRect(
                x,
                y,
                width,
                height,
                radius
            )
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
            ctx.roundRect(
                x,
                y,
                width,
                height,
                radius
            )

            ctx.lineWidth = 1
            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"

            if(fake) {
                ctx.setLineDash([4, 4])
            }

            ctx.stroke()
            ctx.setLineDash([])

            if (object.root) {
                ctx.beginPath()

                ctx.arc(
                    x + width - 9,
                    y + 9,
                    3,
                    0,
                    Math.PI * 2
                )

                ctx.fillStyle = "rgba(255, 255, 255, 0.35)"
                ctx.fill()
            }

            ctx.restore()
        }
    }
}