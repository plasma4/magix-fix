import { Viewer, ThemeContainer } from "@painekillers/tree-builder-viewer"
import { Graph } from "@painekillers/tree-builder-core"

import getNodes from "./nodes.js"

import renderMenu from "./nodeMenu.js"

const themes = new ThemeContainer()

await themes.load("Dark")
await themes.load("Magix", new URL("./magixTheme.js", import.meta.url), new URL("./magixTheme.css", import.meta.url))

const viewer = new Viewer(
    document.getElementById("tree"),
    themes,
    renderMenu
)
viewer.recurse = null
viewer.strategy = "Outwards"

viewer.setTheme("Magix")

viewer.graph = new Graph(await getNodes())
console.log(JSON.stringify([...viewer.graph.nodes].map(([id, node]) => ({ id, parents: node.parents.map(n => n.id), children: node.children.map(n => n.id) })), null, 2))

viewer.setRoot("tribalism")
viewer.setSize(50, 50, 100, 50)
viewer.draw(1)

viewer.enable()

document.getElementById("loading-overlay").classList.add("hidden")
