import { 
    World, 
    Camera,
    Bridge
 } from "@painekillers/tree-builder-core"

import SearchIndex from "./search.js"

import {
    Node,
    Graph
} from "@painekillers/tree-builder-core"

import Tooltip from "./tooltip.js"

import {
    ThemeContainer,
    ThemeApplier
} from "./theme.js"

export default class Viewer {
    #container
    #shadow
    #canvas
    #ui

    #theme

    #graph
    #world
    #bridge

    #observer

    #search
    #tooltip

    #uiUpdates

    #enabled = false

    recurse = true
    /*
    Null: No recursion
    False: Creates fake nodes when encountering recursion
    True: Connects back to existing instance of a node when recursing
    #: Real recursion to depths #
    */

    constructor(container, themes) {
        this.#container = container

        this.#shadow = this.#container.attachShadow({
            mode: "open"
        })

        this.#theme = new ThemeApplier(
            themes ?? new ThemeContainer(),
            this.#shadow
        )

        this.#canvas = document.createElement("canvas")
        this.#ui = document.createElement("div")
        this.#ui.id = "ui"

        // Init the world
        this.#world = new World(
            this.#canvas,
            this.#theme.current
        )

        const cam = new Camera(this.#world)

        this.#world.camera = cam

        // Resize observer
        this.#observer = new ResizeObserver(() => {
            this.#world.resize(
                this.#container.clientWidth,
                this.#container.clientHeight
            )
        })

        // Mouse interactions
        let hovered = null

        this.#canvas.addEventListener("mousemove", e => {
            if (this.#world.paused) return

            const pos = this.#world.mouseWorldPosition(e)
            const object = this.#world.objectAt(pos.x, pos.y)

            if (object === hovered) return

            hovered?.mouseLeave?.()

            hovered = object

            hovered?.mouseEnter?.()
        })

        this.#canvas.addEventListener("mousedown", e => {
            if (this.#world.paused) return

            const pos = this.#world.mouseWorldPosition(e)
            const object = this.#world.objectAt(pos.x, pos.y)

            if(object) {
                console.log("clicked node:", object.node.val)

                if(object.drawNode.layoutNode.original === null) {
                    this.nodeMenu(object.node)
                } else {
                    this.#bridge.focus(
                        object.drawNode.layoutNode.original.node
                    )
                }
            }
        })

        // Camera movements
        let dragging = false

        let lastX = 0
        let lastY = 0


        // Pan

        this.#canvas.addEventListener("mousedown", e => {
            if (e.button !== 0) return

            dragging = true

            lastX = e.clientX
            lastY = e.clientY
        })


        this.#canvas.addEventListener("mouseup", () => {
            dragging = false
        })


        this.#canvas.addEventListener("mouseleave", () => {
            dragging = false
        })


        this.#canvas.addEventListener("mousemove", e => {
            if (!dragging) return

            const dx = e.clientX - lastX
            const dy = e.clientY - lastY

            lastX = e.clientX
            lastY = e.clientY

            const pos = cam.pos

            cam.pos = [
                pos.x - dx / cam.zoom,
                pos.y - dy / cam.zoom
            ]
        })


        // Zoom toward mouse

        this.#canvas.addEventListener("wheel", e => {
            e.preventDefault()

            const rect = this.#canvas.getBoundingClientRect()

            const mouseX =
                e.clientX - rect.left - this.#canvas.width / 2

            const mouseY =
                e.clientY - rect.top - this.#canvas.height / 2

            const oldZoom = cam.zoom

            const pos = cam.pos

            // World position currently underneath mouse
            const worldX = pos.x + mouseX / oldZoom
            const worldY = pos.y + mouseY / oldZoom

            const zoomSpeed = 0.001

            let newZoom =
                oldZoom * (1 - e.deltaY * zoomSpeed)

            newZoom = Math.max(
                0.1,
                Math.min(newZoom, 5)
            )

            cam.zoom = newZoom

            // Keep the same world point underneath the mouse
            cam.pos = [
                worldX - mouseX / newZoom,
                worldY - mouseY / newZoom
            ]
        }, { passive: false })

        // Init the bridge
        this.#bridge = new Bridge(
            null,
            this.#world
        )

        // Init search index
        this.#search = new SearchIndex([])

        // Create UI
        const searchButton = document.createElement("button")
        searchButton.id = "search-button"
        searchButton.ariaLabel = "Search"

        const searchMenu = document.createElement("div")
        searchMenu.id = "search-menu"

        const searchHeader = document.createElement("div")
        searchHeader.className = "menu-header"

        const searchTitle = document.createElement("span")
        searchTitle.textContent = "Search"

        const searchMenuClose = document.createElement("button")
        searchMenuClose.id = "search-menu-close"
        searchMenuClose.textContent = "×"

        searchHeader.append(
            searchTitle,
            searchMenuClose
        )

        const searchInput = document.createElement("input")
        searchInput.id = "search-input"
        searchInput.type = "text"
        searchInput.placeholder = "Search nodes..."

        const searchResults = document.createElement("div")
        searchResults.id = "search-results"

        searchMenu.append(
            searchHeader,
            searchInput,
            searchResults
        )


        const themeButton = document.createElement("button")
        themeButton.id = "theme-button"

        const themeMenu = document.createElement("div")
        themeMenu.id = "theme-menu"

        const themeHeader = document.createElement("div")
        themeHeader.className = "menu-header"

        const themeTitle = document.createElement("span")
        themeTitle.textContent = "Theme"

        const themeMenuClose = document.createElement("button")
        themeMenuClose.id = "theme-menu-close"
        themeMenuClose.textContent = "×"

        themeHeader.append(
            themeTitle,
            themeMenuClose
        )

        const themeGrid = document.createElement("div")
        themeGrid.id = "theme-grid"

        themeMenu.append(
            themeHeader,
            themeGrid
        )


        const nodeMenu = document.createElement("div")
        nodeMenu.id = "node-menu"

        const nodeHeader = document.createElement("div")
        nodeHeader.className = "menu-header"

        const nodeMenuTitle = document.createElement("span")
        nodeMenuTitle.id = "node-menu-title"
        nodeMenuTitle.textContent = "Node"

        const nodeMenuClose = document.createElement("button")
        nodeMenuClose.id = "node-menu-close"
        nodeMenuClose.textContent = "×"

        nodeHeader.append(
            nodeMenuTitle,
            nodeMenuClose
        )

        const nodeMenuContent = document.createElement("div")
        nodeMenuContent.id = "node-menu-content"

        nodeMenu.append(
            nodeHeader,
            nodeMenuContent
        )


        this.#ui.append(
            searchButton,
            searchMenu,
            themeButton,
            themeMenu,
            nodeMenu
        )

        this.#shadow.append(
            this.#canvas,
            this.#ui
        )

        const menus = [
            searchMenu,
            themeMenu,
            nodeMenu
        ]

        function closeMenus() {
            for(const menu of menus) {
                menu.style.display = "none"
            }
        }

        function openMenu(menu) {
            closeMenus()
            menu.style.display = "block"
        }

        searchButton.addEventListener("click", () => {
            if(searchMenu.style.display === "block") {
                searchMenu.style.display = "none"
            } else {
                openMenu(searchMenu)
            }
        })

        themeButton.addEventListener("click", () => {
            if(themeMenu.style.display === "block") {
                themeMenu.style.display = "none"
            } else {
                openMenu(themeMenu)
            }
        })

        searchMenuClose.addEventListener("click", () => {
            searchMenu.style.display = "none"
        })

        themeMenuClose.addEventListener("click", () => {
            themeMenu.style.display = "none"
        })

        nodeMenuClose.addEventListener("click", () => {
            nodeMenu.style.display = "none"
        })

        const blank = new Image()
        blank.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="

        const previewGraph = new Graph([
            new Node("A", [], ["B", "C"], {icon: blank}),
            new Node("B", ["A"], [], {icon: blank}),
            new Node("C", ["A"], [], {icon: blank})
        ])

        const updateThemeMenu = () => {
            themeGrid.replaceChildren()

            const hidden =
                getComputedStyle(themeMenu).display === "none"

            if(hidden) {
                themeMenu.style.visibility = "hidden"
                themeMenu.style.display = "block"
            }

            for(const [name, theme] of Object.entries(
                this.#theme.container.themes
            )) {
                const entry = document.createElement("button")
                entry.className = "theme-entry"

                const preview = document.createElement("canvas")
                preview.className = "theme-preview"

                const label = document.createElement("div")
                label.className = "theme-name"
                label.textContent = name

                entry.append(
                    preview,
                    label
                )

                themeGrid.append(entry)

                const rect = preview.getBoundingClientRect()

                preview.width = rect.width
                preview.height = rect.height

                const world = new World(
                    preview,
                    theme
                )

                world.background = theme.background

                const camera = new Camera(world)

                world.camera = camera

                world.resize(
                    preview.width,
                    preview.height
                )

                const bridge = new Bridge(
                    previewGraph,
                    world
                )

                bridge.calculateLayout(
                    "A",
                    null
                )

                bridge.calculateDraw(
                    50,
                    50,
                    70,
                    50
                )

                bridge.createObjects(null)

                camera.zoom = 0.4
                camera.pos = [-40, 40]

                world.update()

                if(theme === this.#theme.current) {
                    entry.classList.add("selected")
                }

                entry.addEventListener("click", async () => {
                    await this.#theme.apply(name)

                    themeMenu.style.display = "none"
                })
            }

            if(hidden) {
                themeMenu.style.display = "none"
                themeMenu.style.visibility = ""
            }
        }

        const updateThemeButtons = () => {
            searchButton.innerHTML =
                this.#theme.current.searchButton

            themeButton.innerHTML =
                this.#theme.current.themeButton
        }

        const updateSearchResults = () => {
            const query = searchInput.value

            const results = query
                ? this.#search.search(query)
                : this.#search.entries.map(entry => ({
                    entry,
                    score: 1
                }))

            searchResults.replaceChildren()

            for(const result of results) {
                const entry = document.createElement("div")
                entry.className = "search-entry"

                const info = document.createElement("div")

                const name = document.createElement("div")
                name.className = "search-entry-name"
                name.textContent = result.entry.name

                info.append(name)

                if(
                    result.entry.name !==
                    result.entry.value.id
                ) {
                    const alias = document.createElement("div")
                    alias.className = "search-entry-alias"
                    alias.textContent =
                        `(alias of ${result.entry.value.id})`

                    info.append(alias)
                }

                const actions = document.createElement("div")
                actions.className = "search-entry-actions"

                const focus = document.createElement("button")
                focus.dataset.tooltip = "Focus"
                focus.innerHTML =
                    this.#theme.current.focusButton

                if(
                    !this.#bridge.toObj?.has(
                        result.entry.value
                    )
                ) {
                    focus.disabled = true
                }

                focus.addEventListener("click", () => {
                    this.#bridge.focus(
                        result.entry.value
                    )

                    searchMenu.style.display = "none"
                })

                const root = document.createElement("button")
                root.dataset.tooltip = "Set root"
                root.innerHTML =
                    this.#theme.current.rootButton

                root.addEventListener("click", () => {
                    this.#bridge.calculateLayout(
                        result.entry.value.id,
                        this.recurse
                    )

                    this.#bridge.calculateDraw(
                        50,
                        50,
                        100,
                        50
                    )

                    this.#bridge.createObjects(
                        this.depth
                    )

                    searchMenu.style.display = "none"

                    updateSearchResults()
                })

                actions.append(
                    focus,
                    root
                )

                entry.append(
                    info,
                    actions
                )

                searchResults.append(entry)
            }
        }

        this.nodeMenu = node => {
            nodeMenuTitle.textContent = node.id
            nodeMenuContent.replaceChildren()

            openMenu(nodeMenu)
        }

        this.#theme.subscribe(() => {
            this.#world.theme =
                this.#theme.current

            this.#world.background =
                this.#theme.current.background

            this.#world.update()
        })

        this.#world.background = this.#theme.current.background

        this.#theme.subscribe(updateSearchResults)
        this.#theme.subscribe(updateThemeMenu)
        this.#theme.subscribe(updateThemeButtons)

        searchInput.addEventListener(
            "input",
            updateSearchResults
        )

        updateThemeButtons()
        updateThemeMenu()
        updateSearchResults()

        this.#uiUpdates = {
            updateThemeButtons,
            updateThemeMenu,
            updateSearchResults
        }

        // Init tooltip
        this.tooltip = {
            offset: 12,
            duration: 120
        }
    }

    get graph() {
        return this.#graph
    }

    set graph(graph) {
        this.#graph = graph
        this.#bridge.graph = graph

        this.#search.entries =
            Array.from(graph?.nodes.values()).map(node => ({
                name: node.id,
                value: node
            }))

        this.updateUi()

    }

    set tooltip({
        offset = 8,
        duration = 120
    } = {}) {
        if(this.#tooltip) {
            this.#tooltip.offset = offset
            this.#tooltip.duration = duration
            return
        }

        this.#tooltip = new Tooltip(
            this.#ui,
            {
                offset: offset,
                duration: duration
            }
        )
    }

    updateUi() {
        Object.values(this.#uiUpdates).forEach(callback => callback())
    }

    setRoot(root) {
        if(!this.#graph) {
            console.warn(
                "Graph must be set before drawing"
            )

            return
        }

        this.#bridge.calculateLayout(
            root,
            this.recurse
        )
    }

    setSize(w, h, px, py) {
        if(!this.#bridge.root) {
            console.warn(
                "Root must be set before setting size"
            )

            return
        }

        this.#bridge.calculateDraw(
            w ?? 50,
            h ?? 50,
            px ?? 100,
            py ?? 50
        )
    }

    draw(maxDepth) {
        if(!this.#bridge.draw) {
            console.warn(
                "SetSize must be called first"
            )

            return
        }

        this.depth = maxDepth

        this.#bridge.createObjects(
            maxDepth ?? null
        )

        this.updateUi()
    }

    enable() {
        if(this.#enabled) return

        if(!this.#graph) {
            console.warn(
                "Graph must be set before enabling the viewer"
            )

            return
        }

        this.#enabled = true

        this.#world.resize(
            this.#container.clientWidth,
            this.#container.clientHeight
        )

        this.#observer.observe(
            this.#container
        )
    }

    disable() {
        if(!this.#enabled) return

        this.#enabled = false

        this.#observer.unobserve(
            this.#container
        )

        this.#tooltip?.hide()
    }
}