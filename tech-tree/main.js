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

viewer.graph = new Graph(getNodes())
console.log(viewer.graph)

viewer.setRoot("tribalism")
viewer.setSize(50, 50, 100, 50)
viewer.draw(1)

viewer.enable()