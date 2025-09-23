# NEL Documentation and Modding Guide
NeverEnding Legacy is a civ building game but its code is a mess. Maybe not as much as Cookie Clicker but it's pretty cobbled together. The goal of this document is to provide a better explanation of basics and tips to minimize your time wasted (or if you're rather curious, I suppose.)

Have any questions? DM me on Discord (@1_e0) or preferably join the [Dashnet server](https://discord.gg/cookie); it's a great community. I would also suggest using [Magix Wiki](https://plasma4.github.io/magix-fix/magix-wiki.html) to explore values easier :)

Want to add a mod URL to the end of an already existing game? [It's not that hard actually.](https://github.com/plasma4/magix-extras?tab=readme-ov-file#injecting-a-mod-without-wiping-the-save) If you want to work with mods locally (or offline), this repo is actually a great way to do that, even if you don't want to deal with Magix, as you can still use custom mods and choose files.

Orteil also made some basic debugging tools. You can run `G.Cheat()` in order to enable them! (Or `G.RuinTheFun()`, or `G.Debug()`, because why not I suppose.) There are also additional debug variables in a few functions like `G.renderMap()`.

## Basics
Do note, this is an non-exhaustive list and when in doubt, you should check the code!

- `G.getDict(name: String)` gets a property. You can store a property in a variable, which we will call `prop` here. Possible property types are `achiev`, `land`, `goods`, `res`, `unit`, `policy`, `tech`, `trait` and you can access a unit property, for example, with `G.getUnit("gatherer")`.
- `prop.name` gets a property name. Before we continue, note that the game stores properties on an ID system. This means that deletion of a property will cause the reordering of all properties before it which might case issues, so be careful! (All property types have separate IDs **except for `trait` and `tech`**, which are unified, check Additional info for why.)
- You can also access other properties like `prop.displayName`. (See how to *create* an property in the Basic mod structure section.)
- About `unit` properties, they are weird. If you want to actually access info about the owned unit then you have to use `var u = G.unitsOwned[G.unitsOwnedNames.indexOf('scout')]`. (`u` would be undefined here if scouts aren't visible in the Production tab.) Then you can access specific properties like `u.targetAmount`.
- Also, you may want to consider using `eval()` or `Function()` to replace function contents. Depending on if you need mod support you may need to be specific about your replacement. If necessary you may need to modify base functions for custom features, or it's the easiest way to do something. Unfortunately Magix is super rude and doesn't play very politely, so you might be in for some more trouble if you want to support both Magix and base game. If you're trying to develop something alongside `magix-fix` then it's suggested to check the `magixLoaded` and you almost certainly want your mod to load AFTER.
- Code executed at launch is located in `G.Launch()`. `G.Launch()` then calls `G.Init()` once image resources are done loading.
- `l(what: String)`: Gets the HTML element with ID `what`.
- `choose(arr: object[])`/`shuffle(arr: object[])`: Chooses a random item in the array; shuffles items in the array.
- `res.tick`: Function to run during a tick (resources and units).
- `item.icon`: Icon for an item, like `[2, 3, "magix2"]`. You can find the sheets in the `sheets` property of `G.AddData`. The coordinates are 0-indexed; sprites are meant to be 24x24 pixels and put into a sprite sheet, and the game also has some internal sheets loaded by default. Icons can stack, too! (Magix Wiki can help visualize this stacking.)
- `G.gain(what: String, amount: number, context: String)`/`G.lose(what,amount,context)`: Gain or lose a certain amount of an item (`what`). The `context` value is used to display to the user info when hovering over a resource (so they might see "-6.0 from eating" when hovering over the herbs resource). Note that it is safe to plug in negative values to either function.
- `G.has(what: String)`: Determines if you have a knowledge of something. Knowledge would be your techs and traits.
- `G.checkReq(req: object)`: The universal function for checking requirements. It's more powerful than `G.has()` because it can check for more details (like `{'wisdom rituals':'on'}`) and multiple conditions at once since it is an object. It returns `true` only if all conditions in the `req` object are met. (Note that unit modes can have their own `req` values as well.)
- `G.testCost(costs: object, mult: number)`/`G.doCost(costs: object, mult: number)`: `testCost` returns `true` or `false` if you can afford the items in `costs`, while `doCost` actually subtracts them. Used for purchases.
- `G.checkPolicy(name: String)`: Same as `.has` but for policies. Set a policy using `G.setPolicyModeByName(me: String, mode: String)`.
- `randomFloor(x: number)`: `if ((x%1)<Math.random()) return Math.floor(x); else return Math.ceil(x);`. Basically, rounding down is more likely if the fractional part of x is less than 0.5 and more likely to round up if greater than 0.5.
- `G.getSetting(name: String)`/`G.setSetting(name: String)`: Gets or sets a setting. (An example setting name is `debug`.)
- `G.Message(obj: {type?: String, text?: String, icon?: [number, number, string?], ...})` Simply sends a message to the right panel. Various other options exist.
- `G.resets`: Number of times reset. Increments when ascending, not when starting a "New game" from settings.
- `G.tick`/`G.day`/`G.year`: ticks (increments once per new day, doesn't reset on year change); days (resets to 0 if `G.day>300` and increments `G.year`); years.
- `G.fps`: frame rate.
- `G.logic`: an array of various logic functions.
- There's also `G.update` and `G.draw` which are also an array of functions, and `G.funcs` for misc functions. (`G.funcs['create map']`, for example, creates a random map with biomes, while `G.update['unit']()` updates the production tab.)
- `G.Logic()`: Runs every game tick (different from `G.logic`, an array). This is where all game state changes should happen (resource decay, unit production, random events). Your custom tick functions on resources and units are called from here.
- `G.saveTo`: Where to save in `localStorage`. (Do note that saving does have a chance to fail if there isn't enough storage left or the total stored data is too much!)
- `ERROR(what: object)`: Logs the error in `what` and uses `console.trace()`.
Note that if you need more details on how these functions work you can probably find them in `main.js` (or `magixUtils.js`). This isn't an exhaustive list either; search stuff within the code when you need it!
- `G.stabilizeResize()`: Custom code to handle resizing. Magix attempts to improve upon this significantly for mobile support.
- `G.dialogue.popup(func: string, classes: string, from)` This is the function for creating pop-ups (like the settings or legacy menus). `func` takes in HTML (and this is especially useful with buttons). Buttons can be added to HTML with `G.button` (which takes in an object with many arguments), and inputs/textareas can be added with `G.field`/`G.textarea`.
- `G.widget.popup(obj: object)` This creates the small pop-up menus that appear when you click and hold a "gizmo" button (like the unit mode selector).
- `unitGetsConverted(...)` This is a special kind of function found in data.js (and modified in magixUtils.js) called a "function factory." It doesn't perform an action itself; instead, it returns a new function that does. It has many uses in effects, such as for workers being wounded/killed, and can have a custom message.
- `G.ChooseBox` creates the reroll options for technologies. Both the base game `data.js` file and `magix.js` only use one `ChooseBox`, and are made with `new G.ChooseBox` so check that if you wish to modify something.

## Digging on your own
This document unfortunately can't explain every single little detail about the game. If you're trying to understand something, perhaps look for examples in the code and try to get a function call stack with `console.trace()`! (Or you could just ask me on Discord if you're super stuck.)

## Effects
Effects can be found from `item.effect`. (Find code for how effects function in `G.fullApplyUnitEffects` in `main.js` or `magixUtils.js`.)

Effects can be added during runtime, just like other properties such as `icon` or `req` (meaning requirements):
```js
G.gain("insight", G.achievByName['insight-ly'].won > 1 ? 8 : 6);
G.unitByName['dreamer'].effects.push({ type: 'mult', value: 1.06 }); // Added effect here
```

Or can simply be set up within a unit, policy, tech, or trait:
```js
new G.Unit({
    name: 'gatherer',
    startWith: 4,
    desc: "...",
    icon: [0, 2],
    cost: {},
    use: { 'worker': 1 },
    //upkeep:{'food':0.2},
    //alternateUpkeep:{'food':'spoiled food'}, (This part in parens isn't in the original code, but I would like to point out that Orteil never implemented this. What a legend)
    effects: [
        { type: 'gather', context: 'gather', amount: 2, max: 4 }, // Gather something within the harvesting context of 'gather' (explained later), 
        { type: 'gather', context: 'hunt', amount: 0.1, max: 0.2, chance: 0.1, req: { 'carcass-looting': true } }, // In the 'hunt' context with a smaller chance and a requirement
        ...
    ]
    req: { 'tribalism': true, 't4': false },
    category: 'production',
    priority: 10,
})
```
You can have a function effect:
```js
effects: [
    {
        type: 'function', func: function () {
            G.getDict('harvest rituals for flowers').desc = 'Improves the speed of [florist]s by 20%. Consumes 2 [faith II] and 1 [influence II] over the course of 400 days; will stop if you run out.';
            ...
        }
    }
    ...
],
```

At this point, you might have picked up on the fact that units have a lot more properties to them than just effects. Indeed, policies and units can have modes (units in particular require `gizmos` to be true):
```js
new G.Unit({
    name: 'quarry',
    desc: '@carves [cut stone] out of the ground@may find various other minerals such as [limestone] and [marble]<>The [quarry] dismantles the ground we stand on so that our children may reach higher heights.',
    icon: [22, 3],
    cost: { 'archaic building materials': 100 },
    use: { 'land': 4 },
    modes: {
        'off': G.MODE_OFF,
        'quarry': { name: 'Quarry stone', icon: [0, 8], desc: 'Produce [cut stone] and other minerals.', use: { 'worker': 3, 'stone tools': 3 } },
        'advanced quarry': { name: 'Advanced quarry stone', icon: [8, 12, 0, 8], desc: 'Produce [cut stone] and other minerals at a superior rate with metal tools.', use: { 'worker': 3, 'metal tools': 3 } },
        'quarryotherstones': { name: 'Quarry other stones', icon: [3, 12, 'magixmod'], desc: 'Strike the Earth for [various cut stones] rather than normal [cut stone].', req: { 'quarrying II': true }, use: { 'worker': 3, 'metal tools': 3 } },
        'quarrydeepores': { name: 'Quarry deep for minerals', icon: [8, 12, 33, 30, 'magixmod'], desc: 'Quarry for resources that require quarrying deep underground. In this mode you will gather three times more ores but six times less of non-ore materials.', req: { 'prospecting III': true }, use: { 'worker': 8, 'metal tools': 8 } },
    },
    effects: [
        { type: 'gather', context: 'quarry', amount: 5, max: 10, every: 3, mode: 'quarry' },
        { type: 'gather', context: 'quarry', what: { 'cut stone': 1 }, max: 5, notMode: 'off' },
        { type: 'gather', context: 'mine', amount: 0.005, max: 0.05, notMode: 'off' },
        { type: 'gather', context: 'quarry', amount: 10, max: 30, every: 3, mode: 'advanced quarry' },
        { type: 'gather', context: 'quarry', what: { 'various cut stones': 5 }, mode: 'quarryotherstones' },
        { type: 'gather', context: 'quarry', what: { 'oil': 8 }, req: { 'oil-digging': true }, every: 2 },
        //deepquarry
        { type: 'gather', context: 'quarry', what: { 'cut stone': 0.17 }, max: 0.88, mode: 'quarrydeepores' },
        { type: 'gather', context: 'quarry', what: { 'various cut stones': 0.17 }, max: 0.88, mode: 'quarrydeepores' },
        { type: 'gather', context: 'quarry', what: { 'lead ore': 10 }, max: 30, mode: 'quarrydeepores' },
        { type: 'gather', context: 'quarry', what: { 'blackium ore': 10 }, max: 30, mode: 'quarrydeepores' },
        { type: 'gather', context: 'quarry', what: { 'mythril ore': 10 }, max: 30, mode: 'quarrydeepores' },
        { type: 'gather', context: 'quarry', what: { 'unknownium ore': 10 }, max: 30, mode: 'quarrydeepores' },
        { type: 'gather', context: 'quarry', what: { 'salt': 1 }, max: 3, mode: 'quarrydeepores', chance: 1 / 6 },
        /////
        { type: 'mult', value: 1.1, req: { 'quarrying III': true } },
        { type: 'function', func: unitGetsConverted({ 'wounded': 1 }, 0.001, 0.01, true, '[X] [people].', 'quarry collapsed, wounding its workers', 'quarries collapsed, wounding their workers'), chance: 1 / 50, req: { 'quarrying IV': false } },
        { type: 'function', func: unitGetsConverted({ 'wounded': 1 }, 0.00075, 0.0075, true, '[X] [people].', 'quarry collapsed, wounding its workers', 'quarries collapsed, wounding their workers'), chance: 1 / 250, req: { 'quarrying IV': true } }
    ],
    gizmos: true,
    req: { 'quarrying': true, 't10': false },
    category: 'production',
});
```
and this should give you some basics into how to use effects. Look for some examples in the code if you need! A few more things about units first:
- Units have categories they are split into, and might use resources
- When you add/remove resources you're actually adding or subtracting from a queue, which handles using or return resources.

Except, this doesn't explain where the gather or hunt context actually come from, does it? That's where territory comes in.

## Territory basics
(See the section on terrain generation below; this just discusses what territories have.)

What is a world without land (`G.Land`) and stuff inside (`G.Goods`)? See `main.js`:
```js
/*=====================================================================================
WORLD MAPS & TILES
    Games take place across several maps; the player and other civs start on an earthly world map, but technology may take them to space and other planets.
    A map has a type, width and height. Maps are composed of [width*height] tiles.
    Tiles in maps are recreated from scratch based on the seed every time the game is loaded.
    Each tile remembers its owner, exploration level and effects, however.
    Goods on each tile (.goods) are recomputed on each game load and do not take the tile's effects or exploration level into account.
    Each map stores its computed resources for the player by harvesting context (ie. ["hunt">{"meat":3,"bone":1}] and so on). These are recalculated every few seconds, or whenever a new tile is obtained.
    Note : tiles are stored columns-first simply because tile[x][y] feels more natural to write
=======================================================================================*/
```

Here are some examples:
```js
new G.Land({
    name: 'prairie', // Internal names
    names: ['Prairie', 'Grassland', 'Plain', 'Steppe', 'Meadow'], // Possible display names
    goods: [
        { type: ['oakloo', 'burchinn'], chance: 1, min: 0.1, max: 0.2 }, // 100% chance to have this good in between 0.1 and 0.2.
        { type: ['oakloo', 'burchinn'], chance: 0.5, min: 0.1, max: 0.4 },
        { type: ['berry bush', 'wild bush'], chance: 0.9 },
        { type: 'grass', amount: 2 }, // Look, it's grass!
        { type: ['wild bunnittias', 'firestoats'], chance: 0.9 },
        { type: ['furoxes'], chance: 0.5, amount: 0.5 },
        { type: ['wolvoes', 'bears'], chance: 0.2, amount: 0.5 },
        { type: ['vfb1', 'vfb4', 'vfb5'], chance: 0.6, min: 0.2, max: 0.45 },
        { type: ['mosseer'], chance: 0.2, amount: 0.2 },
        { type: 'wild bugs' },
        { type: 'freshwater fish', chance: 0.8, min: 0.1, max: 0.5 },
        { type: 'freshwater', amount: 1 },
        { type: ['lush rocky substrate', 'rocky substrate'] },
    ],
    modifiers: { 'river': 0.4, 'volcano': 0.2, },
    image: 42,
    score: 10,
});
...
new G.Goods({
    name: 'grass',
    desc: '[grass] will sometimes hide [fruit]s and [stick]s that can be found by foraging.',
    icon: [10, 10],
    res: {
        'gather': { 'fruit': 0.5, 'stick': 0.5 }, // Grass is a possible good from prairies that has fruits and sticks.
    },
    mult: 10,
});
```
In the code, `main.js` says that "Goods usually have bindings to harvesting contexts, such as 'provides 3 stones when gathered, 6 stones when dug, and 10 stones and 1 ore when mined'" which should clarify things!
Then, how much you can get of a certain resource is determined by `G.currentMap.computedPlayerRes` which is calculated from `G.computeOwnedRes`. `computedPlayerRes` is then used in gathering but each worker may be capped at getting a certain `max`, such as with gatherers:
```js
{ type: 'gather', context: 'gather', amount: 2, max: 4 }
```
Do keep in mind that units (excluding wonders) are affected by the production multiplier in terms of gathering:
```js
var amount=G.applyUnitAmountEffects(me);//modify the effective amount
if (amount>0)
{
    //apply effects every tick
    var repeat=randomFloor(mult);
    if (repeat>0)
    {
        for (var ii=0;ii<repeat;ii++)
        {
            G.applyUnitEffects(me,amount);
        }
    }
}
```
(The production multiplier is non-intuitive. See the Additional info section for more about that. Also, units have `priority`; each tick, the game executes the logic for all units and units with a higher priority value are executed and built first.)

## Terrain generation
From `main.js`:
```js
/*
    the format for terrain.png is (from top to bottom) :
        -colors - the map will pick 4 colors at random from this square to draw the tile
        -heightmap 1 - will be drawn on the tile in overlay mode; must be black and white, have values centered around pure gray, and have transparent edges
        -color detail 1 - colors will be drawn over the heightmap in hard-light mode; should also have transparent edges
        -heightmap 2 - a possible variation
        -color detail 2 - a possible variation
    furthermore, the leftmost 2 columns are reserved for land chunks (drawn together in lighten mode)
*/
```

As you can see, lands contain certain goods inside, and goods have specific resources. (Note: some `Goods` have an `affectedBy` property but this is an unused feature, so it is safe to ignore.)

The image below is of the base game's terrain image:
![Terrain image](img/terrain.png)
Each 32x32 block corresponds to a biome (such as prairie, forest, desert). (Note that this resolution is different from icons, which are 24x24.) The code doesn't use the whole block, but rather picks random individual pixels from it to create a noisy color base, which is later blurred into a smooth gradient. Grayscale rows (2 and 4) contain textures to add physical texture, and color detail rows (3 and 5) add variations to textures. Additionally, `blot.png` creates a natural effect of unexplored territory.


## Example code
Knowledge (techs and traits) are fairly simple so they don't get their own dedicated section. Here is an example though:
```js
new G.Trait({
    name: 'at1',
    displayName: 'Ancestors trait #1 Authority in churches',
    desc: '@[church,Churches] and [cathedral]s have a small chance to generate [influence]. Every 3 [church,Churches] and [cathedral]s increase the annual influence bonus by 1. In addition, getting this trait provides 25 [authority].',
    icon: [16, 34, 'magixmod', 22, 1], // Look, icons can stack! The Magix Wiki has icon layout info for a more visual explanation; just click on an image of something.
    cost: {}, // For techs, this is the resources it costs to purchase that tech. For traits this is a minimum requirement of resources for it to be possible to obtain that trait.
    chance: 250, // Odds for something to happen. For traits, lower values are more likely, while for techs, higher values increase the probability of seeing that technology. For traits the odds of getting that trait is 1 / (chance * 300) per day.
    effects: [
        { type: 'provide res', what: { 'authority': 25 } }, // One time resource gain
    ],
    req: { 'the ancestors call': true, '7th essence': true, 'roots of insight': true, 'at5': false }, // Various requirements
    category: 'ancestors', // Trait gets placed in a specific category shown in the UI
});
```
Resources, achievements, and policies can be made invisible by setting `visible` to false. By default, policies have `'on'`/`'off'` modes. Remember, more detailed information on all possible properties is in `getGameJSON()`, shown at the end of this document!

## Basic mod structure
Automatic construction of mod structure can be done with [this tool](https://plasma4.github.io/magix-fix/magix-wiki.html) although it's still rather clunky and not very extendable. (Click on "Show mod creator") It might give you an idea of the basics though!

Anyway, here is the minimal NEL mod:
```js
G.AddData({
  name: "Mod Name",
  author: "Author",
  desc: "Description of the mod.",
  engineVersion: 1,
  sheets: {"customSheet":"[link to sprite sheet here]"},
  func: function () {
    new G.Tech({name:'new tech',displayName:'New tech',icon:[0,0],cost:{insight:1},req:{tribalism:true}})
  }
})
```
Then, add stuff in the `func` function (or outside if you want), such as new techs, traits, or interactions. The best practice is usually to modify content after it has been created by the base game or another mod. This is done by adding code to your `func` like this:
```js
G.getDict("gatherer").desc += "<>Yummy!"
```
If you need to change a core game function, it's best not to replace it completely, as this will break other mods. Instead, "hook" into it:
```js
if (G.funcs['myFunc']) {
  var _originalMyFunc = G.funcs['myFunc']; // Store the original function
  G.funcs['new year'] = function() {
    _originalMyFunc();
    // Custom logic here...
  }
}
```
Or, if you need to change something in the middle of a function, you can use `eval()` (or preferably `Function()`) to inject or modify the function, or have multiple different functions for mod support.

However, one thing that hasn't been discussed is wonders. These simply have a few special cost and notice properties (example taken from `data.js`):
```js
new G.Unit({
  name:'mausoleum',
  desc:'@leads to the <b>Mausoleum Victory</b><>A mystical monument where the dead lie.//A temple housing a tomb deep under its rocky platform, the Mausoleum stands tall, its eternal shadow forever reminding your people of your greatness.',
  wonder:'mausoleum',
  icon:[1,14],
  wideIcon:[0,14],
  cost:{'basic building materials':1000},
  costPerStep:{'basic building materials':200,'precious building materials':20},
  steps:100,
  messageOnStart:'You begin the construction of the Mausoleum. Its towering mass already dominates the city, casting fear and awe wherever its shadow reaches.',
  finalStepCost:{'population':100},
  finalStepDesc:'To complete the Mausoleum, 100 of your [population,People] must be sacrificed to accompany you as servants in the afterlife.',
  use:{'land':10},
  //require:{'worker':10,'stone tools':10},
  req:{'monument-building':true},
  category:'wonder',
});
```
`main.js` and `magixUtils.js` have the code for the popup that says "This wonder only needs one more step to finalize" and makes the buttons, but we won't go over them here.

## Additional info
1. Did you know Orteil likes arrays? Even though he should be using objects instead of sparse arrays? This is actually a problem, because Orteil uses `G.techByTier = []; ... G.traitByTier = [];` Seems innocent enough, right??? Well, the problem is that the tier is based on the sum of the previous ancestor's tiers (ancestors are basically a requirement to unlock a trait or tech in this case). Except when [I found this problem in September 2024](https://discord.com/channels/412363381891137536/412372186955907102/1279856888414076959) it turns out that `traitByTier` was Array(2102051) and `techByTier` was Array(297288). The fix is simple enough; find all locations of these two variables and change [] to {}. Also, override `G.CreateData()` like Magix does.
2. The game will execute your mod file twice after initially creating a "New game" through the settings (or ascending), even if that code is outside of the `func` function. If this is a problem you may want to do something like this in your mod file:
    ```js
    if (!window.johnsModLoaded) {
    // Replace this comment with code. Code in here will only be executed once!
    var johnsModLoaded = true
    }
    ```
3. If you want to create a smaller mod and not a large overhaul it's almost certain that you do not need to replace `data.js` like Magix does. Depending on what you want though, your mod doesn't have to function with Magix (or and mods at all)!
4. Importantly, the `main.js` in this repo is [different than the actual `main.js`](https://orteil.dashnet.org/legacy/main.js).
5. Oh, yeah, and `data.js` was also changed for this repo. [Original data.js here.](https://orteil.dashnet.org/legacy/main.js) One of these changes is that fertility rituals only consumed faith every 50 days instead of 20 days, despite the text saying otherwise. Might want to change that in your mod :p
6. [The production multiplier's formula is weird and uses `randomFloor()`.](https://www.desmos.com/calculator/hfowgwemgp) (The Desmos graph has more context; basically the multiplier from happiness is rounded, can be 0 if happiness is a negative percentage, and can go up to 4 times base.) The more you know :)
7. Magix fundamentally alters many mechanics in the game, and `magix-fix` has edited more of them. Currently it is unfortunately at the point where so many base mechanics have been changed that it would be near impossible to find them all. These would include mobile features (in `G.widget.update`), making `stabilizeResize` more responsive, removal of empty tick functions in `G.Res()`. If you want mobile support or perhaps a more detailed attempt at fiding the differences, contact me on Discord (see top of this document).
8. The [Magix Wiki](https://plasma4.github.io/magix-fix/magix-wiki.html) might be helpful in order to quickly look for and examine certain items and their interactions between them! In particular, clicking on a unit provides an actually readable explanation of what goes on, and knowledge has detailed explanation (do note, though, that requirements or other properties that are changed with the JS will NOT be shown here).
9. Not everything might be in a place you expect initially; for example, this code:
    ```js
    if (G.achievByName['mausoleum'].won > 4) G.techByName['missionary'].effects.push({ type: 'provide res', what: { 'spirituality': 1 } });
    ```
    is actually located in `G.funcs['game loaded']`! Unfortunately, this also means that finding stuff can be a huge pain sometimes and it may take a while to figure out what is going on.
10. Gathering is based on the total goods available across all owned tiles, weighted by each tile's exploration percentage. The `chance` property determines if a good spawns on a tile at all, and this happens only once when the world is created. However...the actual amount gathered isn't just `Math.min(resAmount, toGather)`. The game "soft-caps" it to make gathering less effective when you have far more workers than available resources, but it doesn't drop to zero. The formula is:
    ```js
    amount = Math.min(resAmount, toGather) * 0.95 + 0.05 * toGather // Original code: amount = Math.min(resAmount, toGather) * resWeight + unitWeight * (toGather), where unitWeight = 1 - resWeight and resWeight = 0.05
    ```
    So, with 35 herbs available and 10 desired, you would only get 10 herbs.
However, if you had 50 gatherers (toGather = 100), you would get 38.25 herbs. You get slightly more than what's available because of the small "from thin air" bonus, but you suffer heavily from diminishing returns.
11. Techs and traits' IDs are unified because they both are actually considered knowledge, and extend `G.Know`. (What a weird piece of trivia!)
12. Note that the game uses `PicLoader` to cache images properly, but you might not be able to use that tool if you have your own mod. Magix(-fix version) tries to solve this problem by creating a `new Image()` at the start and setting it to a global variable (and uses the `johnsModLoaded` trick to only make one new image).
13. If you try to have text `[custom resource]` that doesn't exist then `G.resolveRes` will be called. If you need to debug everything it may be reasonble to append all descriptions, mode descriptions, and so on into a big piece of text in the inspector, modify `G.resolveRes` to what is desired, then `G.parseFunc` that text. While this might take a while to parse it might allow you to quickly find these typos!
14. On the topic of custom text, you can use HTML in descriptions, and custom shortcuts. Magix has this function:
    ```js
    G.fixTooltipIcons = function () {
        G.parse = function (what) {
            var str = '<div class="par">' + ((what
                .replaceAll(']s', ',*PLURAL*]'))
                .replace(/\[(.*?)\]/gi, G.parseFunc))
                .replaceAll('http(s?)://', 'http$1:#SLASH#SLASH#')
                .replaceAll('//', '</div><div class="par">')
                .replaceAll('#SLASH#SLASH#', '//')
                .replaceAll('@', '</div><div class="par bulleted">')
                .replaceAll('<>', '</div><div class="divider"></div><div class="par">') + '</div>';
            return str;
        }
    }
    ```
    which is where the shortcuts are from.
15. Magix(-fix version) modifies the chances of particles appearing by adding this line of code to `G.showParticle`:
    ```js
    if (!G.getSetting('particles') || Math.random() > (G.getSetting('fast') == true ? 0.05 : 0.25)) return 0;
    ```
    which you may want if there are many new units in your mod.

## Properties
In `localDevelopment.js` there is a function called `getGameJSON()` that gives information on properties, including those from Magix. Here is the code, which should give you an idea of what these properties mean:
```js
function getGameJSON(objectMode) {
    var result = {
        achievements: extractObject(G.achiev, ["name", "displayName", "desc", "tier", "visible", "icon", "wideIcon", "civ", "special", "plural"]),
        lands: extractObject(G.land, ["name", "displayName", "desc", "names", "goods", "icon", "image", "ocean", "score"]),
        goods: extractObject(G.goods, ["name", "displayName", "desc", "res", "icon", "mult"]),
        resources: extractObject(G.res, ["name", "displayName", "hidden", "desc", "category", "startWith", "colorGood", "colorBad", "icon", "fractional", "turnToByContext", "meta", "partOf"], ["tick", "getDisplayAmount", "getIcon", "whenGathered"]),
        units: extractObject(G.unit, ["name", "displayName", "desc", "wonder", "icon", "wideIcon", "threexthreeIcon", "startWith", "cost", "costPerStep", "steps", "type", "messageOnStart", "finalStepCost", "finalStepDesc", "use", "req", "category", "modes", "gizmos", "limitPer", "upkeep", "priority"], ["tick"]),
        policies: extractObject(G.policy, ["name", "displayName", "desc", "icon", "startMode", "req", "modes", "category", "skip"]),
        techs: extractObject(G.tech, ["name", "displayName", "desc", "icon", "type", "cost", "category", "startWith", "tier", "chance", "req", "tutorialMesg", "skip"]),
        traits: extractObject(G.trait, ["name", "displayName", "desc", "icon", "type", "cost", "category", "startWith", "tier", "chance", "req", "skip"]),
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
            priority: "The items with a higher priority value get executed and built first",
            startMode: "The starting mode of the thing",
            effectsOff: "What to do when the policy is disabled",
            effects: "Various effects. Some effects may be functions or require specific contexts",
            tutorialMesg: "The message to write upon getting the technology",
            chance: "The chance of the trait or technology being selected",
            id: "The ID value of the thing",
            mod: "The link of the mod that was used to create the thing",
            precededBy: "What the thing requires to obtain",
            leadsTo: "What the thing leads to when obtained",
            skip: "Skips gaining this item when using the ALMIGHTY button in debug mode"
        },
        sheets: G.sheets
    }
    var str = JSON.stringify(result).replace(/<b>(0|-[0-9])<\/b> runs\/legacies/g, "<b>7</b> runs/legacies") // Replace this part of the data because it's a seasonal text thing that doesn't update properly
    return objectMode ? JSON.parse(str) : str
}
```

That's it! Happy coding :)