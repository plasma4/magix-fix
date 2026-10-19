import { Viewer, ThemeContainer } from "@painekillers/tree-builder-viewer"
import { Graph } from "@painekillers/tree-builder-core"

import getNodes from "./nodes.js"

const themes = new ThemeContainer()

await themes.load("Dark")

const viewer = new Viewer(
    document.getElementById("tree"),
    themes
)
viewer.recurse = null
viewer.strategy = "Outwards"

viewer.graph = new Graph(getNodes())
console.log(JSON.stringify([...viewer.graph.nodes].map(([id, node]) => ({ id, parents: node.parents.map(n => n.id), children: node.children.map(n => n.id) })), null, 2))

viewer.setRoot("tribalism")
viewer.setSize(50, 50, 100, 50)
viewer.draw()

viewer.enable()