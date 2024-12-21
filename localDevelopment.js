// THIS VARIABLE IS FOR LOCALLY MODIFYING MAGIX AND SHOULD NOT BE CHANGED WHEN PLAYING NORMALLY OR WHEN CHANGING YOUR OWN MOD.
// If you wish to force Magix to use your local files (magix.js and magixUtils.js), set the value below to true. This is not advised because normally, the game will automatically use the newest version when possible and use your browser's local storage to keep an offline copy of the scripts. You should only use this if you are trying to test modifications of Magix! (Should you be modifying data.js or importing OTHER local files, you don't need to do this.)

var offlineMode = false


// IMPORTANT: Settting this value to true will PREVENT FILES FROM WORKING WHEN YOU ARE OFFLINE (if you are getting a message about XML requests, they won't work offline anyway, so feel free to enable this).
// Set the variable below to true to activate direct access mode. Direct access mode will skip using XMLHttpRequests and directly try to load the mod by importing the script (this may break some programs and is ONLY advised if there is a message in console about XML requests or localStorage is causing issues somehow).

var directAccessMode = false


// This file is loaded before main.js and after style.css, so, if you wish, you can modify various values in this script.
/*
In order to make files work offline, the NEL Toolkit automatically uses XMLHttpRequests to get script data and stores that into localStorage. The first mod will be stored in "nelOffline0", the second in "nelOffline1", and so on. So, for example, a script stored into localStorage might look like this:

https://the.modLinkGoesHere/script.js
function testFunction() {
    alert("Test script")
}
testFunction()
*/

// The function below is for extracting data out of various properties within the game. You can run it in the console if you wish to get a rather large JSON-safe string or object containing some raw data about the game.
// For some mods like Magix, there may be several possible JSON files generated because of different civs/races in the gameplay. You'll have to get the data separately, however.
// To make sure that data doesn't have any weird issues, you may want to wipe the save before trying to get this data!


// Tip: in order to minimize RNG changing exported data, add the code below after the seedrandom function script (around line 270)
// Math.seedrandom=function(){Math.random=function(){return 0}}
function getGameJSON(objectMode) {
    var result = {
        achievements: extractObject(G.achiev, ["name", "displayName", "desc", "tier", "visible", "icon", "wideIcon", "civ", "special", "plural"]),
        lands: extractObject(G.land, ["name", "displayName", "desc", "names", "goods", "icon", "image", "ocean", "score"]),
        goods: extractObject(G.goods, ["name", "displayName", "desc", "res", "icon", "mult"]),
        resources: extractObject(G.res, ["name", "displayName", "hidden", "desc", "category", "startWith", "colorGood", "colorBad", "icon", "fractional", "turnToByContext", "meta", "partOf"], ["tick", "getDisplayAmount", "getIcon", "whenGathered"]),
        units: extractObject(G.unit, ["name", "displayName", "desc", "wonder", "icon", "wideIcon", "threexthreeIcon", "startWith", "cost", "costPerStep", "steps", "type", "messageOnStart", "finalStepCost", "finalStepDesc", "use", "req", "category", "modes", "gizmos", "limitPer", "upkeep"], ["tick"]),
        policies: extractObject(G.policy, ["name", "displayName", "desc", "icon", "startMode", "req", "modes", "category"]),
        techs: extractObject(G.tech, ["name", "displayName", "desc", "icon", "type", "cost", "category", "startWith", "tier", "chance", "req", "tutorialMesg"]),
        traits: extractObject(G.trait, ["name", "displayName", "desc", "icon", "type", "cost", "category", "startWith", "tier", "chance", "req"]),
        descriptions: {
            name: "The identifier name of the thing",
            displayName: "The displayed name of the thing, which will be used instead of the identifier name",
            type: "The type of item that the thing was",
            tier: "The tier of the thing",
            visible: "Determines if the thing is visible by default",
            icon: "What icons to use and with multiple options and custom sprite sheet options",
            civ: "The civilization type for the achievement",
            special: "A special category that the achievement fits into",
            plural: "Determines if an achievement states how many times it has been achieved",
            names: "The names of the type of land that could be used",
            goods: "The goods that can be found in this land",
            res: "What resources can be harvested from those goods",
            mult: "The harvesting multiplier for a specific good",
            image: "The image to use for the land",
            ocean: "Determines if the land is ocean",
            score: "The score for the land. A higher score means that it is more suitable for living",
            desc: "The description for the thing",
            hidden: "If the thing is hidden by default",
            category: "What category the thing fits in",
            startWith: "How many of that thing you start with",
            colorGood: "The color to use when you hover over the resource and text appears showing you how you gained a certain amount of it and how much of it you earned. Defaults to #888888 if not defined",
            colorBad: "The color to use when you hover over the resource and text appears showing you how you lost a certain amount of it and how much of it you lost. Defaults to #888888 if not defined",
            fractional: "Determines if when gaining or losing the resource, the amount gained or lost is not randomly rounded using the randomFloor function",
            turnToByContext: "What happens when this resource is consumed",
            meta: "If this resource contains other resources within",
            partOf: "What this resource is considered a part of, not the category displayed",
            tick: "What happens when a tick occurs; is a function",
            getDisplayAmount: "Gets how the resource is displayed; is a function",
            getIcon: "Gets how the thing is displayed; is a function",
            whenGathered: "What to do when the resource is gathered",
            subRes: "The subresources of a specific resource, if it exists",
            wonder: "The identifier of the achievment to gain upon completing the wonder if the unit is a wonder",
            wideIcon: "The wide icon for a wonder",
            threexthreeIcon: "The large three-by-three icon of a seasonal wonder",
            cost: "How much the thing costs to get",
            costPerStep: "How much each step of the wonder will cost",
            steps: "The number of steps for the wonder",
            messageOnStart: "The message to write upon starting to build the wonder",
            finalStepCost: "The cost of the final step of the wonder",
            finalStepDesc: "The message to write upon needing to complete the final step of the wonder",
            use: "How much this thing uses",
            req: "The requirements to unlock this thing",
            modes: "The modes that can be used for this thing",
            gizmos: "Determines if gizmos are shown",
            limitPer: "The limit for a specific item",
            upkeep: "The amount of upkeep that the unit requires",
            startMode: "The starting mode of the thing",
            effectsOff: "What to do when the policy is disabled",
            effects: "Various effects. Some effects may be functions or require specific contexts",
            tutorialMesg: "The message to write upon getting the technology",
            chance: "The chance of the trait or technology being selected",
            id: "The ID value of the thing",
            mod: "The link of the mod that was used to create the thing",
            precededBy: "What the thing requires to obtain",
            leadsTo: "What the thing leads to when obtained"
        },
        sheets: G.sheets
    }
    var str = JSON.stringify(result).replace(/<b>(0|-[0-9])<\/b> runs\/legacies/g, "<b>7</b> runs/legacies") // Replace this part of the data because it's a seasonal text thing that doesn't update properly
    return objectMode ? JSON.parse(str) : str
}

// Extracts the object data of a specific item (like G.res, G.unit, and so on)
// NOTE: This will preserve some object references, so modifying values here may cause issues!
function extractObject(toExtract, properties, funcProperties) {
    var nameProps = ["subRes", "precededBy", "leadsTo"]
    if (funcProperties == null) {
        funcProperties = []
    }
    if (nameProps == null) {
        nameProps = []
    }
    var props = properties.concat(funcProperties, nameProps, ["effects", "effectsOff"])
    var len = toExtract.length
    var data = Array(len)
    for (var i = 0; i < len; i++) {
        var item = toExtract[i]
        var obj = {}
        for (var t = 0; t < props.length; t++) {
            var key = props[t]
            var thing = item[key]
            if (thing != null && thing.length !== 0) {
                if (nameProps.includes(key)) {
                    var l = thing.length
                    var iResult = Array(l)
                    for (var e = 0; e < l; e++) {
                        iResult[e] = thing[e].name
                    }
                    obj[key] = iResult
                } else if (key === "effects" || key === "effectsOff") {
                    var l = thing.length
                    var effects = JSON.parse(JSON.stringify(thing)) // Not the best way, but it gets the job done
                    for (var e = 0; e < l; e++) {
                        var effect = effects[e]
                        if (effect.type === "function") {
                            effect.func = String(effect.func)
                        }
                    }
                    obj[key] = effects
                } else if (funcProperties.includes(key)) {
                    obj[key] = String(thing)
                } else {
                    obj[key] = thing
                }
            }
        }
        obj.type = item.type
        if (item.mod) obj.mod = item.mod.url
        if (item.skip) obj.skip = true
        obj.id = item.id
        data[i] = obj
    }
    return data
}

// Returns an object where the keys are the raw names of the resources and the values are the display names.
function getDictionaryObject() {
    var resObj = {}
    var keys = Object.keys(G.dict)
    for (var i = 0; i < keys.length; i++) {
        resObj[G.dict[keys[i]].name] = G.dict[keys[i]].displayName
    }
    return resObj
}

/* Want help making your own mod? You can use the magix-wiki.html file to create a basic mod. */