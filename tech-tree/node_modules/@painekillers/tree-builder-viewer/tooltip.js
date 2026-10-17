export default class Tooltip {
    #target = null
    #duration

    constructor(
        container,
        {
            offset = 8,
            duration = 120
        } = {}
    ) {
        this.offset = offset
        this.#duration = duration

        this.element = document.createElement("div")
        this.element.id = "tooltip"

        this.element.style.transitionDuration =
            `${duration}ms`

        document.body.append(this.element)

        container.addEventListener("mouseover", e => {
            const target = e.target.closest("[data-tooltip]")

            if(!target) return

            this.show(target.dataset.tooltip, target)
        })

        container.addEventListener("mouseout", e => {
            const target = e.target.closest("[data-tooltip]")

            if(target !== this.#target) return

            this.hide()
        })

        new MutationObserver(() => {
            if(
                this.#target &&
                !container.contains(this.#target)
            ) {
                this.hide()
            }
        }).observe(container, {
            childList: true,
            subtree: true
        })
    }

    set duration(value) {
        this.#duration = value
        this.element.style.transitionDuration =
            `${value}ms`
    }

    show(text, target) {
        this.#target = target

        this.element.textContent = text

        const rect = target.getBoundingClientRect()

        this.element.style.left =
            rect.left + rect.width / 2 + "px"

        this.element.style.top =
            rect.top - this.offset + "px"

        this.element.classList.add("visible")
    }

    hide() {
        this.#target = null
        this.element.classList.remove("visible")
    }
}