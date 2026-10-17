// This script makes our nodes and stuff

import { Node } from "@painekillers/tree-builder-core"

const c1 = window.magixData.civ1Object
const c2 = window.magixData.civ2Object

function parseArray(arr, useReq = false) {
    let result = []

    for (const item of arr) { 
        if (item.req == null) {
            console.log("Missing req:", item)
        }

        result.push(
            new Node(
                item.name,
                useReq ? Object.keys(item.req ?? {}) : item.precededBy ?? [],
                [],
                {
                    full: item,
                    icon: null
                }
            )
        )
    }

    return result
}

export default function getNodes(civ = "civ1", useReq = false) {
    let nodes = []
    
    if (civ === "civ1") {
        nodes = [...parseArray(c1.techs, useReq), ...parseArray(c1.traits, useReq)]
    } else if (civ === "civ2") {
        nodes = [...parseArray(c2.techs, useReq), ...parseArray(c2.traits, useReq)]
    }

    return nodes
}