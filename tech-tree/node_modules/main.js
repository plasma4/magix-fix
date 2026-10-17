import { Viewer, ThemeContainer } from "@painekillers/tree-builder-viewer"
import { Graph } from "@painekillers/tree-builder-core"

import nodes from "./nodes.js"

const themes = new ThemeContainer()

await themes.load("Dark")

const viewer = new Viewer(
    document.getElementById("tree"),
    themes
)

viewer.graph = new Graph(nodes)

viewer.setRoot("A")
viewer.setSize(50, 50, 100, 50)
viewer.draw()

viewer.enable()