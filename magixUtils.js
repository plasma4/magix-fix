/*
    Setup process:
  - IF YOU ALREADY HAVE MAGIX INSTALLED:
 Paste the script below into the console.
javascript:localStorage.setItem("legacySave-alpha",b64EncodeUnicode(escape(unescape(b64DecodeUnicode(G.Export())).replace("Xbm-ilapeDSxWf1b/MagixOfficialR55B.js","ZmatEHzFI2_QBuAF/magix.js").replace("Xbm-ilapeDSxWf1b/MagixUtilsR55B.js","ZmatEHzFI2_QBuAF/magixUtils.js")))),onbeforeunload=null,location.reload()

>>> It's that easy! If you can't open the console for some reason, you can try selecting all the code above and dragging it to your browser's bookmark bar. Then, go to the tab with NeverEnding Legacy open and click on the bookmark. After that, the bookmark isn't needed anymore and can be removed.
==========
  - IF YOU ARE STARTING FROM A NEW GAME:
 To set up this mod, go to Orteil's NeverEnding Legacy and click on the Load Mod button. From the text box that pops up, delete the default text and paste in the following 2 lines:
https://file.garden/ZmatEHzFI2_QBuAF/magixUtils.js
https://file.garden/ZmatEHzFI2_QBuAF/magix.js

>>> If you pasted them in with that order and deleted the default text, it should work!
==========
  - DOWNLOADING MAGIX LOCALLY:
 If you wish to download Magix in a local copy for offline use or modding, you can do so download the .zip file at https://github.com/plasma4/magix-fix/archive/refs/heads/main.zip to get started!

>>> You next step should be to extract the .zip file (to ensure assets work properly) and to open the index.html file. Congrats! You can now use Magix or load other mods in without internet.
*/

/* Additionally, PLEASE BE AWARE: The creator of this mod has personally stated in Discord messages that the Magix mod may be modded by anyone who wishes. This mod provides a few important fixes that prevent the game from breaking, as well as a large amount of rewritings and small changes. To compare, visit https://file.garden/Xbm-ilapeDSxWf1b/MagixUtilsR55B.js to find the original source. */

//Custom storage tools that 1) don't break the save data and 2) are saved when exporting
if (!window.magixLoaded) {
    window.magixLoaded = 1
    var conflictingStorageObjects = ["civ"]
    G.storageObject = {}
    try {
        G.storageObject = localStorage.getItem("legacySave-alpha")
        if (G.storageObject) {
            G.storageObject = unescape(b64DecodeUnicode(G.storageObject)).match(/\$\{.+?\}/)
            if (G.storageObject) {
                G.storageObject = G.storageObject[G.storageObject.length - 1]
                if (G.storageObject) {
                    G.storageObject = JSON.parse(G.storageObject.slice(1).replaceAll('&QOT', '"'))
                } else {
                    G.storageObject = {}
                }
            } else {
                G.storageObject = {}
            }
        } else {
            G.storageObject = {}
        }
    } catch (e) {
        console.warn("Storage data could not be obtained.")
        G.storageObject = {}
    }
}

var isUsingFile = window.offlineMode != null
var magixURL = isUsingFile ? "Magix/" : "https://file.garden/Xbm-ilapeDSxWf1b/"
var magixURL2 = isUsingFile ? "Magix/" : "https://file.garden/ZmatEHzFI2_QBuAF/"
var orteilURL = window.offlineMode ? "Magix/" : "https://orteil.dashnet.org/cookieclicker/snd/"

//Cookies aren't really needed for this case, so they have been replaced with localStorage from now on; in addition, i've made it so that the game can detect the object data anyway without them by changing the releaseNumber value: this is just a backup method for those older versions
function getObj(key) {
    var storageItem = G.storageObject[key]
    if (storageItem != null) {
        return storageItem
    }
    try {
        var localItem = localStorage.getItem(key)
        if (localItem !== null) {
            return localItem
        }
    } catch (e) {

    }
    if (navigator.cookieEnabled) {
        let name = key + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
    }
    return null;
}

function setObj(key, value) {
    G.storageObject[key] = value
}

function unitAmount(name, res2, cap) {
    var index = G.unitsOwnedNames.indexOf(name)
    if (index !== -1 && G.unitsOwned[index]) {
        var item = G.unitsOwned[index]
        return (item.amount - item.idle) * Math.min(res2 == null ? 1 : G.getAmount(res2), cap == null ? Infinity : cap)
    }
}

G.setDict = function (name, what) {
    //No more warnings :p
    G.dict[name] = what
}

/*==========================
TABS (yeah, this needs some changing and touch-ups, eh?)
==========================*/
function tabs() {
    if (G.tabs[0].name.slice(0, 5) === "<font") {
        return
    }
    var tabIds = [];
    var newText = ['<font color="lime">Production</font>', '<font color="#7f7fff">Territory</font>', '<font color="fuschia">Policies</font>', '<font color="pink">Traits</font>', '<font color="#bbbbff">Research</font>', '<font color="yellow">Settings</font>', '<font color="yellow">Update log (Vanilla)</font>', '<font color="yellow">Legacy</font>', '<font color="orange">Magix</font>'];
    for (i in G.tabs) {
        tabIds[i] = G.tabs[i].id;
        G.tabs[i].name = newText[i];
    }
    var tabL = G.tabs.length;
    if (tabIds.indexOf('Magix') == -1)
        G.tabs[tabL] = { name: '<font color="orange">Magix</font>', showMap: false, id: 'Magix', popup: true, addClass: 'right', desc: 'Options and info about the Magix mod.' };
    G.buildTabs();
}

/*==========================
Saveload
==========================*/
G.Save = function (toStr) {
    //if toStr is true, don't actually save; return a string containing the save
    if (!toStr && G.local && G.isIE) return false;
    var str = '';

    //general
    G.lastDate = parseInt(Date.now());
    str +=
        parseFloat(G.engineVersion).toString() + ';' +
        parseFloat(G.releaseNumber).toString() + ';' +
        parseFloat(G.startDate).toString() + ';' +
        parseFloat(G.fullDate).toString() + ';' +
        parseFloat(G.lastDate).toString() + ';' +
        parseFloat(G.year).toString() + ';' +
        parseFloat(G.day).toString() + ';' +
        parseFloat(G.fastTicks).toString() + ';' +
        parseFloat(G.furthestDay).toString() + ';' +
        parseFloat(G.totalDays).toString() + ';' +
        parseFloat(G.resets).toString() + ';' +
        parseInt(G.influenceTraitRemovalCooldown).toString() + ';' +
        '';
    str += '|';

    //settings
    for (var i in G.settings) {
        var me = G.settings[i];
        if (me.type == 'toggle') str += (me.value ? '1' : '0');
        else if (me.type == 'int') str += parseInt(me.value).toString();
        str += ';';
    }
    str += '|';

    //mods
    for (var i in G.mods) {
        var me = G.mods[i];
        str += '"' + me.url.replaceAll('"', '&quot;') + '":';
        if (me.achievs) {
            //we save achievements separately for each mod
            for (var ii in me.achievs) {
                str += parseInt(me.achievs[ii].won).toString() + ',';
            }
        }
        str += ':';
        //tracked stats (not fully implemented yet)
        str += parseFloat(G.trackedStat).toString();
        str += ';';
    }
    str += '|';

    //culture and names
    str += (G.cultureSeed) + ';';
    str += G.getSafeName('ruler') + ';';
    str += G.getSafeName('civ') + ';';
    str += G.getSafeName('civadj') + ';';
    str += G.getSafeName('inhab') + ';';
    str += G.getSafeName('inhabs') + ';';
    str += G.getSafeName('island') + ';';
    str += '|';

    //maps
    str += (G.currentMap.seed) + ';';

    var map = G.currentMap;
    for (var x = 0; x < map.w; x++) {
        for (var y = 0; y < map.h; y++) {
            var tile = map.tiles[x][y];
            str +=
                parseInt(tile.owner).toString() + ':' +
                parseInt(Math.floor(tile.explored * 100)).toString() + ':' +
                ',';
        }
    }

    str += '|';

    //techs & traits
    var len = G.techsOwned.length;
    for (var i = 0; i < len; i++) {
        str += parseInt(G.techsOwned[i].tech.id).toString() + ';';
    }
    str += '|';
    var len = G.traitsOwned.length;
    for (var i = 0; i < len; i++) {
        str += parseInt(G.traitsOwned[i].trait.id).toString() + ',';
        str += parseInt(G.traitsOwned[i].trait.yearOfObtainment).toString() + ';'; //we need to make temporality of the traits work as it should
    }
    str += '|';

    //policies
    var len = G.policy.length;
    for (var i = 0; i < len; i++) {
        var me = G.policy[i];
        if (me.visible) {
            str += parseInt(me.id).toString() + ',' + parseInt(me.mode ? me.mode.num : 0).toString() + ';';
        }
    }
    str += '|';

    //res
    var len = G.res.length;
    for (var i = 0; i < len; i++) {
        var me = G.res[i];
        str +=
            (!me.meta ? (parseFloat(Math.round(me.amount)).toString() + ',') : '') +
            (me.displayUsed ? (parseFloat(Math.round(me.used)).toString() + ',') : '') +
            (me.visible ? '1' : '0') + ';';
    }
    str += '|';

    //units
    var len = G.unitsOwned.length;
    for (var i = 0; i < len; i++) {
        var me = G.unitsOwned[i];
        if (true)//me.amount>0)
        {
            str += parseInt(me.unit.id).toString() + ',' +
                parseFloat(Math.round(me.amount)).toString() +
                ((me.unit.gizmos || me.unit.wonder) ?
                    (',' + parseInt(me.unit.wonder ? me.mode : (me.mode ? me.mode.num : 0)).toString() + ',' +//mode
                        parseInt(me.percent).toString())//percent
                    : '') +
                ',' + parseFloat(Math.round(me.targetAmount)).toString() +
                ',' + parseFloat(Math.round(me.idle)).toString() +
                ';';
        }
    }
    str += '|';

    //chooseboxes
    var len = G.chooseBox.length;
    for (var i = 0; i < len; i++) {
        var me = G.chooseBox[i];

        var choices = [parseFloat(me.roll)];

        for (var ii in me.choices) {
            choices.push(parseInt(me.choices[ii].id));
        }
        str += choices.join(',') + ';';
    }
    str += '|';
    for (var i = 0; i < len; i++) {
        var me = G.chooseBox[i];
        str += me.cooldown + ';';
    }
    //storage object
    str += '$' + JSON.stringify(G.storageObject).replaceAll('"', '&QOT') + (G.PARTY ? '$' : '')
    str += '|';

    //Important for file-based saves
    if (toStr) {
        str = str.replace("https://raw.githubusercontent.com/plasma4/magix-fix/master/magix.js", "https://file.garden/ZmatEHzFI2_QBuAF/magix.js").replace("https://raw.githubusercontent.com/plasma4/magix-fix/master/magixUtils.js", "https://file.garden/ZmatEHzFI2_QBuAF/magixUtils.js")
        console.log(str)
    }
    //console.log('SAVE');
    //console.log(str);
    str = escape(str);
    str = b64EncodeUnicode(str);
    //console.log(Math.ceil(byteCount(str)/1000)+'kb');
    if (!toStr) {
        localStorage.setItem(G.saveTo, str);
        G.middleText('- Game saved -');
        //console.log('Game saved successfully.');
    }
    else return str;
}

G.Load = function (doneLoading) {
    document.title = "NeverEnding Legacy"
    G.middleText('<p id="loading">Loading save...</p>', "slow");
    if (G.importStr) { var local = G.importStr; }
    else {
        if (G.local && G.isIE) return false;
        if (!window.localStorage) return false;
        var local = window.localStorage.getItem(G.saveTo);
    }
    if (!local) return false;
    var str = '';
    str = b64DecodeUnicode(local);
    //console.log('LOAD');
    //console.log(Math.ceil(byteCount(str)/1000)+'kb');
    str = unescape(str);
    //console.log(str);
    if (str != 'null' && str != '') {
        var oldStorage = G.storageObject;
        try {
            G.storageObject = unescape(b64DecodeUnicode(local)).match(/\$\{.+?\}/);
            if (G.storageObject) {
                G.storageObject = G.storageObject[G.storageObject.length - 1];
                if (G.storageObject) {
                    G.storageObject = JSON.parse(G.storageObject.slice(1).replaceAll('&QOT', '"'));
                    for (var i = 0; i < conflictingStorageObjects.length; i++) {
                        var key = conflictingStorageObjects[i]; //over here we compare storage object data and try to detect conflicts
                        var newItem = G.storageObject[key];
                        if (oldStorage[key] !== newItem) {
                            G.dialogue.popup(function (div) {
                                return '<div style="padding:16px;">Are you sure you want to load this save?<br>Your previous save will be wiped, as there is a storage conflict that requires a reload to fix.<br><br>' + G.button({
                                    text: 'Yes', onclick: function () {
                                        try {
                                            localStorage.setItem(G.saveTo, local);
                                            location.reload();
                                        } catch (e) {
                                            throw TypeError("The game failed to store the data locally.");
                                        }
                                    }
                                }) + G.button({
                                    text: 'No', onclick: function () {
                                        G.dialogue.close();
                                    }
                                }) + '</div>';
                            });
                            return false;
                        }
                    }
                } else {
                    G.storageObject = {};
                }
            } else {
                G.storageObject = {};
            }
        } catch (e) {
            console.warn("Storage data could not be obtained.");
            G.storageObject = oldStorage;
        }
        G.Reset();
        G.resetSettings();

        //take care of strings first
        G.stringsLoadedN = 0;
        G.stringsLoaded = [];
        str = str.replace(/"(.*?)"/gi, G.parseLoadStrings);

        str = str.split('|');

        var s = 0;
        //general
        var spl = str[s++].split(';');
        //console.log('General : '+spl);
        var i = 0;
        var fromVersion = parseFloat(spl[i++]);
        G.releaseNumber = parseFloat(spl[i++]);
        var corrupted = false;
        if (G.releaseNumber > 1000 || !isFinite(G.releaseNumber)) {
            G.releaseNumber = 54; //assume it's an older version simply due to a save being corrupted
            corrupted = true;
            i++;
            console.warn("A corruption has happened with the save, meaning that the game likely loaded with the G.Load function from the main script due to an error. An attempt to correct it has been made!")
        }
        G.startDate = parseFloat(spl[i++]);
        G.fullDate = parseFloat(spl[i++]);
        G.lastDate = parseFloat(spl[i++]);
        G.year = parseFloat(spl[i++]);
        G.day = parseFloat(spl[i++]);
        G.fastTicks = parseFloat(spl[i++]);
        G.furthestDay = parseFloat(spl[i++]);
        G.totalDays = parseFloat(spl[i++]);
        G.resets = parseFloat(spl[i++]);
        if (!corrupted) {
            G.influenceTraitRemovalCooldown = parseFloat(spl[i++]);
        }
        //accumulate fast ticks when offline
        var timeOffline = Math.max(0, (Date.now() - G.lastDate) / 1000);
        G.fastTicks += Math.floor(timeOffline);
        G.nextFastTick = Math.ceil((1 - (timeOffline - Math.floor(timeOffline))) * G.tickDuration);

        //settings
        var spl = str[s++].split(';');
        //console.log('Settings : '+spl);
        var len = spl.length;
        for (var i = 0; i < len; i++) {
            if (spl[i] != '' && G.settings[i]) {
                var me = G.settings[i];
                if (me.type == 'toggle') me.value = (spl[i] == '1' ? true : false);
                else if (me.type == 'int') me.value = parseInt(spl[i]);
            }
        }
        for (var i in G.settings) {
            var me = G.settings[i];
            if (me.onChange) me.onChange();
        }


        if (!doneLoading) {
            //mods
            var spl = str[s++].split(';');
            var mods = [];
            for (var i in spl) {
                var spl2 = spl[i].split(':');
                var val = G.readLoadedString(spl2[0]);
                if (val) {
                    mods.push(val.replaceAll('&quot;', '"'));
                }
            }
            G.LoadMods(mods, G.Load, false);
            return 1;
        }

        G.importStr = 0;

        //mod achievs & tracked stats
        var spl = str[s++].split(';');
        for (var i in spl) {
            var spl2 = spl[i].split(':');
            var mod = G.mods[i];
            if (spl2[1] && mod.achievs) {
                bit = spl2[1].split(',');
                for (var ii in bit) {
                    if (bit[ii]) {
                        if (mod.achievs[ii]) mod.achievs[ii].won = parseInt(bit[ii]);
                    }
                }
            }
            if (spl2[2]) {
                bit = spl2[2].split(',');
                for (var ii in bit) {
                    if (bit[ii]) {
                        G.trackedStat = parseFloat(bit[ii]);
                    }
                }
            }
        }

        //culture and names
        var spl = str[s++].split(';');
        var ss = 0;
        G.cultureSeed = spl[ss++];
        G.setSafeName('ruler', G.readLoadedString(spl[ss++]), 'Anonymous');
        G.setSafeName('civ', G.readLoadedString(spl[ss++]), 'nameless tribe');
        G.setSafeName('civadj', G.readLoadedString(spl[ss++]), 'tribal');
        G.setSafeName('inhab', G.readLoadedString(spl[ss++]), 'inhabitant');
        G.setSafeName('inhabs', G.readLoadedString(spl[ss++]), 'inhabitants');
        if (G.releaseNumber > 54)
            G.setSafeName('island', G.readLoadedString(spl[ss++]), 'Plain Island');

        //maps
        var spl = str[s++].split(';');
        //console.log('Map tiles : '+spl);
        G.currentMap = new G.Map(0, 24, 24, spl[0]);

        var map = G.currentMap;
        var spl2 = spl[1].split(',');
        var I = 0;
        for (var x = 0; x < map.w; x++) {
            for (var y = 0; y < map.h; y++) {
                if (spl2[I]) {
                    var tile = map.tiles[x][y];
                    spl3 = spl2[I].split(':');
                    tile.owner = parseInt(spl3[0]);
                    tile.explored = parseInt(spl3[1]) / 100;
                }
                I++;
            }
        }

        G.updateMapForOwners(map);
        G.centerMap(map);

        //techs & traits
        var spl = str[s++].split(';');
        //console.log('Techs : '+spl);
        var len = spl.length;
        for (var i = len - 1; i >= 0; i--) { if (spl[i] != '') { G.gainTech(G.know[parseInt(spl[i])]); } }

        var spl = str[s++].split(';');
        //console.log('Traits : '+spl);
        var len = spl.length;
        for (var i = len - 1; i >= 0; i--) {
            if (spl[i] != '') {
                var spl2 = spl[i].split(',');
                G.gainTrait(G.know[parseInt(spl2[0])]);
                if (G.releaseNumber > 54) G.know[parseInt(spl2[0])].yearOfObtainment = parseFloat(spl2[1]);
            }
        }

        //policies
        var spl = str[s++].split(';');
        //console.log('Policies : '+spl);
        var len = spl.length;
        for (var i = len - 1; i >= 0; i--) {
            if (spl[i] != '') {
                var spl2 = spl[i].split(',');
                var me = G.policy[parseInt(spl2[0])];
                G.gainPolicy(me);
                me.mode = me.modesById[parseInt(spl2[1])];
            }
        }

        //res
        var spl = str[s++].split(';');
        //console.log('Resources : '+spl);
        var len = G.res.length;
        for (var i = 0; i < len; i++) {
            if (spl[i]) {
                var me = G.res[i];
                var spl2 = spl[i].split(',');
                if (parseInt(spl2[spl2.length - 1]) == 1) me.visible = true; else me.visible = false;
                if (!me.meta) me.amount = parseFloat(spl2[0]);
                if (me.displayUsed) me.used = parseFloat(spl2[1]);
            }
        }

        //units
        var spl = str[s++].split(';');
        //console.log('Units : '+spl);
        var len = spl.length;
        for (var i = len - 1; i >= 0; i--) {
            if (spl[i] != '') {
                var spl2 = spl[i].split(',');
                //unit id, amount, and if unit has gizmos : mode, percent
                var obj = {
                    id: G.unitN,
                    unit: G.unit[parseInt(spl2[0])],
                    amount: parseFloat(spl2[1]),
                    targetAmount: ((typeof spl2[4] !== 'undefined') ? parseFloat(spl2[4]) : parseFloat(spl2[1])),
                    idle: ((typeof spl2[5] !== 'undefined') ? parseFloat(spl2[5]) : 0),
                    displayedAmount: 0,
                    mode: parseInt(spl2[2]) || 0,
                    percent: parseInt(spl2[3]),
                    popups: []
                };
                G.unitsOwned.unshift(obj);
                var unit = G.unitsOwned[0];
                if (unit.unit.modesById[0]) unit.mode = unit.unit.modesById[unit.mode];
                G.unitsOwnedNames.unshift(G.unit[parseInt(spl2[0])].name);
                G.unitN++;
            }
        }

        //assign unit .splitOf
        var prev = 0;
        var len = G.unitsOwned.length;
        for (var i = 0; i < len; i++) {
            var me = G.unitsOwned[i];
            if (prev && me.unit.id == prev.unit.id) me.splitOf = prev;
            else prev = me;
        }
        prev = 0;

        //chooseboxes
        var spl = str[s++].split(';');
        var len = spl.length;
        for (var i = len - 1; i >= 0; i--) {
            if (spl[i] != '') {
                G.chooseBox[i].choices = [];
                var spl2 = spl[i].split(',');
                for (var ii in spl2) {
                    if (ii == 0) G.chooseBox[i].roll = parseFloat(spl2[ii]);
                    else G.chooseBox[i].choices[ii - 1] = G.know[parseInt(spl2[ii])];
                }
            }
        }

        var tSpl = str[s++].split('$')
        var spl = tSpl[0].split(';');
        var num = parseInt(spl[0]);
        G.getDict('research box').cooldown = isFinite(num) ? num : 0;
        if (tSpl.length >= 3) G.PARTY = 1; //new feature added: there will be an added $ sign if G.PARTY is true, and there is a button to toggle this in the debug menu because why not (this is right after G.storageObject data but that is pre-calculated in an attempt to avoid conflicting data issues like civ mismatches)

        G.runUnitReqs();
        G.runPolicyReqs();

        G.applyAchievEffects('load');

        G.updateEverything();
        G.createTopInterface();
        G.createDebugMenu();
        if (G.tabs[G.settingsByName['tab'].value]) G.setTab(G.tabs[G.settingsByName['tab'].value]);
        G.setSetting('forcePaused', 0);

        l('blackBackground').style.opacity = 0;
        if (timeOffline >= 1) G.middleText('- Welcome back -<br><small>You accumulated ' + B(timeOffline) + ' fast ticks while you were away.</small>', true);

        G.rememberAchievs = true;

        G.animIntro = true;
        G.introDur = G.fps * 1;

        G.doFunc('game loaded');

        G.Logic(true);//force a tick (solves some issues with display updates; this however means loading a paused game, saving and reloading will make a single day go by every time, which isn't ideal)
        G.releaseNumber = 55; //this must be assigned here or else we will have issues
        tabs();
        console.log('Game loaded successfully (release ' + G.releaseNumber + ').');
        return true;
    }
    return false;
}

//Remove the empty tick functions for a little performance boost (how much? not sure...in particular, considering the amount of problems this has/may cause)
G.Res = function (obj) {
    this.type = 'res';
    this.amount = 0;
    this.used = 0;//only used by some special resources (houses occupied, workers busy...); will only be handled and saved if the resource has .displayUsed=true
    this.mult = 1;//gain multiplier; all gains of this resource are multiplied by this; updated every tick
    this.displayedAmount = 0;//used to tick up the displayed number
    this.displayedUsedAmount = 0;//used to tick up the displayed number
    this.startWith = 0;
    this.gained = 0;//gained this tick
    this.lost = 0;//lost this tick
    this.gainedBy = [];//filled by unit names and other processes that create this resource; emptied after every tick
    this.lostBy = [];//filled by unit names and other processes that use up this resource; emptied after every tick
    this.meta = false;//does this resource have subparts?
    this.partOf = false;//is this resource a subpart of another resource? (a resource cannot be a subresource AND have subresources of its own)
    this.subRes = [];//subresources if this is a meta-resource; handled automatically
    this.getMult = function () { return 1; };
    this.getDisplayAmount = function () {
        if (this.displayUsed) return B(this.displayedUsedAmount) + '<wbr>/' + B(this.displayedAmount);
        else return B(this.displayedAmount);
    };
    this.category = '';
    this.icon = [0, 0];
    this.visible = false;//a resource will only be displayed if you've had some of the resource at some point (you can set .visible to force it to start visible; you can also set .hidden to override .visible)

    for (var i in obj) this[i] = obj[i];
    this.id = G.res.length;
    if (!this.displayName) this.displayName = cap(this.name);
    G.res.push(this);
    G.resByName[this.name] = this;
    G.setDict(this.name, this);
    this.mod = G.context;
}
G.NewGameConfirm = function () {
    //the player has selected a starting location; launch the game proper
    //G.Reset();
    G.sequence = 'main';
    G.T = 0;

    G.rememberAchievs = true;
    for (var i in G.savedAchievs) {
        //reload achievements
        if (G.modsByName[i] && G.modsByName[i].achievs) {
            for (var ii in G.savedAchievs[i]) {
                if (G.modsByName[i].achievs[ii]) G.modsByName[i].achievs[ii].won = G.savedAchievs[i][ii];
            }
        }
    }

    //init everything

    G.createMaps();

    for (var i in G.res) {
        G.res[i].amount = G.res[i].startWith;
    }
    for (var i in G.tech) {
        if (G.tech[i].startWith) G.gainTech(G.tech[i]);
    }
    for (var i in G.trait) {
        if (G.trait[i].startWith) G.gainTrait(G.trait[i]);
    }
    for (var i in G.policy) {
        if (G.policy[i].startWith) G.gainPolicy(G.policy[i]);
    }

    for (var i in G.res) {
        var item = G.res[i]
        if (item.tick) item.tick(item, G.tick);
    }

    G.runUnitReqs();
    G.runPolicyReqs();

    G.applyAchievEffects('new');

    G.updateEverything();
    G.createTopInterface();
    G.createDebugMenu();

    for (var i in G.unit) {
        if (G.unit[i].startWith) { G.buyUnitByName(G.unit[i].name, G.unit[i].startWith); }
    }

    l('blackBackground').style.opacity = 0;

    G.setSetting('forcePaused', 0);
    G.setSetting('paused', 0);
    G.setSetting('fast', 0);

    G.animIntro = true;
    G.introDur = G.fps * 3;

    G.doFunc('new game');

    G.Message({
        type: 'important', text: 'If this is your first time playing, you may want to consult some quick ' + G.button({
            text: 'Getting started', tooltip: 'Read a few tips on how to make it past the first stages of the game.', onclick: function () {
                G.dialogue.popup(function (div) {
                    return '<div style="width:480px;min-height:320px;height:75%;">' +
                        '<div class="fancyText title">A few tips on how to not die horribly:</div>' +
                        '<div class="fancyText bitBiggerText scrollBox underTitle" style="text-align:left;padding:16px;">' +
                        '<div class="bulleted">early on, focus most of your workers on food gathering</div>' +
                        '<div class="bulleted">your people will want to eat and drink a lot, so give them as much food as you can once you can change that</div>' +
                        '<div class="bulleted">assign a few spare workers as dreamers, in order to get some Insight which you can use to research technologies</div>' +
                        '<div class="bulleted">wanderers might not seem that useful, but they can acquire some more useful land for you!</div>' +
                        '<div class="bulleted">check the territory tab and click your starting location; if you\'ve got very few sources of food or water, you might want to restart the game</div>' +
                        '<div class="bulleted">don\'t bother researching fishing or hunting if none of your tiles have animals or fish!</div>' +
                        '<div class="bulleted">enabling elder/child work policies can be useful if you need extra workers, but may prove detrimental to your people\'s health</div>' +
                        '<div class="bulleted">if things get too hectic, you can always pause the game and take your time</div>' +
                        '<div class="bulleted">you don\'t have to worry about meeting other civilizations</div>' +
                        '<div class="bulleted">sometimes things just go wrong; don\'t lose hope and start over when needed!</div>' +
                        '</div>' +
                        '</div><div class="buttonBox">' +
                        G.dialogue.getCloseButton('Got it!') +
                        '</div></div>';
                });
            }
        }) + ' tips.'
    });
}
G.logic['res'] = function () {
    //update visibility
    var len = G.res.length;
    for (var i = 0; i < len; i++) {
        var res = G.res[i];
        res.gainedBy = [];
        res.lostBy = [];
        res.gained = 0;
        res.lost = 0;
    }
    for (var i = 0; i < len; i++) {
        var realRes = G.res[i];
        var res = G.resolveRes(realRes);
        if (res != realRes) {
            if (realRes.tick) realRes.tick(realRes, G.tick);
            if (realRes.hidden) realRes.visible = false;
            else if (res.amount != 0) realRes.visible = true;
        }
        else {
            if (res.tick) res.tick(res, G.tick);
            res.mult = res.getMult();
            if (res.hidden) res.visible = false;
            else if (res.amount != 0) res.visible = true;
        }
    }
    //resolve meta-resources with sub-resources
    var len = G.metaRes.length;
    for (var i = 0; i < len; i++) {
        var me = G.resolveRes(G.metaRes[i]); me.amount = 0;
    }
    var len = G.subRes.length;
    for (var i = 0; i < len; i++) {
        var me = G.subRes[i];
        var meta = G.getRes(me.partOf);
        meta.amount += me.amount;
        meta.gained += me.gained;
        meta.lost += me.lost;
        for (var ii in me.gainedBy) { if (!meta.gainedBy.includes(me.gainedBy[ii])) meta.gainedBy.push(me.gainedBy[ii]); }
        for (var ii in me.lostBy) { if (!meta.lostBy.includes(me.lostBy[ii])) meta.lostBy.push(me.lostBy[ii]); }
    }
}

//change page layout to fit width (for Magix, the defaults are TOO LOW, sadly)
G.stabilizeResize = function () {
    G.resizing = false;
    l('sections').style.marginTop = ((G.w < 550) + (G.w < 590) + (G.w < 645) + (G.w < 755)) * 20 + 'px'
    l('game').style.bottom = G.h < 600 ? 0 : null;
    l('fpsGraph').style.display = G.h < 600 ? 'none' : 'block';
    if (G.w * G.h < 200000 || G.w < 625) { document.body.classList.add('halfSize'); } else { document.body.classList.remove('halfSize'); }
    if (G.w < 950) { G.wrapl.classList.remove('narrow'); G.wrapl.classList.add('narrower'); }
    else if (G.w < 1152) { G.wrapl.classList.remove('narrower'); G.wrapl.classList.add('narrow'); }
    else { G.wrapl.classList.remove('narrower'); G.wrapl.classList.remove('narrow'); }
    //if (G.tab.id=='unit') G.cacheUnitBounds();
}

G.CreateData = function () {
    //cleanse all data first
    G.dict = [];
    G.res = [];
    G.resByName = [];
    G.resCategories = [];
    G.unit = [];
    G.unitByName = [];
    G.unitCategories = [];
    G.policy = [];
    G.policyByName = [];
    G.policyCategories = [];
    G.know = [];
    G.knowByName = [];
    G.knowCategories = [];
    G.tech = [];
    G.techByName = [];
    G.techByTier = {};
    G.trait = [];
    G.traitByName = [];
    G.traitByTier = {};
    G.goods = [];
    G.goodsByName = [];
    G.land = [];
    G.landByName = [];
    G.achiev = [];
    G.achievByName = [];
    G.achievByTier = [];
    G.legacyBonuses = [];
    G.chooseBox = [];
    G.contextNames = [];
    G.contextVisibility = [];

    G.funcs = [];//keyed array; store functions tied to hard-coded events in here
    G.props = [];//keyed array; store anything you want in here

    G.context = 0;
    G.sheets = {};//icon sheets added by mods
    //create new data
    for (var i in G.mods) {
        G.context = G.mods[i];
        if (G.mods[i].sheets) {
            for (var ii in G.mods[i].sheets) {
                G.sheets[ii] = G.mods[i].sheets[ii];
            }
        }
        G.mods[i].func();
    }
    G.context = 0;

    //cache some stuff
    G.cacheMetaResources();

    var newBonuses = {};
    for (var i in G.legacyBonuses) {
        var me = G.legacyBonuses[i];
        newBonuses[me.id] = me;
    }
    G.legacyBonuses = newBonuses;

    for (var i in G.unit) {
        G.unit[i].modesById = [];
        var index = 0;
        for (var ii in G.unit[i].modes) {
            var mode = G.unit[i].modes[ii];
            G.unit[i].modesById[index] = mode;
            mode.id = ii;
            mode.num = index;
            mode.use = mode.use || {};
            index++;
        }
    }

    for (var i in G.policy) {
        G.policy[i].modesById = [];
        var index = 0;
        for (var ii in G.policy[i].modes) {
            var mode = G.policy[i].modes[ii];
            G.policy[i].modesById[index] = mode;
            mode.id = ii;
            mode.num = index;
            index++;
        }
    }

    for (var i in G.know) {
        var me = G.know[i];
        me.leadsTo = [];
        me.precededBy = [];
    }
    for (var i in G.know) {
        var me = G.know[i];
        for (var ii in me.req) {
            var req = G.getDict(ii);
            if (me.req[ii] && req && (req.type == 'tech' || req.type == 'trait')) {
                G.getKnow(ii).leadsTo.push(me);
                me.precededBy.push(G.getKnow(ii));
            }
            if (!req) console.log('ERROR: ' + me.name + ' has "' + ii + '" as a requirement, but no such thing was found.');
        }
    }

    //create tiers
    var getTier = function (me) {
        var tier = 0;
        for (var i in me.req) {
            var req = G.getDict(i);
            if (me.req[i] && req && req.type == me.type) {
                tier = Math.max(tier, req.tier || Math.max(getTier(req)));
            }
        }
        me.tier = tier + 1;
        return me.tier;
    }
    for (var i in G.know) {
        var me = G.know[i];
        getTier(me);
        if (me.type == 'tech') {
            if (!G.techByTier[me.tier]) G.techByTier[me.tier] = [];
            G.techByTier[me.tier].push(me);
        }
        else if (me.type == 'trait') {
            if (!G.traitByTier[me.tier]) G.traitByTier[me.tier] = [];
            G.traitByTier[me.tier].push(me);
        }
    }

    //compute combined research costs
    if (true) {
        G.techByTier = {};
        G.traitByTier = {};
        for (var i in G.know) {
            var me = G.know[i]; me.tier = 0;
        }
        var getAncestors = function (me) {
            var out = [me];
            for (var i in me.req) {
                var req = G.getDict(i);
                if (me.req[i] && req && req.type == me.type) {
                    out = out.concat(getAncestors(req));
                }
            }
            return out;
        }
        for (var i in G.know) {
            var me = G.know[i];
            me.ancestors = getAncestors(me);
            me.ancestors = me.ancestors.filter(function (elem, index, self) { return index == self.indexOf(elem); })//remove duplicates
            for (var ii in me.ancestors) {
                for (var iii in me.ancestors[ii].cost) {
                    me.tier += me.ancestors[ii].cost[iii];
                }
            }
        }
        for (var i in G.know) {
            var me = G.know[i];
            if (me.type == 'tech') {
                if (!G.techByTier[me.tier]) G.techByTier[me.tier] = [];
                G.techByTier[me.tier].push(me);
            }
            else if (me.type == 'trait') {
                if (!G.traitByTier[me.tier]) G.traitByTier[me.tier] = [];
                G.traitByTier[me.tier].push(me);
            }
        }
    }


    for (var i in G.achiev) {
        var me = G.achiev[i];
        if (me.fromUnit) {
            var unit = G.getUnit(me.fromUnit);
            if (!me.desc) me.desc = unit.desc;
            if (me.icon[0] == 0 && me.icon[1] == 0) me.icon = unit.icon;
            if (!me.wideIcon && unit.wideIcon) me.wideIcon = unit.wideIcon;
        }
    }
}

G.getDataAmounts = function () {
    return 'Data created.\n' +
        '   - ' + G.res.length + ' resources\n' +
        '   - ' + G.unit.length + ' units\n' +
        '   - ' + G.tech.length + ' technologies\n' +
        '   - ' + G.trait.length + ' cultural traits\n' +
        '   - ' + G.policy.length + ' policies\n' +
        '   - ' + G.land.length + ' terrains\n' +
        '   - ' + G.goods.length + ' terrain goods\n' +
        '   - ' + G.achiev.length + ' achievements\n' +
        ''
}

if (getObj("civ") === null) setObj("civ", 0);
var magix2Link = magixURL2 + 'magix2.png?v=2.4' //Version 2.4: 75 sprites
G.AddData({
    name: 'MagixUtils',
    author: 'pelletsstarPL',
    desc: 'Some mechanics that are in Magix code are contained within this mod. Required to play Magix.',
    engineVersion: 1,
    sheets: { 'magixmod': magixURL + 'magixmod.png', 'magix2': magix2Link, 'seasonal': magixURL + 'seasonalMagix.png', 'c2': magixURL + 'CiV2IconSheet.png' },//just for achievs
    func: function () {
        ///FOR SEASONAL CONTENT. IK COPIED FROM CC, BUT IT WILL HELP ME. ALSO THAT IS HOW MODDING LOOKS LIKE THAT xD
        var yer = new Date();
        var leap = (((yer % 4 == 0) && (yer % 100 != 0)) || (yer % 400 == 0)) ? 1 : 0;
        var day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        var easterDay = function (Y) { var C = Math.floor(Y / 100); var N = Y - 19 * Math.floor(Y / 19); var K = Math.floor((C - 17) / 25); var I = C - Math.floor(C / 4) - Math.floor((C - K) / 3) + 19 * N + 15; I = I - 30 * Math.floor((I / 30)); I = I - Math.floor(I / 28) * (1 - Math.floor(I / 28) * Math.floor(29 / (I + 1)) * Math.floor((21 - N) / 11)); var J = Y + Math.floor(Y / 4) + I + 2 - C + Math.floor(C / 4); J = J - 7 * Math.floor(J / 7); var L = I - J; var M = 3 + Math.floor((L + 40) / 44); var D = L + 28 - 31 * Math.floor(M / 4); return new Date(Y, M - 1, D); }(yer);
        easterDay = Math.floor((easterDay - new Date(easterDay.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        ///

        //Add more numbers
        var numberFormatters =
            [
                function rawFormatter(value) { return value % 1 ? Math.floor(value * 1000) / 1000 : value },
                formatEveryThirdPower([
                    ' thousand',
                    ' million',
                    ' billion',
                    ' trillion',
                    ' quadrillion',
                    ' quintillion',
                    ' sextillion',
                    ' septillion',
                    ' octillion',
                    ' nonillion',
                    ' decillion',
                    ' undecillion',
                    ' duodecillion',
                    ' tredecillion'
                ]),
                formatEveryThirdPower([
                    'k',
                    'M',
                    'B',
                    'T',
                    'Qa',
                    'Qi',
                    'Sx',
                    'Sp',
                    'Oc',
                    'No',
                    'Dc',
                    'Ud',
                    'Dd',
                    'Td'
                ])
            ];


        G.PARTY = 0;
        G.exploreNewOceanTiles = 0;
        G.exploreNewTilesAlternate = 0;
        G.exploreOwnedOceanTiles = 0;
        var i = 0;
        var ca; var cb;
        G.ocean;
        G.civ = 0; var displayAchievs = 0; G.influenceTraitRemovalCooldown = 0;

        var ascended = false;

        /*=========================
        Sounds
        Just to optimize code
        =========================*/
        G.playSound = function (sound) {
            if (G.getSetting('sound')) {
                var audio = new Audio(sound);
                audio.play();
            };
        }

        //Magix tab
        G.tabPopup['Magix'] = function () {
            var str = '';
            str += '<div class="par">' +
                '<b>The Magix Mod</b> is a mod for NeverEnding Legacy made by <b>pelletsstarPL</b>.</div>' + '<div class="par">While in development, the mod may be unstable and subject to changes, but the overall goal is to ' +
                'expand and improve the legacy with flexible, balanced, custom-created content and adds various improvements to existing mechanics.</div>' +
                '<b>From @pelletsstarPL:</b> this mod was made because I was wondering how legacy would look if the last update was much later. ' +
                'I was checking bunch of mods and noticed...<b>there was no mod about magic...but I changed it</b>! ' +
                'Even today, I am proud of the fruits of my creativity and time I sacrificed to make this entertaining mod. ' +
                'I made this mod due to my hobby: IT. I like things like coding and networking. Who knows...maybe I will become an expert of javascript! ' +
                '<br>(Various improvements and fixes have been added at @1_e0, a programmer. You can find me in the <a href="https://discord.gg/cookie" target="_blank">Dashnet discord server</a>.)<br><b>Sprite designs were created by Orteil, @pelletsstarPL, @1_e0, and @theskullyko and merged together.</b>' +
                '<br><font color="#f95e4d"><b>Note: some crazy bugs and issues may occur in debug mode.</b></font>' +
                '<div class="barred fancyText">Settings:</div>' +
                G.writeSettingButton({ text: 'Toggle sounds', tooltip: 'Toggle all game sounds.', name: 'sound', id: 'sound' }) + "<br>";
            if (G.resets >= 3) {
                str += '<div class="barred fancyText">Settings:</div>';
                str += G.writeSettingButton({ text: 'Toggle birth messages', tooltip: 'Toggle messages about how many babies have been born in your civilization.', name: 'birth messages', id: 'birth messages' }) +
                    G.writeSettingButton({ text: 'Toggle death messages', tooltip: 'Toggle messages informing that someone from your civilization died.<br>Note: It will disable ALL death messages, regardless of the reason.', name: 'death messages', id: 'death messages' }) +
                    G.writeSettingButton({ text: 'Toggle new day lines', tooltip: 'Toggle new day lines. These are atmospheric messages written with darker text.', name: 'new day lines', id: 'new day lines' });
                str += "<br>" + G.writeSettingButton({ text: 'Toggle research messages', tooltip: 'Toggle messages that tell you what you have just researched.', name: 'research messages', id: 'research messages' }) +
                    G.writeSettingButton({ text: 'Toggle trait messages', tooltip: 'Toggle messages that inform you about traits that your civilization have just adopted.', name: 'trait messages', id: 'trait messages' }) +
                    G.writeSettingButton({ text: 'Toggle seasonal messages', tooltip: 'Toggle seasonal messages.', name: 'seasonal messages', id: 'seasonal messages' });
                str += "<br>" + G.writeSettingButton({ text: 'Toggle disease messages', tooltip: 'Toggle messages that inform you about diseases.', name: 'disease messages', id: 'disease messages' }) +
                    G.writeSettingButton({ text: 'Toggle tutorial messages', tooltip: 'Toggle tutorial messages.', name: 'tutorial messages', id: 'tutorial messages' }) +
                    G.writeSettingButton({ text: 'Toggle story messages', tooltip: 'Toggle story messages.', name: 'story messages', id: 'story messages' });
                str += "<br>" + G.writeSettingButton({ text: 'Toggle accident messages', tooltip: 'Toggle messages that inform you about accidents in workplaces.', name: 'accident messages', id: 'accident messages' }) +
                    G.writeSettingButton({ text: 'Toggle homelessness messages', tooltip: 'Toggle messages related to homelessness.', name: 'homelessness messages', id: 'homelessness messages' }) +
                    G.writeSettingButton({ text: 'Toggle exploration messages', tooltip: 'Toggle messages related to exploration.', name: 'exploration messages', id: 'exploration messages' });
                str += "<br>" + G.writeSettingButton({ text: 'Toggle lost messages', tooltip: 'Toggle messages related to losing your units.', name: 'lost messages', id: 'lost messages' }) +
                    G.writeSettingButton({ text: 'Toggle wonder messages', tooltip: 'Toggle messages generated by wonders.', name: 'wonder messages', id: 'wonder messages' }) +
                    G.writeSettingButton({ text: 'Toggle relic messages', tooltip: 'Toggle messages related to relics (from archaeologists).', name: 'relic messages', id: 'relic messages' }) +
                    G.writeSettingButton({ text: 'Toggle drought messages', tooltip: 'Toggle messages giving info about droughts in your world.', name: 'drought messages', id: 'drought messages' });
                str += "<br>" + G.writeSettingButton({ text: 'Toggle annual messages', tooltip: 'Toggle annual reports that tell you about your tribe.', name: 'annual raports', id: 'annual raports' });
                str += "<br>" + G.writeSettingButton({ text: 'Toggle fools mode', tooltip: 'You\'d be a fool to think it\'s April Fools.', name: 'fools', id: 'fools' });
            } else {
                str += "<b>Perform three ascensions to unlock the message filter.</b>";
            }
            str += '<div class="divider"></div>' +
                '<div class="buttonBox">' +
                G.dialogue.getCloseButton() +
                '</div>';
            return str;
        }
        G.buildTabs = function () {
            var str = '';
            str += '<div id="sectionTabs" class="tabList"></div>';
            str += '<div id="mapBreakdown"></div>';
            str += '<div id="mapSection"></div>';
            for (var i in G.tabs) { G.tabs[i].div = G.tabs[i].id + 'Div'; str += '<div id="' + G.tabs[i].div + '" class="subsection' + (G.tabs[i].noScroll ? ' noScroll' : '') + '"></div>'; }
            l('sections').innerHTML = str;
            G.buildMapDisplay();
            var str = '';
            for (var i in G.tabs) { str += '<div id="tab-' + G.tabs[i].id + '" class="tab bgMid' + (G.tabs[i].addClass ? ' ' + G.tabs[i].addClass : '') + '">' + G.tabs[i].name + '</div>'; }
            l('sectionTabs').innerHTML = str;
            for (var i in G.tabs) {
                G.tabs[i].l = l('tab-' + G.tabs[i].id);
                G.tabs[i].l.onclick = function (tab) { return function () { G.playSound(orteilURL + 'buy3.mp3'); G.setTab(tab); }; }(G.tabs[i]);
                if (G.tabs[i].desc) G.addTooltip(G.tabs[i].l, function (tab) { return function () { return tab.desc; }; }(G.tabs[i]), { offY: -8 });
            }
            G.setTab(G.tabs[0]);
        }
        function linearDisplay(tab) {
            G.setSetting('linearD' + tab[0], !G.getSetting('linearD' + tab[0]));
        }
        /////////////MODIFYING POLCIIES TAB ... and policies

        G.policyCategories.push(
            { id: 'debug', name: 'Debug' },
            { id: 'food', name: 'Food' },
            { id: 'work', name: 'Work' },
            { id: 'population', name: 'Population' },
            { id: 'faith', name: 'Faith' },
            { id: 'prod', name: 'Production' },
            { id: 'mag', name: 'Magix utilities' },
            { id: 'trial', name: 'Trials' },
            { id: 'pantheon', name: '<font color="#d4af37">----- Pantheon -----</font>' }
        );
        G.update['policy'] = function () {
            if (G.has('policies')) {
                var str = '';
                str +=
                    '<div class="regularWrapper">' +
                    G.textWithTooltip('?', '<div style="width:240px;text-align:left;"><div class="par">Policies help you regulate various aspects of the life of your citizens.</div><div class="par">Some policies provide multiple modes of operation, while others are simple on/off switches.</div><div class="par">Changing policies usually costs something, such as influence points or faith. Depending on how drastic or generous the change is, it may have an impact on your people\'s morale.</div></div>', 'infoButton') +
                    '<div class="fullCenteredOuter"><div id="policyBox" class="thingBox fullCenteredInner"></div></div></div>';
                str += '<div style="position:absolute;z-index:0;top:0px;left:0px;right:0px;text-align:right;"><div class="flourishL"></div>' +
                    G.button({
                        id: 'display',
                        text: '<span style="position:relative;width:20px;margin-left:-4px;margin-right:0px;z-index:10;font-weight:bold;">Wide display: ' + (G.getSetting('linearDp') == true ? '<font color="#bbffbb">ON</font>' : '<font color="#ffbbbb">OFF</font>') + '</span>',
                        tooltip: 'Toggle between displaying policy categories in bulk or one category per line.',
                        onclick: function () { linearDisplay('policy'); G.update['policy'](); }
                    });
                l('policyDiv').innerHTML = str;

                var strByCat = [];
                var len = G.policyCategories.length;
                for (var iC = 0; iC < len; iC++) {
                    strByCat[G.policyCategories[iC].id] = '';
                }
                var len = G.policy.length;
                for (var i = 0; i < len; i++) {
                    var me = G.policy[i];
                    if (me.visible && (me.category != 'debug' || G.getSetting('debug'))) {
                        if (!me.visible) continue;
                        var str = '';
                        var disabled = '';
                        if (me.binary && me.mode.id == 'off') disabled = ' off';
                        str += '<div class="' + (G.policy[i].category == 'pantheon' ? 'achiev' : 'policy') + ' thing' + (me.binary ? '' : ' expands') + ' wide1' + disabled + '" id="policy-' + me.id + '">' +
                            G.getIconStr(me, 'policy-icon-' + me.id) +
                            '<div class="overlay" id="policy-over-' + me.id + '"></div>' +
                            '</div>';
                        strByCat[me.category] += str;
                    }
                }

                var str = '';
                var len = G.policyCategories.length;
                for (var iC = 0; iC < len; iC++) {
                    if (G.policyCategories[iC].id == 'pantheon' && strByCat[G.policyCategories[iC].id] != '') {
                        str += '<div class="category" style="display:inline-block;width:75%;height:95%"><center><Div class="framed bgMid" style=\'width:75%;height:65%;background-image:url(img/cloudsBottom.png),url(' + magixURL + 'GoldenTheme/bgDarkRockGolden.jpg);animation:wonderCloudsDriftRight 180s infinite linear\'><div class="categoryName barred fancyText" id="policy-catName-' + iC + '"><font size="2" style="letter-spacing:3px">' + G.policyCategories[iC].name + '</font></div>' + strByCat[G.policyCategories[iC].id] + '</div></div><br>';
                    } else {
                        if (G.getSetting('linearDp') == true) {
                            if (strByCat[G.policyCategories[iC].id] != '') str += '<div class="category" style="display:inline-block;"><div class="categoryName barred fancyText" id="policy-catName-' + iC + '">' + G.policyCategories[iC].name + '</div>' + strByCat[G.policyCategories[iC].id] + '</div><br>';
                        } else {
                            if (strByCat[G.policyCategories[iC].id] != '') str += '<div class="category" style="display:inline-block;"><div class="categoryName barred fancyText" id="policy-catName-' + iC + '">' + G.policyCategories[iC].name + '</div>' + strByCat[G.policyCategories[iC].id] + '</div>';
                        }
                    }
                }
                l('policyBox').innerHTML = str;

                G.addCallbacks();

                var len = G.policy.length;
                for (var i = 0; i < len; i++) {
                    var me = G.policy[i];
                    if (me.visible) {
                        var div = l('policy-' + me.id); if (div) me.l = div; else me.l = 0;
                        if (G.policy[i].category == 'pantheon') {
                            div = l('policy-' + me.id); if (div) me.l = div; else me.l = 0;
                        }
                        var div = l('policy-icon-' + me.id); if (div) me.lIcon = div; else me.lIcon = 0;
                        var div = l('policy-over-' + me.id); if (div) me.lOver = div; else me.lOver = 0;
                        G.addTooltip(me.l, function (what) { return function () { return G.getPolicyTooltip(what) }; }(me), { offY: -8 });
                        if (me.l) { me.l.onclick = function (what) { return function (e) { if (e.which === 1) G.clickPolicy(what); }; }(me); }
                        if (me.l && !me.binary) { var div = me.l; div.onmousedown = function (policy, div) { return function () { G.selectModeForPolicy(policy, div); }; }(me, div); }
                    }
                }
            } else {
                var str = '';
                var strByCat = [];
                var len = G.policyCategories.length;
                for (var iC = 0; iC < len; iC++) {
                    strByCat[G.policyCategories[iC].id] = '';
                }
                var len = G.policy.length;
                for (var i = 0; i < len; i++) {
                    var me = G.policy[i];
                    if (me.visible && (me.category != 'debug' || G.getSetting('debug'))) {
                        var str = '';
                        var disabled = '';
                        if (me.binary && me.mode.id == 'off') disabled = ' off';
                        str += '<div class="' + (G.policy[i].category == 'pantheon' ? 'achiev' : 'policy') + ' thing' + (me.binary ? '' : ' expands') + ' wide1' + disabled + '" id="policy-' + me.id + '">' +
                            G.getIconStr(me, 'policy-icon-' + me.id) +
                            '<div class="overlay" id="policy-over-' + me.id + '"></div>' +
                            '</div>';
                        strByCat[me.category] += str;
                    }
                }

                var str = '';
                var len = G.policyCategories.length;
                str += '<div class="fullCenteredOuter"><div class="fullCenteredInner"><div class="barred fancyText"><center style="line-height: 1.25"><font size="2.5">Get the <font color="fuschia">Policies</font> trait to unlock this tab.<br>Policies are one of the main aspects of ruling a tribe.<br>Wait until you get this trait to learn more about them :)</font></center></div>';
                //for (var iC = 0; iC < len; iC++) {
                //    if (G.policyCategories[iC].id != 'mag') continue;
                //    else str += '<center><div class="category" style="display:inline-block;"><div class="categoryName barred fancyText" id="policy-catName-' + iC + '">' + G.policyCategories[iC].name + '</div>' + strByCat[G.policyCategories[iC].id] + '</div></div></div></center><br>';
                //}
                l('policyDiv').innerHTML = str;
                var len = G.policyCategories.length;
                var len = G.policy.length;
                for (var i = 0; i < len; i++) {
                    var me = G.policy[i];
                    if (me.visible) {
                        var div = l('policy-' + me.id); if (div) me.l = div; else me.l = 0;
                        var div = l('policy-icon-' + me.id); if (div) me.lIcon = div; else me.lIcon = 0;
                        var div = l('policy-over-' + me.id); if (div) me.lOver = div; else me.lOver = 0;
                        G.addTooltip(me.l, function (what) { return function () { return G.getPolicyTooltip(what) }; }(me), { offY: -8 });
                        if (me.l) { me.l.onclick = function (what) { return function (e) { if (e.which === 1) G.clickPolicy(what); }; }(me); }
                        if (me.l && !me.binary) { var div = me.l; div.onmousedown = function (policy, div) { return function () { G.selectModeForPolicy(policy, div); }; }(me, div); }
                    }
                }
            }
            G.draw['policy']();
        }
        //TRAIT TAB
        G.update['trait'] = function () {
            G.knowN = 0;
            G.traitN2 = 0;
            var c = 0;
            var len = G.traitsOwned.length;
            for (var i = 0; i < len; i++) {
                if (G.traitsOwned[i].trait.category == 'knowledge') G.knowN++;
                if (G.traitsOwned[i].trait.category == 'trial') c++;
                if (G.traitsOwned[i].trait.category != 'anomaly') G.traitN2++;
            }
            var str = '';
            str += '<div style=position:absolute;z-index:0;top:0px;left:0px;right:0px;text-align:right;"><div class="flourishL"></div>' +
                G.button({
                    id: 'display',
                    text: '<span style="position:relative;width:20px;margin-left:-4px;margin-right:0px;z-index:10;font-weight:bold;">Wide display: ' + (G.getSetting('linearDt') == true ? '<font color="#bbffbb">ON</font>' : '<font color="#ffbbbb">OFF</font>') + '</span>',
                    tooltip: 'Toggle between displaying trait categories in bulk or one category per line.',
                    onclick: function () { linearDisplay('trait'); G.update['trait']() }
                });
            if (G.traitN >= 15) {
                str += '<br><div class="flourishL"></div>';
                /*str+=G.writeSettingButton({
                    text:'Manage temporary traits',tooltip:'Spend influence to manipulate <b>temporary</b> traits.<br>You can remove one temporary trait per some period of time at a cost of 2/3 of your Authority level ('+G.selfUpdatingText(function(){return Math.floor(G.getRes('authority').amount*0.66);})+' Influence ). This option shows up after having currently 15 traits.<br>Also temporary traits that became permanent may also be removed but cooldown until next<br>available removal will be significantlly longer and will cost <b>max</b> available influence.<br><b>DO NOT think too carelessly while using up trait removal. Sometimes some traits that negatively affect your civilization may be a key to traits that will support you.</b>',name:'traitRemovalMode',id:'traitRemovalMode',style:'box-shadow:0px 0px 2px 1px #f00;'});*/
                str += G.button({
                    id: 'traitManagement',
                    name: 'traitManagement',
                    classes: G.getSetting('traitRemovalMode') ? ["on"] : [],
                    tooltip: 'Spend influence to manipulate <b>temporary</b> traits.<br>You can remove one temporary trait at the cost of 60% of your Authority level (' + G.selfUpdatingText(function () { return Math.floor(G.getRes('authority').amount * 0.6) }) + ' Influence). This option shows up after having 15 traits at the same time, and has a cooldown.<br>Also, temporary traits that became permanent may also be removed, but the cooldown until<br>your next available removal will be significantlly longer and will cost your <b>max</b> available influence.<br><b>Do NOT think too carelessly while using up trait removal.</b> (Sometimes, some traits that negatively affect your civilization may be a key to traits or unlocks that will support you.)',
                    text: 'Manage temporary traits',
                    style: 'box-shadow:-1px 0px 2px 2px red;',
                    onclick: function () {
                        G.setSetting('traitRemovalMode', !G.getSetting('traitRemovalMode'));
                        G.update['trait']();
                    }
                });

                str += G.selfUpdatingText(function () {
                    var t = G.influenceTraitRemovalCooldown > 0 ? '<br>Cooldown until the next available removal: <b><br>' : '';
                    if (G.influenceTraitRemovalCooldown > 0) {
                        if (G.has('time measuring 2/2')) t += G.BT(G.influenceTraitRemovalCooldown) + '</b>';
                        else if (G.has('time measuring 1/2')) t += ((G.influenceTraitRemovalCooldown / 300) <= 1 ? "Within a year" : G.BT(Math.floor(G.influenceTraitRemovalCooldown / 300) * 300)) + '</b>';
                        else t += 'Unknown'
                    }
                    return t;
                });

                str += '</div>';
            } else {
                G.setSetting('traitRemovalMode', false); //autodisable it
                str += '<br>Gain 15 traits to unlock an additional option.</div>';
            }

            l('traitDiv').innerHTML =
                G.textWithTooltip('?', '<div style="width:240px;text-align:left;"><div class="par">Traits define your civilization as a unique entity, giving small boosts and debuffs to various aspects of their lifestyles and beliefs.</div><div class="par">Your civilization gains random traits over time, consuming resources in the process.</div><div class="par">Events such as celebrations and disasters are also recorded here as memories that fade away over time and can be replaced by others.</div></div>', 'infoButton') +
                '<div class="fullCenteredOuter"><div class="fullCenteredInner"><div id="extraCultureStuff" style="text-align:center;margin-bottom:8px;"></div><div id="traitBox" class="thingBox"></div></div></div>';



            str += '<div id="civBlurb" class="framed bgMid" style="width:320px;margin:8px auto;padding:10px 16px 4px 16px;"></div>' +
                G.button({
                    tooltip: 'Lets you change the names of various things,<br>such as your civilization, your people, and yourself.', text: 'Rename civilization', onclick: function (e) {
                        G.dialogue.popup(function (div) {
                            var str =
                                '<div class="fancyText title">Name your civilization</div><div class="bitBiggerText scrollBox underTitle">' +
                                '<div class="fancyText par">Your name is ' + G.field({ text: G.getName('ruler'), tooltip: 'This is your name.', oninput: function (val) { G.setName('ruler', val); } }) + ', ruler of ' + G.field({ text: G.getName('civ'), tooltip: 'This is the name of your civilization.', oninput: function (val) { G.setName('civ', val); } }) + ' and the ' + G.field({ text: G.getName('civadj'), tooltip: 'This is an adjective pertaining to your civilization.', oninput: function (val) { G.setName('civadj', val); } }) + ' people.</div>' +
                                '<div class="fancyText par">One ' + G.field({ text: G.getName('inhab'), tooltip: 'This is the word used for someone who belongs to your civilization.', oninput: function (val) { G.setName('inhab', val); } }) + ' among other ' + G.field({ text: G.getName('inhabs'), tooltip: 'This is the plural of the previous word.', oninput: function (val) { G.setName('inhabs', val); } }) + ', you vow to lead your people to greatness and forge a legacy that will stand the test of time.</div>';
                            if (G.modsByName["Default dataset"]) {
                                if (G.has("plain island building"))
                                    str += '<div class="fancyText par">Your wizards also opened a portal to a new island that is called ' + G.field({ text: G.getName('island'), tooltip: "This is your name for the Plain Island", oninput: function (val) { G.setName('island', val); } }) + ".<br><br><br>";
                            }
                            str += '</div><div class="buttonBox">' +
                                G.dialogue.getCloseButton() +
                                '</div>';
                            return str;
                        }, 'wideDialogue')
                    }
                }) +
                '';
            l('extraCultureStuff').innerHTML = str;


            var strByCat = [];
            var len = G.knowCategories.length;
            for (var iC = 0; iC < len; iC++) {
                strByCat[G.knowCategories[iC].id] = '';
            }
            var len = G.traitsOwned.length;
            for (var i = 0; i < len; i++) {
                var me = G.traitsOwned[i];
                if (me.trait.category == 'knowledge') continue;
                var str = '';
                str += '<div class="thingWrapper" ' + (G.getSetting('traitRemovalMode') && me.trait.lifetime != undefined && (typeof (me.trait.lifetime) == "function" ? me.trait.lifetime() != undefined : me.trait.lifetime != undefined) ? 'style="box-shadow:-2px 0px 3px 3px #faa"' : "") + '>';
                str += '<div class="trait thing' + G.getIconClasses(me.trait) + '" id="trait-' + me.id + '">' +
                    G.getIconStr(me.trait, 'trait-icon-' + me.id) +
                    '<div class="overlay" id="trait-over-' + me.id + '"></div>' +
                    '</div>';
                str += '</div>';
                strByCat[me.trait.category] += str;
            }

            var str = '';
            var len = G.knowCategories.length;
            for (var iC = 0; iC < len; iC++) {
                if (G.knowCategories[iC].id == 'knowledge') continue;
                if (G.knowCategories[iC].id == 'trial' && c > 0) {
                    str += '<center><div class="fancyText" id="know-catName-' + iC + '"><font size="5">' + G.knowCategories[iC].name + '</font>' +//title
                        '<div class="fullCenteredOuter"><div class="fullCenteredInner"><div id="extraCultureStuff" style="text-align:center;margin-bottom:8px;"></div><div id="traitBox" class="thingBox"></div></div></div><br><br><br>' +
                        '<Div class="framed bgMid" style="width:240px"><div class="category" style="display:inline-block;width:240px">' + strByCat[G.knowCategories[iC].id] + '</div></div></center><br>'; continue
                };



                if ((G.knowCategories[iC].id == 'anomaly' && G.traitN - G.traitN2 > 0)) {
                    str += '<center><div class="fancyText" id="know-catName-' + iC + '"><font size="5">' + G.knowCategories[iC].name + '</font>' + G.textWithTooltip('&nbsp; <font size="3">?</font>', '<div style="width:240px;"><div class="par">Anomalies can occur at any time at any moment, making your game different and harder. Each run, a set of anomalies may be encountered, affecting the world in many ways. Increasing <b>pressure resistance</b> won\'t lower the chance of one. Some can trigger at any time.</div></div>', 'infoAnomalies') +//title
                        '<div class="fullCenteredOuter"><div class="fullCenteredInner"><div id="extraCultureStuff" style="text-align:center;margin-bottom:8px;"></div><div id="traitBox" class="thingBox"></div></div></div><br><br><br>' +
                        '<Div class="framed bgMid" style="width:240px"><div class="category" style="display:inline-block;width:240px">' + strByCat[G.knowCategories[iC].id] + '</div></div></center><br>'; continue
                };
                if (G.getSetting('linearDt') == true) {
                    if (strByCat[G.knowCategories[iC].id] != '') str += '<div class="category" style="display:inline-block;"><div class="categoryName barred fancyText" id="know-catName-' + iC + '">' + G.knowCategories[iC].name + '</div>' + strByCat[G.knowCategories[iC].id] + '</div></div><br>';
                } else {
                    if (strByCat[G.knowCategories[iC].id] != '') str += '<div class="category" style="display:inline-block;"><div class="categoryName barred fancyText" id="know-catName-' + iC + '">' + G.knowCategories[iC].name + '</div>' + strByCat[G.knowCategories[iC].id] + '</div>';
                }
            }
            if (str == '') str += '<div class="fancyText bitBiggerText">Your civilization does not have any traits yet.<br>It will develop some over time!</div>';
            l('traitBox').innerHTML = str;

            G.addCallbacks();

            var len = G.traitsOwned.length;
            for (var i = 0; i < len; i++) {
                var me = G.traitsOwned[i];
                var div = l('trait-' + me.id); if (div) me.l = div; else me.l = 0;
                var div = l('trait-icon-' + me.id); if (div) me.lIcon = div; else me.lIcon = 0;
                var div = l('trait-over-' + me.id); if (div) me.lOver = div; else me.lOver = 0;
                G.addTooltip(me.l, function (what) { return function () { return G.getKnowTooltip(what) }; }(me.trait), { offY: -8 });
                if (me.l) me.l.onclick = function (what) { return function (e) { if (e.which === 1) G.clickTrait(what); }; }(me);
            }

            G.draw['trait']();
        }

        //TECH TAB
        G.update['tech'] = function () {
            var str = '';
            str +=
                '<div class="behindBottomUI">' +
                G.textWithTooltip('?', '<div style="width:240px;text-align:left;"><div class="par">Technologies are the cornerstone of your civilization\'s long-term development.</div><div class="par">Here, you can invest resources to research new technologies, which can unlock new units and enhance old ones. <div class="par">If you own 30 or more technologies then after many researches purchased, you will gain 1 <b>Science</b> and <b>Education</b>.</div></div></div>', 'infoButton') +
                //'<div class="fullCenteredOuter"><div id="techBox" class="thingBox fullCenteredInner"></div></div></div>'+
                '<div class="fullCenteredOuter"><div class="fullCenteredInner"><div id="extraTechStuff" style="text-align:center;margin:auto;margin-bottom:8px;width:200px;"><div class="barred fancyText">Known technologies:</div></div><div id="techBox" class="thingBox"></div></div></div></div>' +
                '<div id="techUI" class="bottomUI bgPanelUp">';

            str += G.writeChooseBoxes('tech');

            str += '</div>';
            l('techDiv').innerHTML = str;

            G.addCallbacks();

            var str = '';
            if (G.getSetting('tieredDisplay')) { //idk why this was commented out
                //tiered display
                for (var i in G.techByTier) {
                    str += '<div><div style="width:32px;height:52px;display:inline-block;"><div class="fullCenteredOuter"><div class="fullCenteredInner fancyText bitBiggerText">' + i + '</div></div></div>&nbsp;&nbsp;&nbsp;&nbsp;';
                    for (var ii in G.techByTier[i]) {
                        var me = G.techByTier[i][ii];
                        str += '<div class="tech thing' + G.getIconClasses(me) + '' + (G.has(me.name) ? '' : ' off') + '" id="tech-' + me.id + '">' +
                            G.getIconStr(me, 'tech-icon-' + me.id) +
                            '<div class="overlay" id="tech-over-' + me.id + '"></div>' +
                            '</div>';
                    }
                    str += '</div>';
                }
                l('techBox').innerHTML = str;
                for (var i in G.techByTier) {
                    for (var ii in G.techByTier[i]) {
                        var me = G.techByTier[i][ii];
                        var div = l('tech-' + me.id); if (div) me.l = div; else me.l = 0;
                        var div = l('tech-icon-' + me.id); if (div) me.lIcon = div; else me.lIcon = 0;
                        var div = l('tech-over-' + me.id); if (div) me.lOver = div; else me.lOver = 0;
                        G.addTooltip(me.l, function (what) { return function () { return G.getKnowTooltip(what) }; }(me), { offY: -8 });
                        if (me.l) me.l.onclick = function (what) {
                            return function (e) {
                                if (e.which === 1) {
                                    //G.clickTech(what);
                                    for (var i in G.tech) {
                                        //highlight ancestors and descendants of the tech
                                        if (what.ancestors.includes(G.tech[i])) l('tech-' + G.tech[i].id).classList.add('highlit');
                                        else l('tech-' + G.tech[i].id).classList.remove('highlit');
                                        if (G.tech[i].ancestors.includes(what) && G.tech[i] != what) l('tech-' + G.tech[i].id).classList.add('highlitAlt');
                                        else l('tech-' + G.tech[i].id).classList.remove('highlitAlt');
                                        G.tooltip.close();
                                    };
                                };
                            };
                        }(me);
                    }
                }
            } else {
                var len = G.techsOwned.length;
                var miscTechs = [];

                for (var i = 0; i < len; i++) {
                    var me = G.techsOwned[i];
                    if (me.tech.category == 'misc') miscTechs.push(me);
                    if (me.tech.category != 'misc') {
                        str += '<div class="tech thing' + G.getIconClasses(me.tech) + '" id="tech-' + me.id + '">' +
                            G.getIconStr(me.tech, 'tech-icon-' + me.id) +
                            '<div class="overlay" id="tech-over-' + me.id + '"></div>' +
                            '</div>';
                    }
                }
                var len = G.traitsOwned.length;
                var knows = [];

                for (var i = 0; i < len; i++) {
                    var me = G.traitsOwned[i];
                    if (me.trait.category == 'knowledge') {
                        knows.push(me);
                    }
                }
                G.miscTechN = miscTechs.length;
                G.knowN = knows.length;
                for (var i in knows) {
                    if (i == 0) {
                        str += '<div class="fullCenteredOuter"><div class="fullCenteredInner"><div id="extraTechStuff" style="text-align:center;margin:auto;margin-bottom:8px;width:200px;"><div class="barred fancyText">' +
                            'Knowledges' +
                            '</div></div>(in other words, technologies that act like <u>traits</u>)<div id="traitBox" class="thingBox"></div></div></div></div>';
                    }
                    var me = knows[i];
                    str += '<div class="trait thing' + G.getIconClasses(me.trait) + '" id="trait-' + me.id + '">' +
                        G.getIconStr(me.trait, 'trait-icon-' + me.id) +
                        '<div class="overlay" id="trait-over-' + me.id + '"></div>' +
                        '</div>';
                }
                for (var i in miscTechs) {
                    if (i == 0) {
                        str += '<div class="fullCenteredOuter"><div class="fullCenteredInner"><div id="extraTechStuff" style="text-align:center;margin:auto;margin-bottom:8px;width:200px;"><div class="barred fancyText">' +
                            'Starter upgrades/Miscellaneous' +
                            '</div></div>(do not count towards your total researches)<div id="techBox" class="thingBox"></div></div></div></div>';
                    }
                    var me = miscTechs[i];
                    str += '<div class="tech thing' + G.getIconClasses(me.tech) + '" id="tech-' + me.id + '">' +
                        G.getIconStr(me.tech, 'tech-icon-' + me.id) +
                        '<div class="overlay" id="tech-over-' + me.id + '"></div>' +
                        '</div>';
                }
                l('techBox').innerHTML = str;
                var len = G.techsOwned.length;
                for (var i = 0; i < len; i++) {
                    var me = G.techsOwned[i];
                    var div = l('tech-' + me.id); if (div) me.l = div; else me.l = 0;
                    var div = l('tech-icon-' + me.id); if (div) me.lIcon = div; else me.lIcon = 0;
                    var div = l('tech-over-' + me.id); if (div) me.lOver = div; else me.lOver = 0;
                    G.addTooltip(me.l, function (what) { return function () { return G.getKnowTooltip(what) }; }(me.tech), { offY: -8 });
                    if (me.l) me.l.onclick = function (what) { return function (e) { if (e.which === 1) G.clickTech(what); }; }(me);
                }
                var len = G.traitsOwned.length;
                for (var i = 0; i < len; i++) {
                    var me = G.traitsOwned[i];
                    var div = l('trait-' + me.id); if (div) me.l = div; else me.l = 0;
                    var div = l('trait-icon-' + me.id); if (div) me.lIcon = div; else me.lIcon = 0;
                    var div = l('trait-over-' + me.id); if (div) me.lOver = div; else me.lOver = 0;
                    G.addTooltip(me.l, function (what) { return function () { return G.getKnowTooltip(what) }; }(me.trait), { offY: -8 });
                    if (me.l) me.l.onclick = function (what) { return function (e) { if (e.which === 1) G.clickTrait(what); }; }(me);
                }
            }
        }
        G.draw['tech']();

        /////////MODYFING UNIT TAB!!!!! (so some "wonders" which are step-by-step buildings now will have displayed Step-by-step instead of wonder. Same to portals)

        G.update['unit'] = function () {
            l('unitDiv').innerHTML =
                G.textWithTooltip('<big>?</big>', '<div style="width:240px;text-align:left;"><div class="par"><li>Units are the core of your resource production and gathering.</li></div><div class="par">Units can be <b>queued</b> for purchase by clicking on them; they will then automatically be created over time until they reach the queued amount. Creating units usually takes up resources such as workers or tools; resources shown in red in the tooltip are resources you do not have enough of.<div class="bulleted">click a unit to queue 1</div><div class="bulleted">right-click or ctrl-click to remove 1</div><div class="bulleted">shift-click to queue 50</div><div class="bulleted">shift-right-click or ctrl-shift-click to remove 50</div></div><div class="par">Units usually require some resources to be present; a <b>building</b> will crumble if you do not have the land to support it, or it could go inactive if you lack the workers or tools (it will become active again once you fit the requirements). Some units may also require daily <b>upkeep</b>, such as fresh food or money, without which they will go inactive.</div><div class="par">Furthermore, workers will sometimes grow old, get sick, or die, removing a unit they\'re part of in the process.</div><div class="par">Units that die off will be automatically replaced until they match the queued amount again.</div><div class="par">Some units have different <b>modes</b> of operation, which can affect what they craft or how they act; you can use the small buttons next to such units to change those modes and do other things. One of those buttons is used to <b>split</b> the unit into another stack; each stack can have its own mode.</div></div>', 'infoButton') +
                '<div style="position:absolute;z-index:100;top:0px;left:0px;right:0px;text-align:center;"><div class="flourishL"></div>' +
                G.button({
                    id: 'removeBulk',
                    text: '<span style="position:relative;width:9px;margin-left:-4px;margin-right:-4px;z-index:10;font-weight:bold;">-</span>',
                    tooltip: 'Divide by 10',
                    onclick: function () {
                        var n = G.getSetting('buyAmount');
                        if (G.keys[17]) n = -n;
                        else {
                            if (n == 1) n = -1;
                            else if (n < 1) n = n * 10;
                            else if (n > 1) n = n / 10;
                        }
                        n = Math.round(n);
                        n = Math.max(Math.min(n, 1e+35), -1e+35);
                        G.setSetting('buyAmount', n);
                        G.updateBuyAmount();
                        G.playSound(orteilURL + 'press.mp3');
                    },
                }) +
                '<div id="buyAmount" class="bgMid framed" style="width:128px;display:inline-block;padding-left:8px;padding-right:8px;font-weight:bold;">...</div>' +
                G.button({
                    id: 'addBulk',
                    text: '<span style="position:relative;width:9px;margin-left:-4px;margin-right:-4px;z-index:10;font-weight:bold;">+</span>',
                    tooltip: 'Multiply by 10',
                    onclick: function () {
                        var n = G.getSetting('buyAmount');
                        if (G.keys[17]) n = -n;
                        else {
                            if (n == -1) n = 1;
                            else if (n > -1) n = n * 10;
                            else if (n < -1) n = n / 10;
                        }
                        n = Math.round(n);
                        n = Math.max(Math.min(n, 1e+35), -1e+35);
                        G.setSetting('buyAmount', n);
                        G.updateBuyAmount();
                        G.playSound(orteilURL + 'press.mp3');
                    }
                }) + '<div class="flourishR"></div>' +
                (G.modsByName['Default dataset'] ? (G.traitsOwnedNames.indexOf('t11') > 0 ? '<br>' + G.button({
                    id: "t11", //<span style="position:relative;width:9px;margin-left:-4px;margin-right:-4px;z-index:10;font-weight:bold;">
                    text:
                        '</span>Buy<img class="pixelate" src="' + magixURL + 'ico1.png" style="vertical-align:top;" width="16" height="16"/>',
                    tooltip:
                        'Buy <b>Golden insight</b><img class="pixelate" src="' + magixURL + 'ico1.png" style="vertical-align:top;" width="16" height="16"/> for ' + ((G.getRes("trial point").amount / 6) * ((G.achievByName['faithful'].won / 2) + 1)).toFixed(2) + ' <b>Faith</b> and ' + ((G.getRes("trial point").amount / 3) * ((G.achievByName['faithful'].won / 2) + 1)).toFixed(2) + ' <b>Insight</b>.<br>The cost of the next <b>Golden insight</b><img class="pixelate" src="' + magixURL + 'ico1.png" style="vertical-align:top;" width="16" height="16"/> will increase. Be careful!',
                    onclick: function (me) {
                        var faicost = (G.getRes("trial point").amount / 6) * ((G.achievByName['faithful'].won / 2) + 1);
                        var inscost = (G.getRes("trial point").amount / 3) * ((G.achievByName['faithful'].won / 2) + 1);
                        G.addTooltip(me, function () { return 'Buy <b>Golden insight</b><img class="pixelate" src="' + magixURL + 'ico1.png" style="vertical-align:top;" width="16" height="16"/> for ' + faicost.toFixed(2) + ' <b>Faith</b> and ' + inscost.toFixed(2) + ' <b>Insight</b>.<br>The cost of the next <b>Golden insight</b><img class="pixelate" src="' + magixURL + 'ico1.png" style="vertical-align:top;" width="16" height="16"/> will increase. Be careful!'; }, { offY: -8 })
                        if (G.getRes('golden insight').amount < G.getRes('wisdom').amount && G.getRes('faith').amount >= faicost && G.getRes('insight').amount >= inscost) {
                            G.lose('insight', inscost, 'exchange'); G.lose('faith', faicost, 'exchange');
                            G.gain('golden insight', 1, "purchase");
                            G.gain('trial point', 1, "purchase");
                            G.update['unit']();
                        } else {
                            G.middleText("<small>- Cannot afford -</small>");
                        }
                        G.playSound(orteilURL + 'press.mp3');
                    }
                }) : "") : "") +
                (G.modsByName['Default dataset'] && G.traitsOwnedNames.indexOf('t7') >= 0 && G.year > 0 ? "<div class='fancyText'><br>You\'ll need " + B(parseInt((G.achievByName['herbalism'].won == 0 ? 1 : 0.2 + G.achievByName['herbalism'].won) * (G.year / 1.5) * (G.getRes('population').amount / 4))) + " <font color='lime'>Herb essence</font> to please your people here.</div>" : "") +
                '<div style="position:absolute;z-index:0;top:0px;left:0px;right:0px;text-align:right;"><div class="flourishL"></div>' + (G.modsByName['Default dataset'] && G.traitsOwnedNames.indexOf('t5') >= 0 && G.year > 0 ? "<div class='fancyText'><br>You\'ll need " + B(parseInt((G.achievByName['unfishy'].won == 0 ? 1 : (0.8 + G.achievByName['unfishy'].won * 0.4)) * Math.pow(G.year * 0.6, 1.06) * G.getRes('population').amount * 3 + 1)) + " <font color='#cc0671'>Fruit</font> to please your people here and " + B(Math.pow(parseInt((G.achievByName['unfishy'].won == 0 ? 1 : (0.8 + G.achievByName['unfishy'].won * 0.4)) * Math.pow(G.year * 0.6, 1.06) * G.getRes('population').amount * 3 + 1), 0.95) - 1) + " <font color='#cc0671'>Seafood</font> to make Fishyar give water.</div>" : "") +
                '<div style="position:absolute;z-index:0;top:0px;left:0px;right:0px;text-align:right;"><div class="flourishL"></div>' +
                G.button({
                    id: 'display',
                    text: '<span style="position:relative;width:20px;margin-left:-4px;margin-right:0px;z-index:10;font-weight:bold;">Wide display: ' + (G.getSetting("linearDu") == true ? '<font color="#bbffbb">ON</font>' : '<font color="#ffbbbb">OFF</font>') + '</span>',
                    tooltip: 'Toggle between displaying unit categories in bulk or one category per line.',
                    onclick: function () { linearDisplay('unit'); G.update['unit']() }
                });
            l('unitDiv').innerHTML += '</center></div>' +

                '<div class="fullCenteredOuter" style="padding-top:16px;"><div id="unitBox" class="thingBox fullCenteredInner"></div></div>';

            /*
                -create an empty string for every unit category
                -go through every unit owned and add it to the string of its category
                -display each string under category headers, then attach events
            */
            var strByCat = [];
            var len = G.unitCategories.length;
            for (var iC = 0; iC < len; iC++) {
                strByCat[G.unitCategories[iC].id] = '';
            }
            var len = G.unitsOwned.length;
            for (var i = 0; i < len; i++) {
                var str = '';
                var me = G.unitsOwned[i];
                if (me.unit.visible == true) {
                    str += '<div class="thingWrapper">';
                    str += '<div class="unit thing' + G.getIconClasses(me.unit, true) + '" id="unit-' + me.id + '">' +
                        G.getIconStr(me.unit, 'unit-icon-' + me.id, 0, true) +
                        G.getArbitrarySmallIcon([0, 0], false, 'unit-modeIcon-' + me.id) +
                        '<div class="overlay" id="unit-over-' + me.id + '"></div>' +
                        '<div class="amount" id="unit-amount-' + me.id + '"></div>' +
                        '</div>';

                    if (me.unit.gizmos) {
                        str += '<div class="gizmos">' +
                            '<div class="' + (me.unit.mod.name == 'Elves' ? 'gizmoE' : 'gizmo') + ' gizmo1" id="unit-mode-' + me.id + '"></div>' +
                            '<div class="' + (me.unit.mod.name == 'Elves' ? 'gizmoE' : 'gizmo') + ' gizmo2' + (me.splitOf ? ' off' : '') + '" id="unit-split-' + me.id + '"></div>' +
                            '<div class="' + (me.unit.mod.name == 'Elves' ? 'gizmoE' : 'gizmo') + ' gizmo3" id="unit-percent-' + me.id + '"><div class="percentGizmo" id="unit-percentDisplay-' + me.id + '"></div></div>' +
                            '</div>';
                    }

                    str += '</div>';
                    strByCat[me.unit.category] += str;
                }
            }

            var str = '';
            var len = G.unitCategories.length;
            for (var iC = 0; iC < len; iC++) {
                if (strByCat[G.unitCategories[iC].id] != '') {
                    if (G.unitCategories[iC].id == 'wonder') str += '<br>';
                    if (G.getSetting("linearDu") == true)
                        str += '<div class="category" style="display:inline-block;"><div class="categoryName barred fancyText" id="unit-catName-' + iC + '">' + G.unitCategories[iC].name + '</div>' + strByCat[G.unitCategories[iC].id] + '</div><br>';
                    else str += '<div class="category" style="display:inline-block;"><div class="categoryName barred fancyText" id="unit-catName-' + iC + '">' + G.unitCategories[iC].name + '</div>' + strByCat[G.unitCategories[iC].id] + '</div>';
                }
            }
            l('unitBox').innerHTML = str;

            G.addCallbacks();


            G.addTooltip(l('buyAmount'), function () { return '<div style="width:320px;"><div class="barred"><b>Buy amount</b></div><div class="par">This is how many units you\'ll queue or unqueue at once in a single click.</div><div class="par">Click the + and - buttons to increase or decrease the amount. You can ctrl-click either button to instantly make the amount negative or positive.</div><div class="par">You can also ctrl-click a unit to unqueue an amount instead of queueing it, or shift-click to queue 50 times more.</div></div>'; }, { offY: -8 });

            G.updateBuyAmount();
            var len = G.unitsOwned.length;
            for (var i = 0; i < len; i++) {
                var me = G.unitsOwned[i];
                if (G.unitByName[G.unitsOwned[i].unit.name].visible == true) {
                    var div = l('unit-' + me.id); if (div) me.l = div; else me.l = 0;
                    var div = l('unit-icon-' + me.id); if (div) me.lIcon = div; else me.lIcon = 0;
                    var div = l('unit-over-' + me.id); if (div) me.lOver = div; else me.lOver = 0;
                    var div = l('unit-amount-' + me.id); if (div) me.lAmount = div; else me.lAmount = 0;
                    var div = l('unit-modeIcon-' + me.id); if (div) me.lMode = div; else me.lMode = 0;
                    if (me.lMode && me.mode.icon != undefined) { G.setIcon(me.lMode, me.mode.icon); me.lMode.style.display = 'block'; }
                    else if (me.lMode) me.lMode.style.display = 'none';
                    if (me.unit.gizmos) {
                        var div = l('unit-mode-' + me.id); div.onmousedown = function (unit, div) { return function () { G.selectModeForUnit(unit, div); }; }(me, div);
                        G.addTooltip(div, function (me, instance) { return function () { return 'Click or drag to change unit mode.<br>Current mode:<div class="info"><div class="fancyText barred infoTitle">' + (instance.mode.icon ? G.getSmallThing(instance.mode) : '') + '' + instance.mode.name + '</div>' + G.parse(instance.mode.desc) + '</div>'; }; }(me.unit, me), { offY: -8 });
                        var div = l('unit-split-' + me.id); div.onclick = function (unit, div) { return function () { if (G.speed > 0) G.splitUnit(unit, div); else G.cantWhenPaused(); }; }(me, div);
                        G.addTooltip(div, function (me, instance) { return function () { if (instance.splitOf) return 'Click to <u>remove</u> this stack of units.'; else return 'Click to <u>split</u> into another unit stack.<br>Different unit stacks can use different modes.' }; }(me.unit, me), { offY: -8 - 16 });
                        var div = l('unit-percent-' + me.id); div.onmousedown = function (unit, div) { return function () { if (G.speed > 0) G.selectPercentForUnit(unit, div); else G.cantWhenPaused(); }; }(me, div);
                        G.addTooltip(div, function (me, instance) { return function () { return 'Click or drag to set unit work capacity.<br>Well, actually, this feature isn\'t implemented yet.' }; }(me.unit, me), { offY: 8, anchor: 'bottom' });
                    }
                    G.addTooltip(me.l, function (me, instance) {
                        return function () {
                            var amount = G.getBuyAmount(instance);
                            if (me.wonder) amount = (amount > 0 ? 1 : -1);
                            if (me.wonder) {
                                var str = '<div class="info">';
                                str += '<div class="infoIcon"><div class="thing standalone' + G.getIconClasses(me, true) + '">' + G.getIconStr(me, 0, 0, true) + '</div></div>';
                                str += '<div class="fancyText barred infoTitle">' + me.displayName + '</div>';
                                switch (me.type) {
                                    case "portal": str += '<div class="fancyText barred" style="color:yellow;">Portal</div>'; break;
                                    case "stepByStep": str += '<div class="fancyText barred" style="color:#f0d;">Step-by-step building</div>'; break;
                                    case "tiered": str += '<div class="fancyText barred" style="color:lime">Tiered building</div>'; break;
                                    default: str += '<div class="fancyText barred" style="color:#c3f;">Wonder</div>'; break;
                                }
                                if (amount < 0) str += '<div class="fancyText barred">You cannot destroy wonders, step-by-step buildings, and portals.</div>';
                                else {
                                    if (instance.mode == 0) str += '<div class="fancyText barred">Unbuilt<br>Click to start construction (' + B(me.steps) + ' steps)</div>';
                                    else if (instance.mode == 1) str += '<div class="fancyText barred">Being constructed (at step ' + B(instance.percent) + '/' + B(me.steps) + ')<br>Click to pause construction</div>';
                                    else if (instance.mode == 2) str += '<div class="fancyText barred">' + (instance.percent == 0 ? ('Construction paused<br>Click to begin construction') : ('Construction paused at step ' + B(instance.percent) + '/' + B(me.steps) + '<br>Click to resume')) + '</div>';
                                    else if (instance.mode == 3) str += '<div class="fancyText barred">Requires final step<br>Click to perform!</div>';
                                    else if (instance.mode == 4 && me.type != 'wonder') { str += '<div class="fancyText barred">Completed<br>Click to ascend...</div>' } else { str += '<div class="fancyText barred">Completed!</div>' };
                                    //else if (amount<=0) str+='<div class="fancyText barred">Click to destroy</div>';
                                }
                                if (amount < 0) amount = 0;

                                if (instance.mode != 4) {
                                    str += '<div class="fancyText barred">';
                                    if (instance.mode == 0 && amount > 0) {
                                        if (!isEmpty(me.cost)) str += '<div>Initial cost: ' + G.getCostString(me.cost, true, false, amount) + '</div>';
                                        if (!isEmpty(me.use)) str += '<div>Uses: ' + G.getUseString(me.use, true, false, amount) + '</div>';
                                        if (!isEmpty(me.require)) str += '<div>Prerequisites: ' + G.getUseString(me.require, true, false, amount) + '</div>';
                                    }
                                    else if ((instance.mode == 1 || instance.mode == 2) && !isEmpty(me.costPerStep)) str += '<div>Cost per step: ' + G.getCostString(me.costPerStep, true, false, amount) + '</div>';
                                    else if (instance.mode == 3 && !isEmpty(me.finalStepCost)) str += '<div>Final step cost: ' + G.getCostString(me.finalStepCost, true, false, amount) + '</div>';
                                    str += '</div>';
                                }

                                if (me.desc) str += '<div class="infoDesc">' + G.parse(me.desc) + '</div>';
                                str += '</div>';
                                str += G.debugInfo(me);
                                return str;
                            }
                            else {
                                if (amount < 0) amount = Math.max(-instance.targetAmount, amount);
                                /*if (G.getSetting('buyAny'))
                                {
                                    var n=0;
                                    n=G.testAnyCost(me.cost);
                                    if (n!=-1) amount=Math.min(n,amount);
                                    n=G.testAnyUse(me.use,amount);
                                    if (n!=-1) amount=Math.min(n,amount);
                                    n=G.testAnyUse(me.require,amount);
                                    if (n!=-1) amount=Math.min(n,amount);
                                    n=G.testAnyUse(instance.mode.use,amount);
                                    if (n!=-1) amount=Math.min(n,amount);
                                    n=G.testAnyLimit(me.limitPer,G.getUnitAmount(me.name)+amount);
                                    if (n!=-1) amount=Math.min(n,amount);
                                }*/
                                var str = '<div class="info">';
                                //infoIconCompensated ?
                                str += '<div class="infoIcon"><div class="thing standalone' + G.getIconClasses(me, true) + '">' + G.getIconStr(me, 0, 0, true) + '</div>' +
                                    '<div class="fancyText infoAmount onLeft">' + B(instance.displayedAmount) + '</div>' +
                                    '<div class="fancyText infoAmount onRight" style="font-size:12px;">' + (instance.targetAmount != instance.amount ? ('queued:<br>' + B(instance.targetAmount - instance.displayedAmount)) : '') + (instance.amount > 0 ? ('<br>active:<br>' + B(instance.amount - instance.idle) + '/' + B(instance.amount)) : '') + '</div>' +
                                    '</div>';
                                str += '<div class="fancyText barred infoTitle">' + me.displayName + '</div>';
                                str += '<div class="fancyText barred">Click to ' + (amount >= 0 ? 'queue' : 'unqueue') + ' ' + B(Math.abs(amount)) + '</div>';
                                if (me.modesById[0]) { str += '<div class="fancyText barred">Current mode:<br><b>' + (instance.mode.icon ? G.getSmallThing(instance.mode) : '') + '' + instance.mode.name + '</b></div>'; }
                                str += '<div class="fancyText barred">';
                                if (!isEmpty(me.cost)) str += '<div>Cost: ' + G.getCostString(me.cost, true, false, amount) + '</div>';
                                if (!isEmpty(me.use) || !isEmpty(me.staff)) str += '<div>Uses: ' + G.getUseString(addObjects(me.use, me.staff), true, false, amount) + '</div>';
                                if (!isEmpty(me.require)) str += '<div>Prerequisites: ' + G.getUseString(me.require, true, false, amount) + '</div>';//should amount count?
                                if (!isEmpty(me.upkeep)) str += '<div>Upkeep: ' + G.getCostString(me.upkeep, true, false, amount) + '</div>';
                                if (!isEmpty(me.limitPer)) str += '<div>Limit: ' + G.getLimitString(me.limitPer, true, false, G.getUnitAmount(me.name) + amount) + '</div>';
                                if (isEmpty(me.cost) && isEmpty(me.use) && isEmpty(me.staff) && isEmpty(me.upkeep) && isEmpty(me.require)) str += '<div>Free</div>';
                                if (me.modesById[0] && !isEmpty(instance.mode.use)) str += '<div>Current mode uses: ' + G.getUseString(instance.mode.use, true, false, amount) + '</div>';
                                //   if (me.modesById[0] && !isEmpty(instance.mode.upkeep) && instance.mode.upkeep!='undefined') str+='<div>Current mode has upkeep : '+G.getUseString(instance.mode.upkeep,true,false,amount)+'</div>';
                                str += '</div>';
                                if (me.desc) str += '<div class="infoDesc">' + G.parse(me.desc) + '</div>';
                                str += '</div>';
                                str += G.debugInfo(me);
                                return str;
                            }
                        };
                    }(me.unit, me), { offY: -8 });
                    if (me.l) me.l.onclick = function (unit) {
                        return function (e) {
                            if (G.speed > 0) {
                                var amount = G.getBuyAmount(unit);
                                if (unit.unit.wonder) amount = (amount > 0 ? 1 : -1);
                                if (amount < 0) G.taskKillUnit(unit, -amount);
                                else if (amount > 0) G.taskBuyUnit(unit, amount, (G.getSetting('buyAny')));
                            } else G.cantWhenPaused();
                        };
                    }(me);
                    if (me.l) me.l.oncontextmenu = function (unit) {
                        return function (e) {
                            e.preventDefault();
                            if (G.speed > 0) {
                                var amount = -G.getBuyAmount(unit);
                                if (unit.unit.wonder) amount = (amount > 0 ? 1 : -1);

                                if (amount < 0) G.taskKillUnit(unit, -amount);

                                //else if (amount>0) G.buyUnit(unit,amount);
                            } else G.cantWhenPaused();
                        };
                    }(me);
                }
            }
        }
        G.draw['unit'] = function () {
            if (G.tab.id == 'unit') {
                var len = G.unitsOwned.length;
                for (var i = 0; i < len; i++) {
                    var me = G.unitsOwned[i];
                    if (me.lIcon && me.unit.getIcon) G.setIcon(me.lIcon, me.unit.getIcon(me));
                    if (me.l) {
                        if ((!me.unit.wonder && me.amount == 0) || (me.unit.wonder && (me.mode == 0 || me.mode == 2))) me.l.classList.add('zero');
                        else me.l.classList.remove('zero');
                    }
                    if (me.lAmount) {
                        if (me.unit.wonder) {
                            if (me.mode == 0) me.lAmount.innerHTML = '<font color="' + (G.modsByName['Default dataset'] ? 'fuschia' : '#99ff66') + '">Unbuilt</font>';
                            else if (me.mode == 3) me.lAmount.innerHTML = '<font color="' + (G.modsByName['Default dataset'] ? 'fuschia' : '#99ff66') + '">Ready</font>';
                            else if (me.mode == 4) me.lAmount.innerHTML = '<font color="' + (G.modsByName['Default dataset'] ? 'fuschia' : '#99ff66') + '">Complete</font>';
                            else me.lAmount.innerHTML = '<font color="' + (G.modsByName['Default dataset'] ? 'fuschia' : '#99ff66') + '">' + Math.round((me.percent / me.unit.steps) * 100) + '%</font>';
                        }
                        else {
                            var str = '<font color="' + (G.modsByName['Default dataset'] ? 'fuschia' : '#99ff66') + '" style="font-size:13px">' + B(Math.round(me.displayedAmount)) + '</font>';
                            if (me.idle) str = '<span style="opacity:0.8;font-size:13px;">' + B(Math.round(me.amount - me.idle)) + '</span>/' + str;
                            if (me.targetAmount - me.displayedAmount != 0) str = str + '<br><span style="opacity:0.8;">' + B(Math.round(me.targetAmount - me.displayedAmount)) + '</span>';
                            me.lAmount.innerHTML = str;
                        }
                    }
                    //me.displayedAmount+=(me.amount-me.displayedAmount)*0.25;
                    me.displayedAmount = me.amount;
                    if (G.drawT % 3 == 0) {
                        var popupsLen = me.popups.length;
                        if (popupsLen > 0) {
                            //work through the queue of icon popups and pop one at random
                            var bounds = me.l.getBoundingClientRect();
                            var posX = bounds.left + bounds.width / 2;
                            var posY = bounds.top;

                            var popupIndex = Math.floor(Math.random() * popupsLen);
                            G.showParticle({ x: posX, y: posY, icon: me.popups.splice(popupIndex, 1)[0] });
                            if (popupsLen > 10) me.popups = [];
                            if (G.tooltip.parent != me.l && G.getSetting('animations')) triggerAnim(me.l, 'plop');
                        }
                    }
                }
            }
        }
        /*==========================
        Extra Settings
        ==========================*/
        G.settings.push({ name: "linearDp", type: "toggle", def: 1, value: 1 }); //linear for policies
        G.settings.push({ name: "linearDt", type: "toggle", def: 1, value: 1 }); //linear for traits
        G.settings.push({ name: "linearDu", type: "toggle", def: 1, value: 1 }); //linear for units
        G.settings.push({ name: "sound", type: "toggle", def: 1, value: 1 }); //sounds
        G.settings.push({ name: "traitRemovalMode", type: "toggle", def: 0, value: 0 }); //trait removal mode

        /*Message filtering*/
        G.settings.push({ name: "birth messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "death messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "new day lines", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "research messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "trait messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "seasonal messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "disease messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "tutorial messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "story messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "accident messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "homelessness messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "exploration messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "lost messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "wonder messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "relic messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "drought messages", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "annual raports", type: "toggle", def: 1, value: 1 });
        G.settings.push({ name: "fools", type: "toggle", def: 0 });

        for (var i in G.settings) { G.settingsByName[G.settings[i].name] = G.settings[i]; }

        /*==========================
        CSS stuff
        ==========================*/
        document.getElementById("logo").style['background-image'] = 'url(' + magixURL + 'Magixlogo2.png)';
        document.getElementById("logoOverB").style['background-image'] = 'url(' + magixURL + 'Elves.png)';
        var cssId = 'utils';
        if (!document.getElementById(cssId)) {
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = magixURL2 + 'newMagix.css';
            link.media = 'all';
            head.appendChild(link);
        }
        setTimeout(tabs, 500)
        /*==========================
        Civ debug
        ==========================*/
        G.auratext = 0;




        /*==========================
        Modifying tooltips to make them more inclusive and functional
        ==========================*/
        G.getResTooltip = function (me, amountStr) {
            var str = '<div class="info">';
            str += '<div class="infoIcon"><div class="thing standalone' + G.getIconClasses(me, true) + '">' + G.getIconStr(me, 0, 0, true) + '</div><div class="fancyText infoAmount margined">' + (amountStr || me.getDisplayAmount()) + '</div></div>';
            str += '<div class="fancyText barred infoTitle">' + me.displayName + '</div>';
            if (me.partOf && !G.getDict(me.partOf).hidden) str += '<div class="fancyText barred">part of ' + G.getSmallThing(G.getDict(me.partOf)) + '</div>';
            if (me.limit) str += '<div class="fancyText barred">limit: ' + (G.getDict(me.limit)).getDisplayAmount() + ' ' + G.getSmallThing(G.getDict(me.limit)) + '</div>';
            if (!amountStr) {
                if (me.gained > 0 && me.gainedBy.length > 0) str += '<div class="fancyText barred" style="color:' + (me.colorGood != undefined ? me.colorGood : "#888") + ';">+' + B(me.gained, 1) + ' from ' + me.gainedBy.join(', ') + '</div>';
                else if (me.gained > 0) str += '<div class="fancyText barred" style="color:\'gray\';">+' + B(me.gained, 1) + '</div>';
                if (me.lost > 0 && me.lostBy.length > 0) str += '<div class="fancyText barred" style="color:' + (me.colorBad != undefined ? me.colorBad : "#888") + ';">-' + B(me.lost, 1) + ' from ' + me.lostBy.join(', ') + '</div>';
                else if (me.lost > 0) str += '<div class="fancyText barred" style="color:#f30;">-' + B(me.lost, 1) + '</div>';
            }
            if (me.desc) str += '<div class="infoDesc">' + G.parse(me.desc) + '</div>';
            str += '</div>';
            str += G.debugInfo(me);
            return str;
        }
        G.getKnowTooltip = function (me, showCost) {
            var str = '<div class="info">';

            var expiration = Math.floor(typeof (me.lifetime) === 'function' ? me.yearOfObtainment + me.lifetime() + 1 : me.yearOfObtainment + me.lifetime + 1);
            var lt = typeof (me.lifetime) === 'function' ? me.lifetime() : me.lifetime;
            if (G.getSetting('traitRemovalMode') && G.tab.id == 'trait') //display only when this mode is active
                if (G.tab.id = 'trait' && lt == undefined) str += '<small><font color="#fcc"><center>This trait <u>cannot</u> be managed</center></font></small>';
                else str += '<small><font color="#cfc"><center>This trait <u>can</u> be managed</center></font></small>';
            str += '<div class="infoIcon"><div class="thing standalone' + G.getIconClasses(me, true) + '">' + G.getIconStr(me, 0, 0, true) + '</div></div>';
            str += '<div class="fancyText barred infoTitle">' + me.displayName + '</div>';
            if (me.desc) str += '<div class="infoDesc">' + G.parse(me.desc) + '</div>';
            if ((G.getSetting('debug') || G.getSetting('showLeads')) && me.precededBy.length > 0) {
                var reqStr = [];
                for (var i in me.precededBy) { reqStr.push(me.precededBy[i].displayName); }
                str += '<div class="fancyText barred">Requisites:<br>' + reqStr.join(', ') + '</div>';
            }
            if ((G.getSetting('debug') || G.getSetting('showLeads')) && me.leadsTo.length > 0) {
                var leadsToStr = [];
                for (var i in me.leadsTo) { leadsToStr.push(me.leadsTo[i].displayName); }
                str += '<div class="fancyText barred">Leads to:<br>' + leadsToStr.join(', ') + '</div>';
            }
            if (me.lifetime != undefined && lt != undefined) {
                str += '<font color="#bbb"><li><small>';

                str += G.has('time measuring 1/2') ? 'Year of obtainment: ' + (me.yearOfObtainment + 1) + '. ' : 'This trait is temporary. ';
                if (expiration != Infinity)
                    str += G.has('time measuring 1/2') ? 'This trait will expire during year ' + expiration + '.' : 'This trait will expire ';
                else str += "This trait has become permanent.";
                if (!G.has('time measuring 1/2') && expiration != Infinity)
                    str += (me.lifetime > 10 ? me.lifetime > 100 ? 'in a very long time.' : 'after a while.' : 'soon.');
                str += '</small></li></font>';
            }
            str += '</div>';
            if (showCost || G.getSetting('debug')) {
                var costData = G.getCostString(me.cost, true);
                if (costData.length > 0) {
                    str += '<div class="info">Cost: ' + costData + '</div>';
                }
            }
            if (G.getSetting('debug') && G.tab.id == 'trait' && isFinite(me.chance)) {
                str += !G.req || G.req.tribalism !== false ? 'Chance: ' + (300 / me.chance).toFixed(3) : "This trait cannot be obtained normally.";
            }

            str += G.debugInfo(me);

            return str;
        }
        /*==========================
        Top interface
        ==========================*/
        G.createTopInterface = function () {
            var i = 0;
            if (G.year % 40 >= 20) i = 39 - G.year % 40;
            else { i = G.year % 40 };
            var str = '';
            str += '<div class="flourishL"></div><div class="framed fancyText bgMid" style="display:inline-block;height:32px;font-size:18px;padding:5px;font-variant:small-caps" id="date">-</div>';
            if (G.modsByName['Elves']) {
                if (G.has('Ice') || G.has('warmth') || G.has('earth') || G.has('mystic') || G.has('water')) {
                    str += '<div class="pixelate framed" style="height:36px;width:36px;padding:0;margin-bottom:-13px;display:inline-block;background:url(' + magixURL + 'Empowerments.png);background-position-x:' + (32 * (G.year % 40)) + 'px; background-position-y:' + -(32 * (G.auratext + 1)) + 'px" id="empower"></div><br>';
                } else {
                    str += '<div class="pixelate framed" style="height:36px;width:36px;padding:0;margin-bottom:-13px;display:inline-block;background:url(' + magixURL + 'Empowerments.png)" id="empower"></div><br>';
                }
            } else str += '<br>';
            str += '<div class="flourish2L"></div>' +
                '<div id="fastTicks" class="framed" style="display:inline-block;padding-left:8px;padding-right:8px;font-weight:bold;">0 fast ticks</div>' +
                G.button({
                    id: 'pauseButton',
                    text: '<div class="image" style="width:9px;background:url(img/playButtons.png) 0px 0px;"></div>',
                    tooltip: 'Time will be stopped.<br>Generates fast ticks.',
                    onclick: function () {
                        if (G.getSetting('paused') == false) { //prevent playsound if nothing changes
                            G.playSound(orteilURL + 'press.mp3');
                        }
                        G.setSetting('paused', 1);
                    }
                }) +
                G.button({
                    id: 'playButton',
                    text: '<div class="image" style="width:9px;background:url(img/playButtons.png) -11px 0px;"></div>',
                    tooltip: 'Time will pass by normally, with 1 day passing every second.',
                    onclick: function () {
                        if ((G.getSetting('paused') == true || G.getSetting('fast') == true)) { //prevent playsound if nothing changes
                            G.playSound(orteilURL + 'press.mp3');
                        }
                        G.setSetting('paused', 0); G.setSetting('fast', 0);
                    }
                }) +
                G.button({
                    id: 'fastButton',
                    text: '<div class="image" style="width:9px;background:url(img/playButtons.png) -21px 0px;"></div>',
                    tooltip: 'Time will go by about 30 times faster: 1 month every second.<br>Uses up fast ticks.<br>May lower browser performance while active.',
                    onclick: function () {
                        if (G.getSetting('fast') == false) { //prevent the sound from playing if nothing changes
                            G.playSound(orteilURL + 'press.mp3');
                        }
                        if (G.fastTicks > 0) {
                            G.setSetting('paused', 0);
                            G.setSetting('fast', 1);
                        }
                    }
                }) +
                '<div class="flourish2R"></div>';

            l('topInterface').innerHTML = str;
            if (l('date') != null)
                G.addTooltip(l('date'), function () { return '<div class="barred">Date</div><div class="par">This is the current date in your civilization.<br>One day elapses every second, and 300 days make up a year.</div>'; }, { offY: -8 });
            G.addTooltip(l('fastTicks'), function () { return '<div class="barred">Fast ticks</div><div class="par">This is how many in-game days you can run at fast speed.</div><div class="par">You gain a fast tick for every second you\'re paused or offline.</div><div class="par">You also gain fast ticks every time you research a technology.</div><div class="divider"></div><div class="par">You currently have <b>' + BT(G.fastTicks) + '</b> of game time saved up,<br>which will execute in <b>' + BT(G.fastTicks / 30) + '</b> at fast speed,<br>advancing your civilization by <b>' + G.BT(G.fastTicks) + '</b>.</div>'; }, { offY: -8 });
            var empowermentsDesc = [
                '<div class="barred">Current aura: <font color="#ccccff">Ice</b></div><br><B>Effects of ice in its current phase:</b><br><li>Your food gathering is decreased by ' + (3 * i).toFixed(2) + '%.</li><li>Firekeepers are ' + (0.75 * i).toFixed(2) + '% less efficient.</li><li>You gain ' + (0.25 * i).toFixed(2) + '% more fresh water.</li><li>Water and food spoils ' + (0.6 * i).toFixed(2) + '% slower.</li><li>You gain ' + (0.2 * i).toFixed(2) + '% more ice from digging.</li></font>',
                '<div class="barred">Current aura: <font color="#f0bb6c">Warmth</b></div><br><B>Effects of warmth in its current phase:</b><br><li>Your water gathering is decreased by ' + (2.4 * i).toFixed(2) + '%.</li><li>Fishing is ' + (0.75 * i).toFixed(2) + '% less efficient.</li><li>Food spoilage is ' + (0.4 * i).toFixed(2) + '% faster and gathering is ' + (0.4 * i) + '% less efficient.</li><li>The efficiency of farms and florists is decreased by ' + (0.4 * i).toFixed(2) + '%.</li></font>',
                '<div class="barred">Current aura: <font color="#c3bbcf">Earth</b></div><br><B>Effects of earth in its current phase:</b><br><li>Units using land waste/collapse ' + (30 * i) + '% more often.</li><li>Furnaces and blacksmiths are ' + (0.2 * i).toFixed(2) + '% more efficient.</li><li>Mines and quarries are ' + (0.1 * i).toFixed(2) + '% more efficient.</li><li>The accident rate for mining units is increased by ' + (8 * i).toFixed(2) + '%.</li><li>When the Earth aura is the most powerful, all accidents in mines and quarries become very violent (before and after for 3 years),<br>so it has very large chance to kill instead of just wounding workers.</li><br><li>With such unstable ground, archaeologists become ' + (0.2 * i).toFixed(2) + '% slower.</li></font>',
                '<div class="barred">Current aura: <font color="#fa7df2">Mystic</b></div><br><B>Effects of mystic in its current phase:</b><br><li>All non-magic resources decay ' + (6 + (1 * i)).toFixed(2) + '% faster.</li><li>Magical units are ' + (2 * i).toFixed(2) + '% more efficient.</li><li>Disease and death rate increased by ' + (5 + (1 * i)).toFixed(2) + '%.</li><li>Every year, one random resource gets totally wiped!br>(<b>Warning:</b>if the choice will land on any essentials, it will<br>wipe all other essentials except those that<br>limit the amount of other essentials.)</li></font>',
                '<div class="barred">Current aura: <font color="#4d88ff">Water</b></div><br><B>Effects of water in its current phase:</b><br><li>Farm efficiency is increased by ' + (2 * i).toFixed(2) + '%.</li><li>Diggers,mines and quarries are ' + (2.5 * i).toFixed(2) + '% less efficient.</li><li>Wells gain ' + (0.6 * i).toFixed(2) + '% more fresh water.</li><li>Water spoils ' + (0.25 * i).toFixed(2) + '% faster.</li><li>There are ' + (0.2 * i).toFixed(2) + '% more mushrooms.</li></font>',
            ];
            if (G.modsByName['Elves']) {
                if (G.has('Ice') || G.has('warmth') || G.has('earth') || G.has('mystic') || G.has('Water')) {
                    G.addTooltip(l('empower'), function () { return '<div class="barred">Aura</div><div class="par">Auras affect you by the effects of <b>Pressure</b>.</div><div class="par"> Auras have cycles and trigger at year ' + (236 - G.techN - G.traitN) + '.</div><div class="par">There are 5 different auras.<br>Each one boosts and weakens some things and each one will persist through<br>the rest of this run.</div><div class="par">Auras cycle, so the aura\'s power will be at its peak during the middle of a cycle.</div>' + empowermentsDesc[G.auratext] });
                } else {
                    G.addTooltip(l('empower'), function () { return (G.achievByName["druidish heart"].won > 0 ? '<div class="barred">???</div><div class="par">' + (G.has("time measuring 1/2") ? 'Once year ' + (236 - G.techN - G.traitN) : 'Once this moment ') + 'strikes, you will see what\'s there.<br>For now, wait.</div>' : '<div class="barred">???</div><div class="par">Once it shows up, you will see what\'s there.<br>For now, wait.</div>') });
                }
            }
            l('fastTicks').onmouseover = function (e) {
                if (G.getSetting('debug')) {
                    l('fastTicks').style.cursor = 'pointer';
                } else {
                    l('fastTicks').style.cursor = null;
                }
            };
            l('fastTicks').onclick = function (e) {
                if (G.getSetting('debug')) {
                    //debug : gain fast ticks
                    G.fastTicks += 10 * G.getBuyAmount();
                    G.fastTicks = Math.max(0, G.fastTicks);
                }
            };

            G.addCallbacks();
            G.updateSpeedButtons();
        }
        /*==========================
        New run stuff
        ==========================*/
        if (G.modsByName['Elves']) {
            G.NewGameConfirm = function () {
                //the player has selected a starting location; launch the game properly
                //G.Reset();
                G.sequence = 'main';
                G.T = 0;

                G.rememberAchievs = true;
                for (var i in G.savedAchievs) {
                    //reload achievements
                    if (G.modsByName[i] && G.modsByName[i].achievs) {
                        for (var ii in G.savedAchievs[i]) {
                            if (G.modsByName[i].achievs[ii]) G.modsByName[i].achievs[ii].won = G.savedAchievs[i][ii];
                        }
                    }
                }

                //init everything

                G.createMaps();

                for (var i in G.res) {
                    G.res[i].amount = G.res[i].startWith;
                }
                for (var i in G.tech) {
                    if (G.tech[i].startWith) G.gainTech(G.tech[i]);
                }
                for (var i in G.trait) {
                    if (G.trait[i].startWith) G.gainTrait(G.trait[i]);
                }
                for (var i in G.policy) {
                    if (G.policy[i].startWith) G.gainPolicy(G.policy[i]);
                }

                for (var i in G.res) {
                    var item = G.res[i]
                    if (item.tick) item.tick(item, G.tick);
                }

                G.runUnitReqs();
                G.runPolicyReqs();

                G.applyAchievEffects('new');

                G.updateEverything();
                G.createTopInterface();
                G.createDebugMenu();

                for (var i in G.unit) {
                    if (G.unit[i].startWith) { G.buyUnitByName(G.unit[i].name, G.unit[i].startWith); }
                }

                l('blackBackground').style.opacity = 0;

                G.setSetting('forcePaused', 0);
                G.setSetting('paused', 0);
                G.setSetting('fast', 0);

                G.animIntro = true;
                G.introDur = G.fps * 3;
                tabs();
                G.doFunc('new game');
            }
        }
        G.funcs['new game blurb 2'] = function () {
            document.title = 'Elf setup: NeverEnding Legacy';
            var str =
                '<b>Your tribe:</b><div class="thingBox">' +
                G.textWithTooltip('<div class="icon freestanding" style="' + G.getIconUsedBy(G.getRes('adult')) + '"></div><div class="freelabel">\xd75</div>', '5 Adults') +
                G.textWithTooltip('<div class="icon freestanding" style="' + G.getIconUsedBy(G.getRes('elder')) + '"></div><div class="freelabel">\xd71</div>', '1 Elder') +
                G.textWithTooltip('<div class="icon freestanding" style="' + G.getIconUsedBy(G.getRes('child')) + '"></div><div class="freelabel">\xd72</div>', '2 Children') +
                G.textWithTooltip('<div class="icon freestanding" style="' + G.getIconUsedBy(G.getRes('herbs')) + '"></div><div class="freelabel">\xd7175</div>', '175 Herbs') +
                G.textWithTooltip('<div class="icon freestanding" style="' + G.getIconUsedBy(G.getRes('water')) + '"></div><div class="freelabel">\xd7200</div>', '200 Water') +
                G.textWithTooltip('<div class="icon freestanding" style="' + G.getIconUsedBy(G.getRes('fruit')) + '"></div><div class="freelabel">\xd725</div>', '25 Fruits') +
                (G.resetsC2 > 0 ? G.textWithTooltip('<div class="icon freestanding" style="' + G.getIcon([7, 30, 'magixmod']) + '"></div><div class="freelabel"></div>', '<b>Complete achievements to<br>unlock more starting<br>bonuses for this race.</b>') : "") +
                '</div>' +
                '<div class="par fancyText bitBiggerText">Your tribe finds a place to settle in the mystic wilderness<br>and at the deep parts of the mysterious world.<br>Resources are scarce, and everyone starts foraging.<br>They are insecure.</div>' +
                '<div class="par fancyText bitBiggerText">You emerge as the<br>leader of this elvish tribe.<br>They call you:</div>';
            return str;
        }
        G.funcs['new game blurb'] = function () {
            document.title = 'Setup: NeverEnding Legacy';
            var str =
                '<b>Your tribe:</b><div class="thingBox">' +
                G.textWithTooltip('<div class="icon freestanding" style="' + G.getIconUsedBy(G.getRes('adult')) + '"></div><div class="freelabel">\xd75</div>', '5 Adults') +
                G.textWithTooltip('<div class="icon freestanding" style="' + G.getIconUsedBy(G.getRes('elder')) + '"></div><div class="freelabel">\xd71</div>', '1 Elder') +
                G.textWithTooltip('<div class="icon freestanding" style="' + G.getIconUsedBy(G.getRes('child')) + '"></div><div class="freelabel">\xd72</div>', '2 Children') +
                G.textWithTooltip('<div class="icon freestanding" style="' + G.getIconUsedBy(G.getRes('herbs')) + '"></div><div class="freelabel">\xd7300</div>', '300 Herbs') +
                G.textWithTooltip('<div class="icon freestanding" style="' + G.getIconUsedBy(G.getRes('water')) + '"></div><div class="freelabel">\xd7250</div>', '250 Water') +
                (G.resets >= 1 ? G.textWithTooltip('<div class="icon freestanding" style="' + G.getIcon([7, 30, 'magixmod']) + '"></div><div class="freelabel"></div>', '<b>Complete achievements to<br>unlock more starting<br>bonuses.</b>') : "") +
                '</div>' +
                '<div class="par fancyText bitBiggerText">Your tribe finds a place to settle in the wilderness.<br>Resources are scarce, and everyone starts foraging.</div>' +
                '<div class="par fancyText bitBiggerText">You emerge as the tribe\'s leader.<br>These people...they call you: </div>';
            return str;
        }





        /*==========================
        Trial resource
        ==========================*/
        new G.Res({
            name: 'victory point',
            desc: 'You can gain [victory point]s for completing some Trials. All of the trials are repeatable, except for the <b>Buried</b> trial. After the first completion of a trial, it grants 1 [victory point], and for every subsequent attempt, you gain additional [victory point]s (this gain grows more and more powerful the more times you complete a single Trial). These points can\'t be spent, but their amount can provide extra bonuses.',
            icon: [0, 28, 'magixmod'],
        });




        /*==========================
        idk why did I alter that lol don't ask ;D
        ==========================*/
        G.selectPercentForUnit = function (me, div) {
            if (div == G.widget.parent) G.widget.close();
            else {
                G.widget.popup({
                    func: function (widget) {
                        var str = '(this was supposed to be a percent slider<br>...in 2017 or 2018.<br><small>sorry Orteil&Opti i couldn\'t stop myself<br>from saying that</small>)';//TODO
                        widget.l.innerHTML = str;
                    },
                    offX: 0,
                    offY: 8,
                    anchor: 'bottom',
                    parent: div,
                    linked: me,
                    closeOnMouseUp: true
                });
            }
        }
        var faicost = 0; var inscost = 0;
        //Utils i kept in original mod's code. Now it will be separated mod.









        /*=====================================================================================
        ACHIEVEMENTS AND LEGACY
            When the player completes a wonder, they may click it to ascend; this takes them to the new game screen.
            Ascending with a wonder unlocks that wonder's achievement and its associated effects, which can be anything from adding free fast ticks at the start of every game to unlocking new special units available in every playthrough.
            There are other achievements, not necessarily linked to wonders. Some achievements are used to track generic things across playthroughs, such as tutorial tips.
        =======================================================================================*/
        G.achiev = [];
        G.achievByName = [];
        G.achievByTier = [];
        G.getAchiev = function (name) { if (!G.achievByName[name]) ERROR('No achievement exists with the name ' + name + '.'); else return G.achievByName[name]; }
        G.achievN = 0;//incrementer
        G.legacyBonuses = [];

        G.Achiev = function (obj) {
            this.type = 'achiev';
            this.effects = [];//applied on new game start
            this.tier = 0;//where the achievement is located vertically on the legacy screen
            this.won = 0;//how many times we've achieved this achievement (may also be used to track other info about the achievement)
            this.visible = true;
            this.icon = [0, 0];
            this.civ = 0; //Achievements will be different for C2 and C1 but still C2 can boost C1 and vice versa ... yeah . 0 stands for people... 1 for ... ???
            this.special = 'none'; //parameters: 'none','seasonal','shadow'
            this.plural = true; //display: Achieved n times if true, just completed if false

            for (var i in obj) this[i] = obj[i];
            this.id = G.achiev.length;
            if (!this.displayName) this.displayName = cap(this.name);

            G.achiev.push(this);
            G.achievByName[this.name] = this;
            if (!G.achievByTier[this.tier]) G.achievByTier[this.tier] = [];
            G.achievByTier[this.tier].push(this);
            //G.setDict(this.name,this);
            this.mod = G.context;
            if (!this.mod.achievs) this.mod.achievs = [];
            this.mod.achievs.push(this);
        }

        G.applyAchievEffects = function (context) {
            //this is done on creating or loading a game
            for (var i in G.achiev) {
                var me = G.achiev[i];
                if (me.won) {
                    for (var ii in me.effects) {
                        var effect = me.effects[ii];
                        var type = effect.type;
                        if (G.legacyBonuses[type]) {
                            var bonus = G.legacyBonuses[type];
                            if (bonus.func && (!bonus.context || bonus.context == context)) {
                                bonus.func(effect);
                            }
                        }
                    }
                }
            }
        }
        G.getAchievEffectsString = function (effects) {
            //returns a string that describes the effects of a achievement
            var str = '';
            for (var i in effects) {
                var effect = effects[i];
                var type = effect.type;
                if (G.legacyBonuses[type]) {
                    var bonus = G.legacyBonuses[type];
                    str += '<div class="bulleted" style="text-align:left;"><b>' + bonus.name.replaceAll('\\[X\\]', B(effect.amount)) + '</b><div style="font-size:90%;">' + bonus.desc + '</div></div>';
                }
            }
            return str;
        }
        G.fastTicks2 = 0; //civ2 stuff
        G.pressureAdd = 0;
        /*=====Achiev bonuses*/
        G.legacyBonuses.push(
            { id: 'addFastTicksOnStart', name: '+[X] free fast ticks', desc: 'Additional fast ticks when starting a new game with the <u>human race</u>.', icon: [0, 0], func: function (obj) { G.fastTicks += obj.amount }, context: 'new' },
            { id: 'addFastTicksOnResearch', name: '+[X] fast ticks from research', desc: 'Additional fast ticks when completing research while playing with the <u>human race</u>.', icon: [0, 0], func: function (obj) { G.props['fastTicksOnResearch'] += obj.amount; } },
            { id: 'wholenewworld', name: 'A whole new adventure', desc: '<font color="#f2df77">...just progress...you will unlock it.</font>', icon: [0, 0] },
            { id: 'pressure', name: '+[X] to base <font color="white">Pressure resistance</font> amount.', desc: 'This will help you create a bigger elf civilization!', icon: [0, 0], func: function (obj) { G.pressureAdd += obj.amount } },
            { id: 'addFastTicksOnStart2', name: '+[X] free fast ticks', desc: 'Additional fast ticks when starting a new game with the <u>elf race</u>.', icon: [0, 0], func: function (obj) { G.fastTicks2 += obj.amount }, context: 'new' },
            { id: 'addFastTicksOnResearch2', name: '+[X] fast ticks from research', desc: 'Additional fast ticks when completing research while playing with the <u>elf race</u>.', icon: [0, 0], func: function (obj) { G.props['fastTicksOnResearch'] += obj.amount; } },
        );
        //=======================




        G.deleteTrait = function (me) {
            var index = G.traitsOwnedNames.indexOf(me);
            //console.log(index);
            G.applyKnowEffects(G.traitsOwned[index].trait, true, true);
            G.traitsOwned.splice(index, 1);//remove trait
            G.traitsOwnedNames.splice(index, 1);
            if (G.tab.id && G.update[G.tab.id]) G.update[G.tab.id]();
        }
        G.deleteTech = function (me) {
            var index = G.techsOwnedNames.indexOf(me);
            //console.log(index);
            G.applyKnowEffects(G.techsOwned[index].tech, true, true);
            G.techsOwned.splice(index, 1);//remove trait
            G.techsOwnedNames.splice(index, 1);
            if (G.tab.id && G.update[G.tab.id]) G.update[G.tab.id]();
            if (me.category != 'misc') G.miscTechN--; else G.techN--;
        }




        /*=====================================================================================
    ACHIEVEMENTS
    =======================================================================================*/

        //do NOT remove or reorder achievements or saves WILL get corrupted
        //Tier 0 is for shadow achievements/seasonal achievements (they will dislay to player upon completion)
        //if(G.civ==0){

        new G.Achiev({
            tier: 1,
            name: 'mausoleum',
            displayName: '<font color="#ffb47e">Mausoleum</font>',
            desc: 'You have been laid to rest in the Mausoleum, an ancient monument made out of stone that takes root in archaic religious thought.',
            fromWonder: 'mausoleum',
            icon: [1, 14],
            wideIcon: [0, 14],
            effects: [
                { type: 'addFastTicksOnStart', amount: 900 },
                { type: 'addFastTicksOnResearch', amount: 150 }
            ],
            civ: 0
        });
        new G.Achiev({
            tier: 2,
            name: 'heavenly',
            displayName: '<font color="#decaa0">Heavenly</font>',
            wideIcon: [0, 11, 'magixmod'],
            icon: [1, 11, 'magixmod'],
            desc: 'Finish the <b>Temple of Deities</b> wonder.<br>Note: You won\'t need to ascend. //<small>Unlike Babel\'s story, languages weren\'t swapped by any God or Gods.</small>',
            fromWonder: 'heavenly',
            effects: [
                { type: 'addFastTicksOnStart', amount: 300 },
                { type: 'addFastTicksOnResearch', amount: 25 }
            ],
            civ: 0
        });
        //skull achiev
        new G.Achiev({
            tier: 2,
            name: 'deadly, revenantic',
            displayName: '<font color="#b9aaac">Deadly, revenantic</font>',
            wideIcon: [0, 16, 'magixmod'],
            icon: [1, 16, 'magixmod'],
            desc: 'You escaped and your soul got escorted right into the dangerous Underworld...you may discover it at some point.',
            fromWonder: 'Deadly, revenantic',
            effects: [
                { type: 'addFastTicksOnStart', amount: 300 },
                { type: 'addFastTicksOnResearch', amount: 25 }
            ],
            civ: 0
        });

        new G.Achiev({
            tier: 1,
            name: 'sacrificed for culture',
            displayName: '<font color="#beffbc">Sacrificed for culture</font>',
            wideIcon: [choose([9, 12, 15]), 17, 'magixmod', 5, 12, 'magixmod'],
            icon: [6, 12, 'magixmod'],
            desc: 'You sacrificed yourself in the name of <b>Culture</b>. That choice made your previous people more inspired and filled with strong artistic powers! It made big profits and they may get on much a higher cultural level since now. They will miss you, but you will get <b><font color="#4d2">+3 culture and inspiration</font></b> at the start of new runs!',
            fromWonder: 'sacrificed for culture',
            effects: [
                { type: 'addFastTicksOnStart', amount: 150 },
                { type: 'addFastTicksOnResearch', amount: 75 },
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 1,
            name: 'democration',
            displayName: '<font color="#ffa8d3">Democration</font>',
            wideIcon: [5, 13, 'magixmod'],
            icon: [6, 13, 'magixmod'],
            desc: 'You rested in peace inside the Pagoda of Democracy\'s tombs. Your glorious rest made your previous civilization live in the laws of justice forever. They will miss you. <b>But this provides an additional <font color="fuschia">+1 influence & authority</font> at the start of new runs! Also, you will get the [policies] trait immediately.</b>',
            fromWonder: 'Democration',
            effects: [
                { type: 'addFastTicksOnStart', amount: 150 },
                { type: 'addFastTicksOnResearch', amount: 75 },
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 1,
            name: 'insight-ly',
            displayName: '<font color="#cbe2ff">Insight-ly</font>',
            wideIcon: [choose([0, 3, 6]), 17, 'magixmod'],
            icon: [choose([1, 4, 7]), 17, 'magixmod'],
            desc: 'You sacrificed your soul for the Dreamer\'s Orb. That choice was unexpectable but glorious. It made dreamers more acknowledged and people got much smarter by sacrifice of yours. They will miss you. But this made a profit...providing <b><font color="#b5bbfd">+6 insight and +6% dreamer speed</font></b> at the start of new runs!',
            fromWonder: 'Insight-ly',
            effects: [
                { type: 'addFastTicksOnStart', amount: 150 },
                { type: 'addFastTicksOnResearch', amount: 75 },
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 2,
            name: 'in the underworld',
            displayName: '<font color="#e70034">In the underworld</font>',
            wideIcon: [7, 5, 'magixmod'],
            icon: [9, 5, 'magixmod'],
            desc: 'You sent your soul to the Underworld, leaving your body, which started to decay quickly. But...<br><li>If you have <b><font color="#00e063">Sacrificed for culture</font></b>, <b><font color="#5959d2">Insight-ly</font></b>, and <b><font color="fuschia">Democration</font></b>, you will start new runs with someone new: [adult,The Underworld\'s Ascendant]! (To open the Underworld, you will need to obtain <b>Deadly, revenantic</b> as well.)',
            fromWonder: '"In the underworld"',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 15 },
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 3,
            wideIcon: [27, 20, 'magixmod'],
            icon: [28, 20, 'magixmod'],
            name: 'mausoleum eternal',
            displayName: '<font color="#d4af37">Mausoleum eternal</font>',
            desc: 'You have been laid to rest many times in the Mausoleum, an ancient monument made out of stone which involves archaic religious thought. Thanks to you, it has become an unforgettable historical monument. <b>Evolve the <font color="white"><b>Mausoleum</b></font> to stage 10/10, then ascend by it for the 11th time to obtain some massive bonuses!</li></b>',
            fromWonder: 'mausoleum eternal',
            effects: [
                { type: 'addFastTicksOnStart', amount: 2000 },
                { type: 'addFastTicksOnResearch', amount: 175 }
            ],
            civ: 0
        });
        new G.Achiev({
            tier: 2,
            icon: [25, 19, 'magixmod'],
            name: 'level up',
            desc: 'Obtain the <b>Evolution of the minds</b> trait during a legacy! This trait unlocks the second tier of <b>Essentials</b>, which are required for further researches.',
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 'population',
            icon: [36, 31, 'magixmod'],
            name: 'wild tribe',
            desc: 'Manage to get 1k [population,people] in one legacy.',
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 'tech',
            icon: [14, 33, 'magixmod'],
            name: 'how to, spear?',
            desc: 'Get 20 or more technologies in a single legacy for the human race.//<small>Baby steps behind us...</small>',
            civ: 0,
            plural: false
        });

        new G.Achiev({
            tier: 2,
            icon: [26, 9, 'magixmod'],
            name: 'lucky 9',
            desc: 'Obtain the <b>Devil\'s trait #9</b>.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 5 }
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 'trait',
            icon: [26, 21, 'magixmod'],
            name: 'traitsman',
            desc: 'Make your tribe attract a total of 30 traits and knowledges.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 3,
            icon: [27, 21, 'magixmod'],
            name: 'extremely smart',
            desc: 'Get your <b>Insight II</b> equal to your <b>Wisdom II</b>! It may be a bit harder than you think...',
            effects: [
                { type: 'addFastTicksOnStart', amount: 1000 },
                { type: 'addFastTicksOnResearch', amount: 100 }
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 1,
            icon: [29, 21, 'magixmod'],
            name: 'experienced',
            displayName: '<font color="#ebdbfb">Experienced</font>',
            desc: 'To get this achievement you need to complete the other achievements in this tier, along with the <b>Apprentice</b> achievement. @<b>Achievement bonus: +100 [fruit]s at the start of new runs!</b>',
            effects: [
                { type: 'addFastTicksOnStart', amount: 100 },
                { type: 'addFastTicksOnResearch', amount: 10 }
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 2,
            icon: [29, 22, 'magixmod'],
            name: 'smart',
            desc: 'To get this achievement you need to complete the other achievements in this tier. @<b>Achievement bonus: [house,Houses/Brick houses], [hovel]s, [hut]s, and [branch shelter,Branch/mud shelders] will use less [land] in new runs</b>.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 150 },
                { type: 'addFastTicksOnResearch', amount: 10 }
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 3,
            icon: [12, 22, 'magixmod'],
            name: 'man of essences',
            desc: 'Obtain the <b>Magic adept</b> trait by getting 2.1M magical essences! //Getting this will unlock a brand-new wonder...',
            effects: [
                { type: 'addFastTicksOnStart', amount: 40 },
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 3,
            name: 'magical',
            displayName: '<font color="#c3c8fa">Magical</font>',
            wideIcon: [9, 22, 'magixmod'],
            icon: [10, 22, 'magixmod'],
            desc: 'Construct the Fortress of Magicians, a rather...magical wonder. //This achievement will: @unlock a new theme @increase the effect of <b>Wizard towers</b> by 5% without increasing their upkeep cost //This achievement will unlock you some technologies further down the line such as more advanced hunting and fishing.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 150 },
                { type: 'addFastTicksOnResearch', amount: 15 },
            ],
            civ: 0
        });

        new G.Achiev({
            tier: 'tech',
            icon: [23, 21, 'magixmod'],
            name: 'apprentice',
            desc: 'Get 100 or more technologies in a single legacy for the human race.',
            civ: 0,
            plural: false
        });
        new G.Achiev({
            icon: [23, 24, 'magixmod'],
            tier: 1,
            name: '3rd party',
            desc: 'Play Magix along with some other mod. //<b>Note: You will gain this achievement only if you install a separate mod at the start of the game.</b> //<font color="fuschia">This achievement does not provide any boosts and is not required for anything.</font>',
            civ: "overall",
            plural: false
        });
        new G.Achiev({
            tier: 4,
            name: 'patience',
            wideIcon: [3, 26, 'magixmod'],
            icon: [4, 26, 'magixmod'],
            desc: 'Complete Chra-nos\' trial for the first time. Your determination led you to victory. //Complete this trial again to gain extra Victory Points.',
            //fromWonder:'Magical',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 5 },
            ],
            civ: 0
        });
        new G.Achiev({
            tier: 4,
            name: 'unhappy',
            wideIcon: [6, 26, 'magixmod'],
            icon: [7, 26, 'magixmod'],
            desc: 'Complete Bersaria\'s trial for the first time. Your calmness in difficult situations led you to victory. //Complete this trial again to gain extra Victory Points.',
            //fromWonder:'Magical',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 5 },
            ],
            civ: 0
        });
        new G.Achiev({
            tier: 4,
            name: 'cultural',
            wideIcon: [18, 26, 'magixmod'],
            icon: [19, 26, 'magixmod'],
            desc: 'Complete Tu-ria\'s trial for the first time. Your artistic and unique thinking led you to victory. //Complete this trial again to gain extra Victory Points.',
            //fromWonder:'Magical',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 5 },
            ],
            civ: 0
        });
        new G.Achiev({
            tier: 4,
            name: 'hunted',
            wideIcon: [24, 26, 'magixmod'],
            icon: [25, 26, 'magixmod'],
            desc: 'Complete Hartar\'s trial for the first time. Becoming hunting masters and showing \'em what bravery truly is led you to victory. //Complete this trial again to gain extra Victory Points.',
            //fromWonder:'Magical',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 5 },
            ],
            civ: 0
        });
        new G.Achiev({
            tier: 4,
            name: 'unfishy',
            wideIcon: [21, 26, 'magixmod'],
            icon: [22, 26, 'magixmod'],
            desc: 'Complete Fishyar\'s trial for the first time. Making people trust fish a little more led you to victory. //Complete this trial again to gain extra Victory Points.',
            //fromWonder:'Magical',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 5 },
            ],
            civ: 0
        });
        new G.Achiev({
            tier: 4,
            name: 'ocean',
            wideIcon: [1, 25, 'magixmod'],
            icon: [2, 25, 'magixmod'],
            desc: 'Complete Posi\'zul\'s trial for the first time. Living near an endless ocean is not impossible, and you are able to prove it! //Complete this trial again to gain extra Victory Points.',
            //fromWonder:'Magical',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 5 },
            ],
            civ: 0
        });
        new G.Achiev({
            tier: 4,
            name: 'herbalism',
            wideIcon: [12, 26, 'magixmod'],
            icon: [13, 26, 'magixmod'],
            desc: 'Complete Herbalia\'s trial for the first time. Herbs are not that bad! //Complete this trial again to gain extra Victory Points.',
            //fromWonder:'Magical',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 5 },
            ],
            civ: 0
        });
        new G.Achiev({
            tier: 4,
            name: 'buried',
            wideIcon: [0, 26, 'magixmod'],
            icon: [1, 26, 'magixmod'],
            desc: 'Complete Buri\'o dak \'s trial for the first and the last time. Death lurks everywhere but coming to terms with it may be the best way to move forward...',
            //fromWonder:'Magical',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 5 },
            ],
            civ: 0, plural: false
        });
        new G.Achiev({
            tier: 4,
            name: 'underground',
            wideIcon: [15, 26, 'magixmod'],
            icon: [16, 26, 'magixmod'],
            desc: 'Complete Moai\'s trial for the first time. Stones lead to victory! //Complete this trial again to gain extra Victory Points.',
            //fromWonder:'Magical',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 5 },
            ],
            civ: 0
        });
        new G.Achiev({
            tier: 4,
            name: 'pocket',
            wideIcon: [9, 26, 'magixmod'],
            icon: [10, 26, 'magixmod'],
            desc: 'Complete Mamuun\'s trial for the first time. Seems like you have gotten trading skills! This can lead to victory. //Complete this trial again to gain extra Victory Points. It also increases the bonus of this trial.',
            //fromWonder:'Magical',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 5 },
            ],
            civ: 0
        });
        new G.Achiev({
            tier: 4,
            name: 'faithful',
            wideIcon: [0, 27, 'magixmod'],
            icon: [1, 27, 'magixmod'],
            desc: 'Complete Enlightened\'s trial for the first time. Belief and faith is everything. //Complete this trial again to gain extra Victory Points.',
            //fromWonder:'Magical',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 5 },
            ],
            civ: 0
        });
        new G.Achiev({
            tier: 4,
            name: 'dreamy',
            wideIcon: [27, 26, 'magixmod'],
            icon: [28, 26, 'magixmod'],
            desc: 'Complete Okar the Seer\'s trial for the first time. Knowledge will eventually lead to victory. //Complete this trial again to gain extra Victory Points.',
            //fromWonder:'Magical',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 5 },
            ],
            civ: 0
        });
        new G.Achiev({
            tier: 3,
            name: 'next to the God',
            displayName: '<font color="#fddc99">Next to the deities</font>',
            wideIcon: [0, 9, 'magixmod'],
            icon: [1, 9, 'magixmod'],
            desc: 'Ascend by the Temple of the Paradise/Ancestors...You managed to be very close to the Deity. But this step will make it easier. Because you had to sacrifice so much time reaching that far, this achievement has plenty of rewards. Here are the rewards you will get for it: @the chances for <b>Culture of the before/afterlife</b> and <b>God\'s/Ancestors call</b> will be all be tripled @various other traits have a higher chance of being gained @you will start new runs with +1 [faith] and [spirituality] <>You will also unlock the Pantheon upon building this wonder again! (Nope, you won\'t need to ascend once more by it, just complete it and buy the tech that it will unlock...) @This achievement unlocks you <b><font color="orange">3</font> new themes!</b>',
            fromWonder: 'next to the God',
            effects: [
                { type: 'addFastTicksOnStart', amount: 250 },
                { type: 'addFastTicksOnResearch', amount: 25 },
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 3,
            name: 'the first choice',
            icon: [11, 25, 'magixmod'],
            desc: 'Spend all your <b><font color="#d4af36">Worship points</font></b> for the first time to pick Seraphins that your people will worship.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 100 },
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 'trait',
            name: 'trait-or',
            icon: [12, 25, 'magixmod'],
            desc: 'Manage your wonderful tribe to adopt 50 total traits and knowledges.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 50 },
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 3,
            name: 'not so pious people',
            icon: [32, 26, 'magixmod'],
            desc: 'Get: @2 traits that will lower your [faith] income @Also, choose a Seraphin that decreases [faith] income as well. To make this achievement possible, <b><font color="#f66">Devil\'s trait #13</font></b> is not required.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 90 },
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 3,
            name: 'talented?',
            icon: [32, 25, 'magixmod'],
            desc: 'To get this achievement you need to complete the other achievements in this tier. @<b>Achievement bonus: All crafting units that use land in the primary world will now use less land.</b> In addition, this bonus applies to <b>Wells</b>, <b>Farms</b>, <b>Filters</b> and <b>Crematoriums</b>. @You also gain <b>1 extra technology choice</b> when rolling researches.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 200 },
                { type: 'addFastTicksOnResearch', amount: 10 },
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 5,
            name: 'lands of despair',
            wideIcon: [0, 29, 'magixmod'],
            icon: [1, 29, 'magixmod'],
            desc: 'Find the <b>Dead forest</b> biome on your world map. This is the rarest biome in the whole mod and is generally the most hostile biome that can exist on this world.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 200 },
                { type: 'addFastTicksOnResearch', amount: 10 },
            ],
            civ: 0,
            plural: true
        });
        new G.Achiev({
            tier: 'population',
            icon: [36, 30, 'magixmod'],
            name: 'rising star',
            desc: 'Manage to get 10k [population,people] in one legacy. //<small>Keep it up!</small>',
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 5,
            icon: [34, 17, 'magixmod', 24, 1],
            name: 'when while becomes eternity',
            desc: 'Be lucky (or unlucky) enough to make one of the temporary traits become permanent. <b>Note: not every temporary trait has a chance to become permanent!</b>',
            effects: [
                { type: 'addFastTicksOnStart', amount: 200 },
            ],
            civ: 0,
            plural: true
        });
        new G.Achiev({
            name: 'xmas buff',
            visible: false, //debug
        });
        new G.Achiev({
            tier: 0,
            name: 'god complex',
            icon: [35, 5, 'magixmod'],
            desc: 'Declare yourself as one of the famous ones and get punished for that. @<font color="red">Note: usurpers get -0% [happiness] until they change their name.</font>',
            effects: [
                { type: 'addFastTicksOnStart', amount: 30 },
            ],
            visible: false,
            civ: "overall",
            special: 'shadow',
            plural: false
        });
        new G.Achiev({
            tier: 0,
            name: 'it\'s over 9000',
            icon: [35, 10, 'magixmod'],
            desc: 'What?! 9000?! There is no way that can be right.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 150 },
            ],
            visible: false,
            civ: "overall",
            special: 'shadow'
        });
        new G.Achiev({
            tier: 0,
            name: 'just plain lucky',
            icon: [34, 10, 'magixmod'],
            desc: 'Every in-game day you have a <b>1</b> in <b>1,777,777</b> chance to get this achievement.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 150 },
            ],
            visible: false,
            civ: "overall",
            special: 'shadow'
        });
        new G.Achiev({
            tier: 0,
            name: 'cruel goal',
            icon: [34, 8, 'magixmod'],
            desc: 'Don\'t ya think that was very, very cruel? Murdering the root full of hope for the future? @Get your [mausoleum] to at least Level 4 and sacrifice your civilization fully just to finish the final step.',
            effects: [
            ],
            visible: false,
            civ: 0,
            special: 'shadow',
            plural: false
        });
        new G.Achiev({
            tier: 0,
            name: 'that was so brutal',
            icon: [35, 8, 'magixmod'],
            desc: 'Oh my goodness! Murdering the root full of hope for future once AGAIN? And with more cruelty than before?! //Sacrifice all of your people to one of following wonders: @[pagoda of passing time] @[pagoda of culture] @[hartar\'s statue] @[pagoda of democracy] @[fortress of cultural legacy] @[complex of dreamers] @[fortress of magicians] @[platinum fish statue] @[tomb of oceans] @[the Herboleum] @[temple of the Stone] @[Mausoleum of the Dreamer] //You need to have the <b>Cruel goal</b> shadow achievement first to get this shadow achievement.',
            effects: [
            ],
            visible: false,
            civ: 0,
            special: 'shadow',
            plural: false
        });
        new G.Achiev({
            tier: 0,
            name: 'speedresearcher',
            icon: [35, 7, 'magixmod'],
            desc: 'Get at least 60 techs within the first 10 minutes of a legacy.',
            effects: [
            ],
            visible: false,
            civ: 0,
            special: 'shadow'
        });
        new G.Achiev({
            tier: 0,
            name: 'speedresearcher II',
            icon: [35, 6, 'magixmod'],
            desc: 'Get at least 100 techs within the first 10 minutes of a legacy.',
            effects: [
            ],
            visible: false,
            civ: 0,
            special: 'shadow'
        });
        new G.Achiev({
            tier: 5,
            icon: [34, 17, 'magixmod', 24, 1, 'c2'],
            name: 'eternal moments',
            desc: 'Be lucky (or unlucky) enough to make one of the temporary traits become permanent while playing the elf race. <b>Note: not every temporary trait has a chance to become permanent!</b>',
            effects: [
                { type: 'addFastTicksOnStart2', amount: 200 },
            ],
            civ: 1,
            plural: true
        });
        new G.Achiev({
            icon: [1, 0, 'magixmod'],
            name: 'starting type',
            visible: false //debug achiev
        });
        new G.Achiev({
            tier: 'trait',
            name: 'man o\' trait',
            icon: [35, 9, 'magixmod'],
            desc: 'Manage your fantastic tribe and get a total of 70 traits and knowledges.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 70 },
                { type: 'addFastTicksOnResearch', amount: 2 },
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 2,
            name: 'in the shadows',
            icon: [34, 9, 'magixmod'],
            desc: 'Obtain 1 shadow achievement for the human race.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 70 },
                { type: 'addFastTicksOnResearch', amount: 5 },
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 0,
            name: 'capital of christmas',
            icon: [1, 12, 'seasonal'],
            desc: 'Finish the rather nice [wonderful fortress of christmas], which lets you unlock a special buff that lasts only during Christmas and the 7 runs/legacies after [the christmas,<font color="#92ff7a">Christmas</font>] ends. Merry Christmas!',
            effects: [
                { type: 'addFastTicksOnStart', amount: 300 },
                { type: 'addFastTicksOnResearch', amount: 25 },
            ],
            civ: 0,
            plural: false,
            special: 'seasonal',
            visible: false,
        });
        new G.Achiev({
            name: 'valentine buff',
            visible: false, //debug
        });
        new G.Achiev({
            tier: 0,
            name: 'love for eternity',
            icon: [1, 15, 'seasonal'],
            desc: 'Finish the [fortress of love]. //You don\'t have to ascend by this wonder. Also, this fortress is a place where no lie or cheating ever happens...just simple love and respect. //Symbolically constructed in Paradise. @<b>Bonus: from some sources, you gain 20% more [love] points.</b>',
            effects: [
                { type: 'addFastTicksOnStart', amount: 300 },
                { type: 'addFastTicksOnResearch', amount: 25 },
            ],
            civ: 0,
            plural: false,
            special: 'seasonal',
            visible: false,
        });
        new G.Achiev({
            tier: 2,
            name: 'so adorable',
            icon: [8, 15, 'seasonal', 14, 17, 'seasonal'],
            desc: 'Reach [love] <font color="yellow">Level 10</font> during the Valentines event.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 300 },
                { type: 'addFastTicksOnResearch', amount: 25 },
            ],
            civ: "overall",
            plural: false,
            special: 'seasonal',
            visible: false,
        });
        new G.Achiev({
            tier: 2,
            name: 'obsessed?',
            icon: [9, 15, 'seasonal', 16, 17, 'seasonal'],
            desc: 'Reach [love] <font color="yellow">Level 15</font> during the Valentines event. //This is probably obsession...',
            effects: [
                { type: 'addFastTicksOnStart', amount: 150 },
                { type: 'addFastTicksOnResearch', amount: 10 },
                { type: 'pressure', amount: 1000 },
            ],
            visible: false,
            civ: "overall",
            special: 'shadow',
            plural: false
        });
        new G.Achiev({
            name: 'wondersDuringRun',
            visible: false, //debug
        });
        new G.Achiev({
            name: 'mostPeopleDuringRun', //debug
            visible: false,
        });
        new G.Achiev({
            name: 'mostElvesDuringRun',//debug
            visible: false,
        });
        new G.Achiev({
            name: 'mostElvesLand', //debug
            visible: false,
        });
        new G.Achiev({
            name: 'mostPeopleLand', //debug
            visible: false,
        });
        new G.Achiev({
            tier: 5,
            name: '???',
            icon: [0, 0, 0, 0, 'magix2'],
            desc: '???',
            visible: true,
            civ: 0,
            plural: false,
            effects: [
                { type: 'wholenewworld' }
            ],
        });
        new G.Achiev({
            tier: 1,
            name: 'the fortress',
            desc: 'You have been laid to rest in The Fortress, an ancient monument made out of stone that was built in the middle of the forest the purpose of which takes root in archaic elven religious thought.',
            fromWonder: 'the fortress',
            icon: [1, 14, 'c2'],
            wideIcon: [0, 14, 'c2'],
            effects: [
                { type: 'addFastTicksOnStart2', amount: 100 },
                { type: 'addFastTicksOnResearch2', amount: 50 },
            ],
            civ: 1, special: 'c2',
        });

        new G.Achiev({
            tier: 2,
            name: 'fortress eternal',
            displayName: '<font color="#Da4f37">Fortress eternal</font>',
            desc: 'You have been laid to rest in The Fortress several times. After each time, the Fortress grew bigger and bigger. Evolve the Fortress to 10/10 to get this achievement. Bonuses: @[belief in the afterlife] chance is doubled for the second civilization. @You also gain +1 <b>Insight</b> for the human race at the very start.',
            //fromWonder:'the fortress',
            icon: [1, 24, 'c2'],
            wideIcon: [0, 24, 'c2'],
            effects: [
                { type: 'addFastTicksOnStart2', amount: 400 },
                { type: 'addFastTicksOnResearch2', amount: 50 },
                { type: 'addFastTicksOnResearch', amount: 25 },
            ],
            civ: 1, special: 'c2',
        });
        new G.Achiev({
            tier: 'population',
            name: 'first overcome',
            desc: 'Manage to get a tribe of 1k [population,Elves]. //<small>Congrats for dealing with our first problems!</small>',
            icon: [32, 8, 'c2'],
            /*effects:[
                {type:'pressure',amount:100}
            ],*/
            civ: 1, plural: false,
            special: 'c2',
        });
        new G.Achiev({
            tier: 'population',
            name: 'pressed progress',
            desc: 'Manage to get a tribe of 10k [population,Elves]. //<small>gg bro :p</small>',
            icon: [32, 9, 'c2'],
            /*effects:[
                {type:'pressure',amount:100}
            ],*/
            civ: 1, plural: false,
            special: 'c2',
        });
        new G.Achiev({
            tier: 'population',
            name: 'the moral press',
            desc: 'Push <b>Pressure</b> enough to be capable of having 25k [population,Elves]. //<small>You know that pressure also affects your production efficiency. But...do you even care about it?</small>',
            icon: [32, 10, 'c2'],
            effects: [
                { type: 'pressure', amount: 250 }
            ],
            civ: 1, plural: false,
            special: 'c2',
        });
        new G.Achiev({
            tier: 'population',
            name: 'pressure vaccine',
            desc: 'Push <b>Pressure</b> enough to be capable of having 85k [population,Elves]. //<small>Don\'t get too excited...</small>',
            icon: [32, 11, 'c2'],
            effects: [
                { type: 'pressure', amount: 450 }
            ],
            civ: 1, plural: false,
            special: 'c2',
        });
        new G.Achiev({
            tier: 'population',
            name: 'pressure wiper',
            desc: 'Push <b>Pressure</b> enough to be capable of having 175k [population,Elves]. //<small>Do you really feel THAT pressured to remove Pressure?</small>',
            icon: [32, 12, 'c2'],
            effects: [
                { type: 'pressure', amount: 770 }
            ],
            civ: 1, plural: false,
            special: 'c2',
        });
        new G.Achiev({
            tier: 'population',
            name: 'pressure purgator',
            desc: 'Push <b>Pressure</b> enough to be capable of having 300k [population,Elves]. //<small>Now go for 1M...a bajillion years later</small>',
            icon: [32, 13, 'c2'],
            effects: [
                { type: 'pressure', amount: 1250 }
            ],
            civ: 1, plural: false,
            special: 'c2',
        });
        new G.Achiev({
            tier: 1,
            name: 'limit reached',
            desc: 'Use up all the <b>Pressure resistance</b> for the first time. //@<font color="red">Note: you will need to have <b>Pressure resistance</b> at a minimum of level 1000 to get this.</font>',
            icon: [32, 14, 'c2'],
            civ: 1, plural: false,
            special: 'c2',
        });
        new G.Achiev({
            tier: 'population',
            icon: [36, 29, 'magixmod'],
            name: 'progressive city',
            desc: 'Manage to get 150k [population,people] in one run.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 10 },
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 'population',
            icon: [25, 21, 'magixmod'],
            name: 'metropoly',
            desc: 'Manage to get 500k [population,people] in one run.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 25 },
                { type: 'addFastTicksOnResearch', amount: 5 }
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 'population',
            icon: [35, 27, 'magixmod'],
            name: 'a huge city made of the smaller cities',
            desc: 'Manage to get 1M [population,people] in one run. //<small>Unbelievable...</small>',
            effects: [
                { type: 'addFastTicksOnStart', amount: 25 },
                { type: 'addFastTicksOnResearch', amount: 5 }
            ],
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 1,
            icon: [36, 28, 'magixmod'],
            name: 'first glory',
            displayName: '<font color="#fff2e0">First glory</font>',
            desc: 'Ascend for the first time while playing with the human race. //<small>If you rebirth, you will encounter a new adventure!</small>',
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 1,
            icon: [32, 15, 'c2'],
            name: 'druidish heart',
            desc: 'Ascend for the first time while playing with the <u>elf race</u>. //<small>If you rebirth, you may encounter a new adventure...like, one more time, right?</small>',
            civ: 1,
            special: 'c2',
            plural: false
        });
        new G.Achiev({
            tier: 2,
            name: 'In the shadows',
            icon: [32, 16, 'c2'],
            desc: 'Obtain 1 shadow achievement for the elf race.',
            effects: [
                { type: 'addFastTicksOnStart2', amount: 70 },
                { type: 'addFastTicksOnResearch2', amount: 2 },
                { type: 'addFastTicksOnStart', amount: 150 },
                { type: 'addFastTicksOnResearch', amount: 5 },
            ],
            civ: 1,
            plural: false,
            special: 'c2',
        });
        new G.Achiev({
            name: 'pickedCiv', //debug
            visible: false,
        });
        new G.Achiev({
            tier: 1,
            name: 'here you go',
            displayName: "???",
            icon: [0, 0],
            desc: '???',
            plural: false,
            civ: "overall",
        });
        new G.Achiev({
            name: 'halloween buff',
            visible: false, //debug
        });
        new G.Achiev({
            tier: 2,
            name: 'spooktober',
            icon: [8, 16, 'seasonal', 17, 8, 'seasonal'],
            desc: 'Reach [spookiness] <font color="yellow">Level 10</font> during the Halloween event.',
            effects: [
                { type: 'addFastTicksOnStart', amount: 300 },
                { type: 'addFastTicksOnResearch', amount: 25 },
            ],
            civ: "overall",
            plural: false,
            special: 'seasonal',
            visible: false,
        });
        new G.Achiev({
            tier: 2,
            name: 'spookyear',
            icon: [9, 16, 'seasonal', 18, 8, 'seasonal'],
            desc: 'Reach [spookiness] <font color="yellow">Level 15</font> during the Halloween event. //<small><b>boo</b></small>',
            effects: [
                { type: 'addFastTicksOnStart', amount: 150 },
                { type: 'addFastTicksOnResearch', amount: 10 },
                { type: 'pressure', amount: 1000 },
            ],
            visible: false,
            civ: "overall",
            special: 'shadow',
            plural: false
        });
        new G.Achiev({
            icon: [16, 24, 'magixmod'],
            tier: 'tech',
            name: 'familiar',
            desc: 'Get 200 or more technologies in a single run for the human race. //<small>Keep going like that...</small>',
            civ: 0,
            plural: false
        });

        new G.Achiev({
            tier: 'tech',
            icon: [32, 18, 'c2'],
            name: 'nature\'s rookie',
            desc: 'Get 20 or more technologies in a single run for the elf race.//<small>Baby steps behind us...again!</small>',
            civ: 1,
            plural: false
        });
        new G.Achiev({
            tier: 'tech',
            icon: [32, 19, 'c2'],
            name: 'nature\'s braincell',
            desc: 'Get 60 or more technologies in a single run for the elf race. //<small>You are doing quite great!</small>',
            civ: 1,
            plural: false
        });
        new G.Achiev({
            tier: 'tech',
            icon: [13, 33, 'magixmod'],
            name: 'A+ student',
            desc: 'Get 250 or more technologies in a single run for the human race. //<small>I\'m about to become a genius...</small>',
            civ: 0,
            plural: false
        });
        new G.Achiev({
            tier: 'trait',
            icon: [32, 20, 'c2'],
            name: 'naturality',
            desc: 'Make your elvish tribe attract 20 total traits and knowledges. @Note: traits from the <b>Anomaly</b> category do not count, as they are anomalies, not actual traits or knowledges. //<small>It\'s better to have your own personality than somebody else\'s.</small>',
            effects: [
                { type: 'addFastTicksOnStart2', amount: 50 },
            ],
            civ: 1,
            plural: false
        });
        new G.Achiev({
            name: 'mostPeople', //debug
            visible: false,
        });
        new G.Achiev({
            name: 'mostElves',//debug
            visible: false,
        });
        new G.Achiev({
            tier: 1,
            name: 'here you go...again',
            displayName: "???",
            icon: [0, 0],
            desc: '???',
            visible: false,
            plural: false,
            civ: "overall",
        });
        new G.Achiev({
            tier: 0,
            name: 'speeddiscoverer',
            icon: [32, 17, 'c2'],
            desc: 'Get at least 50 techs within the first 30 minutes of a legacy.',
            effects: [
            ],
            visible: false,
            civ: 1,
            special: 'shadow'
        });
        new G.Achiev({
            tier: 2,
            icon: [36, 26, 'magixmod'],
            name: 'the hour of hope',
            desc: 'Maintain this save for at least <b>a hour</b>. //<small>Why hope? Because hope will move us forward.</small>',
            civ: "overall",
            plural: false
        });
        new G.Achiev({
            tier: 2,
            icon: [36, 25, 'magixmod'],
            name: 'the day of rise',
            desc: 'Maintain this save for at least <b>one day</b>. //<small>Well, thanks for playing this game, I guess!</small>',
            civ: "overall",
            plural: false
        });
        new G.Achiev({
            tier: 2,
            icon: [36, 24, 'magixmod'],
            name: 'authority\'s week',
            desc: 'Maintain this save for at least <b>one week</b>. //<small>You\'re about 2% of the way there...</small>',
            civ: "overall",
            plural: false
        });
        new G.Achiev({
            tier: 2,
            icon: [36, 23, 'magixmod'],
            name: 'golden month',
            desc: 'Maintain this save for at least <b>one month</b>. //<small>We hope that you enjoyed this game!</small>',
            civ: "overall",
            plural: false
        });
        new G.Achiev({
            tier: 0,
            icon: [36, 22, 'magixmod'],
            name: 'so much to do, so much to see',
            desc: 'Maintain this save for at least <b>one year</b>! //<small>Wow...congrats!</small>',
            civ: "overall",
            special: "shadow",
            visible: false,
            plural: false
        });
        new G.Achiev({
            tier: 0,
            icon: [16, 0, 'magix2'],
            name: 'an ocean\'s voyage',
            desc: 'While in the [t6,Ocean trial], manage to get the [Wizard complex] tech to gain all <b>seven</b> trial-related upgrades! //<small>How did you get that far with the world practically falling apart?</small>',
            effects: [
                { type: 'addFastTicksOnStart', amount: 500 },
            ],
            civ: 0,
            special: "shadow",
            visible: false,
            plural: false
        });



        G.tabPopup['legacy'] = function () {
            if (G.achievByName['???'].won > 0) G.achievByName['here you go...again'].visible = true;
            for (var i in G.achiev) {
                if (G.achiev[i].special != 'shadow') continue;
                if (G.achiev[i].won > 0) G.achiev[i].visible = true;
            }
            if (G.achievByName['here you go'].won > 0) { G.achievByName['here you go'].icon = [32, 27, 'magixmod']; G.achievByName['here you go'].desc = 'Click on this achievement\'s slot.'; G.achievByName['here you go'].displayName = 'Here you go'; };
            if (G.achievByName['here you go...again'].won > 0) { G.achievByName['here you go...again'].icon = [33, 5, 'c2']; G.achievByName['here you go...again'].desc = 'Click on this achievement\'s slot...twice. //<small>yeah...twice...actually wild</small>'; G.achievByName['here you go...again'].displayName = 'Here you go...again'; };
            if (G.achievByName['capital of christmas'].won >= 1 || (day + leap >= 349 && day + leap <= 362)) { G.achievByName['capital of christmas'].visible = true };
            if (G.achievByName['love for eternity'].won >= 1 || (day + leap >= 40 && day + leap <= 46)) { G.achievByName['love for eternity'].visible = true };
            if (G.achievByName['so adorable'].won >= 1 || (day + leap >= 40 && day + leap <= 46)) { G.achievByName['so adorable'].visible = true };
            if (G.achievByName['spooktober'].won >= 1 || (day + leap >= 289 && day + leap <= 305)) { G.achievByName['spooktober'].visible = true };
            var str = ''; var a = 0;
            str += '<div class="fancyText title"><font color="#d4af37" size="5">- - - Legacy - - -</font></div>';
            str += '<div class="scrollBox underTitle" style="width:248px;left:0px;">';
            str += '<div class="fancyText barred bitBiggerText" style="text-align:center;"><font size="3" style="letter-spacing: 2px;">Stats</font></div>';
            str += '<div class="par">Behold, the fruits of your legacy! Below are some stats about your current and past games.</div>';
            str += '<div class="fancyText barred" style="text-align:center;"><font style="letter-spacing: 1px;">Overall</font></div>';
            str += '<div class="par">Legacy started: <b>' + G.selfUpdatingText(function () { return BT((Date.now() - G.fullDate) / 1000); }) + ' ago</b></div>';
            str += '<div class="par">This game started: <b>' + G.selfUpdatingText(function () { return BT((Date.now() - G.startDate) / 1000); }) + ' ago</b></div>';
            str += '<div class="par">Longest game: <b>' + G.selfUpdatingText(function () { return G.BT(G.furthestDay); }) + '</b></div>';
            str += '<div class="par">Total legacy time: <b>' + G.selfUpdatingText(function () { return G.BT(G.totalDays); }) + '</b></div>';
            str += '<div class="par">Current amount of adopted traits: <b>' + G.selfUpdatingText(function () { return (G.modsByName['Elves'] ? G.traitN2 : G.traitN) - G.knowN; }) + '</b></div>';
            str += '<div class="par">Current amount of obtained researches: <b>' + G.selfUpdatingText(function () { return G.techN - G.miscTechN + G.knowN; }) + '</b></div>';
            str += '<div class="par">Current amount of constructed wonders: <b>' + G.achievByName['wondersDuringRun'].won + '</b></div>';
            if (G.achievByName['???'].won > 0) {
                str += '<div class="par">Total ascensions: <b>' + G.selfUpdatingText(function () { return G.achievByName['first glory'].won + G.achievByName['druidish heart'].won }) + '</b></div>';
            }
            str += '<div class="par">Season: <b>' + (((day >= 1 && day <= 2) || (day == 365 || day == 366)) ? "New year\'s eve" : ((day >= 40 && day <= 46) ? 'Valentine\'s day' : ((Date.getMonth == 3 && Date.getDate == 1) ? "Another anniversary since the first rickroll...<Br><small>bruh</small>" : ((day + leap >= 289 && day + leap <= 305) ? 'Haloween' : ((day + leap >= 349 && day + leap <= 362) ? 'Christmas' : 'None'))))) + '</b></div>';
            str += '<div class="fancyText barred" style="text-align:center;"><font style="letter-spacing: 1px;">Human race</font></div>';
            str += '<font color="#ffddaa"><div class="par">Ascensions: <b>' + G.selfUpdatingText(function () { return B(G.achievByName['first glory'].won); }) + '</b></div>';
            if (G.achievByName['lands of despair'].won > 0) str += '<div class="par">Dead forests found: <b>' + G.selfUpdatingText(function () { return B(G.achievByName['lands of despair'].won); }) + '</b></div>';

            if (G.getRes('victory point').amount > 0) str += '<div class="par">Victory points: <b>' + G.selfUpdatingText(function () { return B(G.getRes('victory point').amount); }) + '</b></div>';
            if (G.achievByName['patience'].won + G.achievByName['unhappy'].won + G.achievByName['cultural'].won + G.achievByName['hunted'].won + G.achievByName['unfishy'].won + G.achievByName['ocean'].won + G.achievByName['herbalism'].won + G.achievByName['buried'].won + G.achievByName['underground'].won + G.achievByName['pocket'].won + G.achievByName['faithful'].won + G.achievByName['dreamy'].won > 0) str += '<div class="par">Successful trial accomplishments: <b>' + G.selfUpdatingText(function () { return B(G.achievByName['patience'].won + G.achievByName['unhappy'].won + G.achievByName['cultural'].won + G.achievByName['hunted'].won + G.achievByName['unfishy'].won + G.achievByName['ocean'].won + G.achievByName['herbalism'].won + G.achievByName['buried'].won + G.achievByName['underground'].won + G.achievByName['pocket'].won + G.achievByName['faithful'].won + G.achievByName['dreamy'].won); }) + '</b></div>';
            str += '<div class="par">Most population ruled: <b>' + G.selfUpdatingText(function () { return B(G.achievByName['mostPeople'].won) }) + '</b></div>';
            str += G.textWithTooltip('<div class="par"><font color="#ffddaa">Most land on people\'s mortal world: <b></font>', 'This stat does not include effects of traits/techs that multiply the amount of mortal land.') + G.selfUpdatingText(function () { return B(G.achievByName['mostPeopleLand'].won) }) + '</b></div>';
            if (G.achievByName['???'].won > 0) {
                str += '</font><div class="fancyText barred" style="text-align:center;"><font style="letter-spacing: 1px;">Elf race</font></div>';
                str += '<div class="par"><font color="#ccffcc">Most population ruled (elf race): <b>' + G.selfUpdatingText(function () { return B(G.achievByName['mostElves'].won) }) + '</b></div>';
                str += '<div class="par">Ascensions: <b>' + G.selfUpdatingText(function () { return B(G.achievByName['druidish heart'].won); }) + '</b></div>';
                str += G.textWithTooltip('<div class="par"><font color="#ccffcc">Most land on the mortal world of elves: </font><b>', 'This stat does not include effects of traits/techs that multiply the amount of mortal land.') + G.selfUpdatingText(function () { return B(G.achievByName['mostElvesLand'].won) }) + '</b></div>';
            }
            str += '</div>';
            str += '<div class="scrollBox underTitle" style="width:380px;right:0px;left:auto;background:rgba(0,0,0,0.25);"></font>';

            if (G.sequence == 'main' && displayAchievs == 0) {
                if (G.achievByName['???'].won > 0) {
                    str += '<center>' + G.button({ text: '<font size="3">Overall</font>', tooltip: 'View overall achievements', onclick: function () { if (displayAchievs == 1 || displayAchievs == 0) { displayAchievs = "overall"; G.dialogue.forceClose(); G.dialogue.popup(G.tabPopup['legacy'], 'bigDialogue') } } }) + ' Civilization:' + G.button({ text: '<font size="3" color="#ffddaa"> <u>1</u> </font>', tooltip: 'View the C1 achievements', onclick: function () { if (displayAchievs == 1 || displayAchievs == "overall") { displayAchievs = 0; G.dialogue.forceClose(); G.dialogue.popup(G.tabPopup['legacy'], 'bigDialogue') } } }) + '' + G.button({ text: '<font size="3" color="#ccffcc"> 2 </font>', tooltip: 'View the C2 achievements', onclick: function () { if (displayAchievs == 0 || displayAchievs == "overall") { displayAchievs = 1; G.dialogue.forceClose(); G.dialogue.popup(G.tabPopup['legacy'], 'bigDialogue') } } });
                } else {
                    str += '<center>' + G.button({ text: '<font size="3">Overall</font>', tooltip: 'View overall achievements', onclick: function () { if (displayAchievs == 1 || displayAchievs == 0) { displayAchievs = "overall"; G.dialogue.forceClose(); G.dialogue.popup(G.tabPopup['legacy'], 'bigDialogue') } } }) + ' Civilization:' + G.button({ text: '<font size="3" color="#ffddaa"> <u>1</u> </font>', tooltip: 'View the C1 achievements', onclick: function () { if (displayAchievs == 1 || displayAchievs == "overall") { displayAchievs = 0; G.dialogue.forceClose(); G.dialogue.popup(G.tabPopup['legacy'], 'bigDialogue') } } });
                }
                str += '</center><div class="fancyText barred bitBiggerText" style="text-align:center;"><font size="3" style="letter-spacing: 2px;" color="#ffddaa">Achievements</font></div>';
                for (var i in G.achievByTier) {
                    str += '<div class="tier thingBox">';
                    if (i == 'population') str += '<div class="fancyText barred bitBiggerText" style="text-align:center;"><font size="3" color="#ffddaa">Population-based achievements</font></div>';
                    if (i == 'tech') str += '<div class="fancyText barred bitBiggerText" style="text-align:center;"><font size="3" color="#ffddaa">Technology and trait achievements</font></div>';
                    for (var ii in G.achievByTier[i]) {
                        var me = G.achievByTier[i][ii];
                        if (me.visible == true && me.civ == 0) {
                            str += '<div class="thingWrapper">' +
                                (me.special == 'shadow' || me.special == 'seasonal' || me.special == 'c2' ? '<div class="' + me.special + 'achiev thing' + G.getIconClasses(me) + '' + (me.won ? '' : ' off') + '" id="achiev-' + me.id + '">' : '<div class="achiev thing' + G.getIconClasses(me) + '' + (me.won ? '' : ' off') + '" id="achiev-' + me.id + '">') +
                                G.getIconStr(me, 'achiev-icon-' + me.id) +
                                '<div class="overlay" id="achiev-over-' + me.id + '"></div>' +
                                '</div>' +
                                '</div>'/* : ".")*/;
                        }
                    }
                    str += '<div class="divider"></div>';
                    str += '</div>';
                }


                G.arbitraryCallback(function () {
                    for (var i in G.achievByTier) {
                        for (var ii in G.achievByTier[i]) {
                            var me = G.achievByTier[i][ii];
                            if (me.civ != 0) continue;
                            if (me.visible == true) {
                                var div = l('achiev-' + me.id);
                                /*me.visible==true ? */
                                div.onclick = function (me, div) {
                                    return function () {
                                        if (me.name == 'here you go' && me.won == 0) {
                                            me.won = 1;
                                            G.middleText('And you found another secret...<br><small>it wasn\'t that big of a secret was it?</small>', 'slow');
                                        }
                                        if (G.getSetting('debug')) {
                                            if (me.won) me.won = 0; else me.won = 1;
                                            if (me.won) div.classList.remove('off');
                                            else div.classList.add('off');
                                        }
                                    }
                                }(me, div)/* :"")*/;
                                G.addTooltip(div, function (me) {
                                    return function () {
                                        return '<div class="info">' +
                                            '<div class="infoIcon"><div class="thing standalone' + G.getIconClasses(me, true) + '">' + G.getIconStr(me, 0, 0, true) + '</div></div>' +
                                            '<div class="fancyText barred infoTitle">' + me.displayName + '</div>' +
                                            (me.plural == true ?
                                                '<div class="fancyText barred">' + (me.won > 0 ? ('Achieved: <font color="yellow">' + me.won + '</font> ' + (me.won == 1 ? 'time' : 'times')) : 'Locked <font color="#aaffff">:(</font>') + '</div>' :
                                                '<div class="fancyText barred">' + (me.won > 0 ? ('Completed<font color="yellow"> :> </font>') : 'Locked <font color="#aaffff">:(</font>') + '</div>') +
                                            //'<div class="fancyText barred">'+(me.won>0?('<font color="yellow">Completed</font>':'Locked <font color="#aaffff">:(</font></div>')+
                                            '<div class="fancyText barred">Effects: ' + G.getAchievEffectsString(me.effects) + '</div>' +
                                            (me.desc ? ('<div class="infoDesc">' + G.parse(me.desc) + '</div>') : '') +
                                            '</div>' +
                                            G.debugInfo(me)
                                    };
                                }(me), { offY: 8 });
                            }
                        }
                    }
                });
            } else if (G.sequence == 'main' && displayAchievs == 1) {
                str += '<center>' + G.button({ text: '<font size="3">Overall</font>', tooltip: 'View overall achievements', onclick: function () { if (displayAchievs == 1 || displayAchievs == 0) { displayAchievs = "overall"; G.dialogue.forceClose(); G.dialogue.popup(G.tabPopup['legacy'], 'bigDialogue') } } }) + ' Civilization:' + G.button({ text: '<font size="3" color="#ffddaa"> 1 </font>', tooltip: 'View the C1 achievements', onclick: function () { if (displayAchievs == 1) { displayAchievs = 0; G.dialogue.forceClose(); G.dialogue.popup(G.tabPopup['legacy'], 'bigDialogue') } } }) + '' + G.button({ text: '<font size="3" color="#ccffcc"> <u>2</u> </font>', tooltip: 'View the C2 achievements', onclick: function () { if (displayAchievs == 0 || displayAchievs == "overall") { displayAchievs = 1; G.dialogue.forceClose(); G.dialogue.popup(G.tabPopup['legacy'], 'bigDialogue') } } });
                str += '</center><div class="fancyText barred bitBiggerText" style="text-align:center;"><font size="3" style="letter-spacing: 2px;" color="#ccffcc">Achievements</font></div>';
                for (var i in G.achievByTier) {
                    str += '<div class="tier thingBox">';
                    if (i == 'population') str += '<div class="fancyText barred bitBiggerText" style="text-align:center;"><font size="3" color="#ccffcc">Population-size achievements</font></div>';
                    if (i == 'tech') str += '<div class="fancyText barred bitBiggerText" style="text-align:center;"><font size="3" color="#ccffcc">Techs & traits achievements</font></div>';
                    for (var ii in G.achievByTier[i]) {
                        var me = G.achievByTier[i][ii];
                        if (me.visible == true && me.civ == 1) {
                            str += '<div class="thingWrapper">' +
                                (me.special == 'shadow' || me.special == 'seasonal' || me.special == 'c2' ? '<div class="' + me.special + 'achiev thing' + G.getIconClasses(me) + '' + (me.won ? '' : ' off') + '" id="achiev-' + me.id + '">' : '<div class="achiev thing' + G.getIconClasses(me) + '' + (me.won ? '' : ' off') + '" id="achiev-' + me.id + '">') +
                                G.getIconStr(me, 'achiev-icon-' + me.id) +
                                '<div class="overlay" id="achiev-over-' + me.id + '"></div>' +
                                '</div>' +
                                '</div>'/* : ".")*/;
                        }
                    }
                    str += '<div class="divider"></div>';
                    str += '</div>';
                }


                G.arbitraryCallback(function () {
                    for (var i in G.achievByTier) {
                        for (var ii in G.achievByTier[i]) {
                            var me = G.achievByTier[i][ii];
                            if (me.civ != 1) continue;
                            if (me.visible == true) {
                                var div = l('achiev-' + me.id);
                                /*me.visible==true ? */
                                div.onclick = function (me, div) {
                                    return function () {
                                        if (G.getSetting('debug')) {
                                            console.log("Toggled " + me.name);
                                            if (me.won) me.won = 0; else me.won = 1;
                                            if (me.won) div.classList.remove('off');
                                            else div.classList.add('off');
                                        }
                                    }
                                }(me, div)/* :"")*/;
                                G.addTooltip(div, function (me) {
                                    return function () {
                                        return '<div class="info">' +
                                            '<div class="infoIcon"><div class="thing standalone' + G.getIconClasses(me, true) + '">' + G.getIconStr(me, 0, 0, true) + '</div></div>' +
                                            '<div class="fancyText barred infoTitle">' + me.displayName + '</div>' +
                                            (me.plural == true ?
                                                '<div class="fancyText barred">' + (me.won > 0 ? ('Achieved: <font color="yellow">' + me.won + '</font> ' + (me.won == 1 ? 'time' : 'times')) : 'Locked <font color="#aaffff">:(</font>') + '</div>' :
                                                '<div class="fancyText barred">' + (me.won > 0 ? ('Completed<font color="yellow"> :> </font>') : 'Locked <font color="#aaffff">:(</font>') + '</div>') +
                                            //'<div class="fancyText barred">'+(me.won>0?('<font color="yellow">Completed</font>':'Locked <font color="#aaffff">:(</font></div>')+
                                            '<div class="fancyText barred">Effects: ' + G.getAchievEffectsString(me.effects) + '</div>' +
                                            (me.desc ? ('<div class="infoDesc">' + G.parse(me.desc) + '</div>') : '') +
                                            '</div>' +
                                            G.debugInfo(me)
                                    };
                                }(me), { offY: 8 });
                            }
                        }
                    }
                });
            } else if (G.sequence == 'main' && displayAchievs == "overall") {
                if (G.achievByName['???'].won > 0) {
                    str += '<center>' + G.button({ text: '<font size="3"><u>Overall</u></font>', tooltip: 'View overall achievements', onclick: function () { if (displayAchievs == 1 || displayAchievs == 0) { displayAchievs = "overall"; G.dialogue.forceClose(); G.dialogue.popup(G.tabPopup['legacy'], 'bigDialogue') } } }) + ' Civilization:' + G.button({ text: '<font size="3" color="#ffddaa"> 1 </font>', tooltip: 'View the C1 achievements', onclick: function () { if (displayAchievs == 1 || displayAchievs == "overall") { displayAchievs = 0; G.dialogue.forceClose(); G.dialogue.popup(G.tabPopup['legacy'], 'bigDialogue') } } }) + '' + G.button({ text: '<font size="3" color="#ccffcc"> 2 </font>', tooltip: 'View the C2 achievements', onclick: function () { if (displayAchievs == 0 || displayAchievs == "overall") { displayAchievs = 1; G.dialogue.forceClose(); G.dialogue.popup(G.tabPopup['legacy'], 'bigDialogue') } } });
                } else {
                    str += '<center>' + G.button({ text: '<font size="3"><u>Overall</u></font>', tooltip: 'View overall achievements', onclick: function () { if (displayAchievs == 1 || displayAchievs == 0) { displayAchievs = "overall"; G.dialogue.forceClose(); G.dialogue.popup(G.tabPopup['legacy'], 'bigDialogue') } } }) + ' Civilization:' + G.button({ text: '<font size="3" color="#ffddaa"> 1 </font>', tooltip: 'View the C1 achievements', onclick: function () { if (displayAchievs == 1 || displayAchievs == "overall") { displayAchievs = 0; G.dialogue.forceClose(); G.dialogue.popup(G.tabPopup['legacy'], 'bigDialogue') } } });
                }
                str += '</center><div class="fancyText barred bitBiggerText" style="text-align:center;"><font size="3" style="letter-spacing: 2px;">Achievements</font></div>';
                for (var i in G.achievByTier) {
                    str += '<div class="tier thingBox">';
                    for (var ii in G.achievByTier[i]) {
                        var me = G.achievByTier[i][ii];
                        if (me.visible == true && me.civ == "overall") {
                            str += '<div class="thingWrapper">' +
                                (me.special == 'shadow' || me.special == 'seasonal' || me.special == 'c2' ? '<div class="' + me.special + 'achiev thing' + G.getIconClasses(me) + '' + (me.won ? '' : ' off') + '" id="achiev-' + me.id + '">' : '<div class="achiev thing' + G.getIconClasses(me) + '' + (me.won ? '' : ' off') + '" id="achiev-' + me.id + '">') +
                                G.getIconStr(me, 'achiev-icon-' + me.id) +
                                '<div class="overlay" id="achiev-over-' + me.id + '"></div>' +
                                '</div>' +
                                '</div>'/* : ".")*/;
                        }
                    }
                    str += '<div class="divider"></div>';
                    str += '</div>';
                }


                G.arbitraryCallback(function () {
                    var control = 0;
                    for (var i in G.achievByTier) {
                        for (var ii in G.achievByTier[i]) {
                            var me = G.achievByTier[i][ii];
                            if (me.civ != "overall") continue;
                            if (me.visible == true) {
                                var div = l('achiev-' + me.id);
                                /*me.visible==true ? */
                                div.onclick = function (me, div) {
                                    return function () {
                                        if (me.name == 'here you go...again' && me.won == 0 && control > 1) {
                                            me.won = 1;
                                            G.dialogue.forceClose();
                                            G.middleText('And a secret strikes again...<br><small>it wasn\'t that big of a secret again, was it?</small>', 'slow');
                                        } else if (me.name == 'here you go...again' && me.won == 0) {
                                            control++;
                                        }
                                        if (me.name == 'here you go' && me.won == 0) {
                                            me.won = 1;
                                            G.dialogue.forceClose();
                                            G.middleText('Seems like you found a secret...<br><small>it wasn\'t that big of a secret, was it?</small>', 'slow');
                                        }

                                        if (G.getSetting('debug')) {
                                            if (me.won) me.won = 0; else me.won = 1;
                                            if (me.won) div.classList.remove('off');
                                            else div.classList.add('off');
                                        }
                                    }
                                }(me, div)/* :"")*/;
                                G.addTooltip(div, function (me) {
                                    return function () {
                                        return '<div class="info">' +
                                            '<div class="infoIcon"><div class="thing standalone' + G.getIconClasses(me, true) + '">' + G.getIconStr(me, 0, 0, true) + '</div></div>' +
                                            '<div class="fancyText barred infoTitle">' + me.displayName + '</div>' +
                                            (me.plural == true ?
                                                '<div class="fancyText barred">' + (me.won > 0 ? ('Achieved: <font color="yellow">' + me.won + '</font> ' + (me.won == 1 ? 'time' : 'times')) : 'Locked <font color="#aaffff">:(</font>') + '</div>' :
                                                '<div class="fancyText barred">' + (me.won > 0 ? ('Completed<font color="yellow"> :> </font>') : 'Locked <font color="#aaffff">:(</font>') + '</div>') +
                                            //'<div class="fancyText barred">'+(me.won>0?('<font color="yellow">Completed</font>':'Locked <font color="#aaffff">:(</font></div>')+
                                            '<div class="fancyText barred">Effects: ' + G.getAchievEffectsString(me.effects) + '</div>' +
                                            (me.desc ? ('<div class="infoDesc">' + G.parse(me.desc) + '</div>') : '') +
                                            '</div>' +
                                            G.debugInfo(me)
                                    };
                                }(me), { offY: 8 });
                            }
                        }
                    }
                });
            }
            str += '</div>';
            str += '<div class="buttonBox">' +
                G.dialogue.getCloseButton() +
                '</div>';
            return str;
        }





        //just to change name of file
        G.FileSave = function () {
            var filename = 'MagixLegacySave';//Vanilla saves are called legacySave. To recognize save with Magix I will change it
            var text = G.Export();
            var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            saveAs(blob, filename + '.txt');
        }




        //////////////
        //48x24 , 48x48 , 72x72 icons support
        G.getIconClasses = function (me, allowWide) {
            //returns some CSS classes
            var str = '';
            if (me.widerIcon && allowWide) str += ' wide2'; //48x24
            if (me.wideIcon && allowWide) str += ' wide3'; //default 72x24 for wonders
            if (me.twoxtwoIcon && allowWide) str += ' widenhigh1'; //48x48
            if (me.threexthreeIcon && allowWide) str += ' widenhigh2'; //72x72
            else str += ' wide1'; //default 24x24 for most of things
            return str;
        }




        /*================================
                Tech rerolling
        ================================*/
        G.rerollChooseBox = function (me) {
            var costs = me.getCosts();
            var success = true;
            if (!G.testCost(costs, 1)) success = false;
            var randomTxt = Math.round(Math.random() * 5);
            if (!isFinite(me.cooldown)) {
                me.cooldown = 0;
            }
            if (me.cooldown <= 0) {
                if (randomTxt <= 1) {
                    if (me.getCards().length == 0) { success = false; G.middleText('<small><font color="#fdd">There is nothing more to research for now.</font></small>'); }
                } else if (randomTxt <= 2) {
                    if (me.getCards().length == 0) { success = false; G.middleText('<small><font color="#ccf">Wait patiently. There will be something to research...unless you researched everything (which takes a very long time), then yeah. There is light at the end of the tunnel!</font></small>'); }
                } else if (randomTxt <= 3) {
                    if (me.getCards().length == 0) {
                        success = false;
                        if (G.modsByName['Elves']) G.middleText('<small><font color="#afd">There aren\'t a lot of techs for the elves for now, but the elf race can still provide bonuses!</font></small>');
                        else G.middleText('<small><font color="#afd">There are over 400 techs for the human race (although you won\'t be able to get all of them at the same time)! Just know that it will take a while to get many of them...<br>well, unless there are more updates.</font></small>');
                    }
                } else if (randomTxt <= 4) {
                    if (me.getCards().length == 0) { success = false; G.middleText('<small><font color="#aaa">More techs coming soon :)</font></small>'); }
                } else {
                    if (me.getCards().length == 0) { success = false; G.middleText('<small><font color="#f7930f">Keep playing and you may discover more! Sometimes you\'ll have to wait for a trait in order to progress.</font></small>'); }
                }
            } else {
                G.middleText('<small><font color="#999">Wait for the cooldown to end.</font></small>');
                success = false;
            }
            if (success) {
                G.doCost(costs, 1);

                var bounds = l('chooseIgniter-' + me.id).getBoundingClientRect();
                var posX = bounds.left + bounds.width / 2;
                var posY = bounds.top;
                for (var i in costs) { G.showParticle({ x: posX, y: posY, icon: G.dict[i].icon }); }

                me.justUsed = true;
                me.choices = [];
                var choices = me.getCards();
                var n = Math.min(choices.length, me.choicesN);
                for (var i = 0; i < n; i++) {
                    var choice = choose(choices);
                    if (!me.choices.includes(choice)) me.choices.push(choice);
                    //var index=choices.indexOf(choice);
                    //choices.splice(index,1);//no duplicates
                }
                me.onReroll();
                G.refreshChooseBox(me);
                me.justUsed = false;
            }
        }

        //Added by @1_e0 to make canoes and rafts work properly
        G.canoeRaftEffect = function (amount, tileName) {
            var multiplier = 0
            if (G.has('canoes')) {
                multiplier += ['swamplands', 'jungle', 'tundra', 'boreal forest'].includes(tileName) ? 0.4 : 1
            }
            if (G.has('rafts')) {
                multiplier += ['prairie', 'tundra', 'ice desert', 'forest'].includes(tileName) ? 0.4 : 1
            }
            return amount * multiplier
        }


        /*==============================
            More exact tile inspection
        ==============================*/
        G.inspectTile = function (tile) {
            if (G.has('tile inspection')) {
                //display the tile's details in the land section
                //note : this used to display every territory owned until i realized 3 frames per second doesn't make for a very compelling user experience
                var str = '';
                //Math.seedrandom(tile.map.seed+'-name-'+tile.x+'/'+tile.y);
                var name = tile.land.displayName;//choose(tile.land.names);
                str += '<div class="block framed bgMid fadeIn" id="land-0"><div class="fancyText framed bgMid blockLabel" style="float:right;">' + name + '</div><div class="fancyText segmentHeader">< - - Goods - - ><br><br><br></div><div class="thingBox" style="padding:0px;text-align:left;">';
                var I = 0;
                for (var ii in tile.goods) {
                    var me = G.getGoods(ii);
                    var amount = tile.goods[ii];
                    str += '<div id="landGoods-' + I + '" class="thing standalone' + G.getIconClasses(me) + '">' + G.getIconStr(me);
                    if (!me.noAmount) {
                        var bar = 1;
                        if (amount < 0.09) bar = 1;
                        else if (amount < 0.25) bar = 2;
                        else if (amount < 0.375) bar = 3;
                        else if (amount < 0.5) bar = 4;
                        else if (amount < 1) bar = 5;
                        else if (amount < 1.5) bar = 6;
                        else if (amount < 2.25) bar = 7;
                        else if (amount < 3) bar = 8;
                        else if (amount < 3.25) bar = 9;
                        else if (amount < 3.5) bar = 10;
                        else if (amount < 3.9) bar = 11;
                        else if (amount < 4.3) bar = 12;
                        else if (amount < 4.75) bar = 13;
                        else if (amount < 5.2) bar = 14;
                        else if (amount < 5.5) bar = 15;
                        else if (amount < 6) bar = 16;
                        else if (amount < 6.2) bar = 17;
                        else if (amount < 6.45) bar = 18;
                        else if (amount < 6.7) bar = 19;
                        else bar = 20;
                        str += '<div class="icon" style="background:url(' + magixURL + 'magixmod.png);' + G.getFreeformIcon(816, 0 + bar * 7, 24, 6) + 'top:100%;"></div>';
                    }
                    str += '</div>';
                    I++;
                }
                str += '</div></div>';
                l('landList').innerHTML = str;
                var I = 0;
                for (var ii in tile.goods) {
                    var goods = G.getGoods(ii);
                    G.addTooltip(l('landGoods-' + I), function (me, amount) {
                        return function () {
                            var str = '<div class="info">';
                            str += '<div class="infoIcon"><div class="thing standalone' + G.getIconClasses(me, true) + '">' + G.getIconStr(me, 0, 0, true) + '</div></div>';
                            str += '<div class="fancyText barred infoTitle">' + me.displayName;
                            if (!me.noAmount) {
                                str += '<div class="fancyText infoAmount">';
                                if (amount < 0.09) str += '(almost none)';
                                else if (amount < 0.25) str += '(scarce)';
                                else if (amount < 0.5) str += '(few)';
                                else if (amount < 1.5) str += '(some)';
                                else if (amount < 3) str += '(lots)';
                                else if (amount < 3.5) str += '(abundant)';
                                else if (amount < 4.7) str += '(crazy amounts)';
                                else if (amount < 5.5) str += '(insane amounts)';
                                else if (amount < 6.1) str += '(<font color="pink">actually wildly INSANE amounts</font>)';
                                else str += '(<font color="#f200aa">actually wildly INSANE amounts BUT EVEN MORE</font>)';
                                str += '</div>';
                            }
                            str += '</div>';
                            if (me.desc) str += '<div class="infoDesc">' + G.parse(me.desc) + '</div>';
                            str += '</div>';
                            str += G.debugInfo(me);
                            return str;
                        };
                    }(goods, tile.goods[ii]), { offY: -8 });
                    I++;
                }
            }//if bracket //Math.seedrandom();
        }

        /*==============================
        New TERRITORY tab content
        ==============================*/
        //only pasted to update a tooltip due to tile exploring tech
        G.update['land'] = function () {
            G.updateMapDisplay();
            G.tabs[1].showMap = true;
            if (G.has('where am i?')) {
                var str = '';
                str += G.textWithTooltip('?', '<div style="width:240px;text-align:left;"><div class="par">This is your territory. While you only start with a small tile of land, there is a whole map for you to explore if you have units with that ability.</div><div class="par">Each tile you control adds to the natural resources available for your units to gather. You get more resources from fully-explored tiles than from tiles you\'ve just encountered.</div><div class="par">If you unlocked <b>Tile inspection</b>, you can click on an explored tile on the map to the right to see what goods can be found in it, and how those goods contribute to your natural resources.</div></div>', 'infoButton');
                str += '<div id="landBox">';
                str += '<div id="landList"></div>';
                if (G.currentMap.computedPlayerRes) {
                    //display list of total gatherable resources per context
                    var I = 0;
                    var cI = 0;
                    if (G.has('tile inspection II')) {
                        str += '<div style="padding:16px;text-align:left;" class="thingBox"><div class="bitBiggerText fancyText">Total natural resources in your territory:</div>';
                    } else {
                        str += '<div style="padding:16px;text-align:left;" class="thingBox"><div class="bitBiggerText fancyText">Natural resources in your territory:</div>';
                    }
                    for (var i in G.contextNames) {
                        var context = i;
                        if (G.contextVisibility[i] || G.getSetting('debug')) {
                            var contextName = G.contextNames[i];
                            var res = G.currentMap.computedPlayerRes[i] || [];
                            str += '<div class="categoryName fancyText barred">' + contextName + '</div>';
                            str += '<div>';
                            var sortedRes = [];
                            for (var ii in res) {
                                var me = G.getRes(ii);
                                sortedRes.push({ res: me, amount: res[ii], id: me.id });
                            }
                            sortedRes.sort(function (a, b) { return b.amount - a.amount });

                            for (var ii in sortedRes) {
                                var me = sortedRes[ii].res;
                                var amount = Math.ceil(sortedRes[ii].amount * 1000) / 1000;

                                var floats = 0;
                                if (amount < 10) floats++;
                                if (amount < 1) floats++;
                                if (amount < 0.1) floats++;
                                if (G.has('tile inspection II')) {
                                    str += G.textWithTooltip('<div class="icon freestanding" style="' + G.getIconUsedBy(me) + '"></div><div id="naturalResAmount-' + cI + '-' + me.id + '" class="freelabel">x' + B(amount, floats) + '</div>', G.getResTooltip(me, '<span style="font-size:12px;">' + B(amount, floats) + ' available every day<br>by ' + contextName + '.</span>'));
                                } else {
                                    str += G.textWithTooltip('<div class="icon freestanding" style="' + G.getIconUsedBy(me) + '"></div><div id="naturalResAmount-' + cI + '-' + me.id + '" class="freelabel"></div>', G.getResTooltip(me, '<span style="font-size:12px;"></span>'));
                                }
                                I++;
                            }
                            str += '</div>';
                        }
                        cI++;
                    }
                    str += '</div>';
                }
                str += '</div>';
                l('landDiv').innerHTML = str;

                G.addCallbacks();

                if (G.inspectingTile) G.inspectTile(G.inspectingTile);
                G.draw['land']();
            } else {
                G.tabs[1].showMap = false;
                G.hideMap();
                var str = '';
                if (G.modsByName['Default dataset']) {
                    str += '<div class="fullCenteredOuter"><div class="fullCenteredInner"><div class="barred fancyText"><center style="line-height: 1.25"><font size="2.5">Get the <font color="#7f7fff">Where am I?</font> trait to unlock this tab.<br>There you\'ll see information about land your tribe settled and find which types of goods you can find here.<br><u>\u201cThe world is a book and those who don\'t travel read only one page\u201d</u> \u2014Saint Augustine</font></center></div></div></div></div></div>';
                } else {
                    str += '<div class="fullCenteredOuter"><div class="fullCenteredInner"><div class="barred fancyText"><center style="line-height: 1.25"><font size="2.5">Get the <font color="#7f7fff">Where am I?</font> trait to unlock this tab.<br>There you\'ll see information about land your tribe settled and find which types of goods you can find here.<br><u>\u201cIt feels good to be lost in the right direction\u201d \u2014Unknown</font></center></div></div></div></div></div>';
                };
                l('landDiv').innerHTML = str;


                G.draw['land']();
                G.updateMapDisplay();
            }
        }


        /*=================
        When switching policy mode you will now hear a sound*/
        G.setPolicyMode = function (me, mode) {
            //free old mode uses, and assign new mode uses
            var oldMode = me.mode;
            var newMode = mode;
            if (oldMode == newMode) return;
            me.mode = mode;
            if (me.mode.effects) G.applyKnowEffects(me.mode, false, true);
            if (G.getSetting('animations')) triggerAnim(me.l, 'plop');
            if (me.binary) {
                if (me.category != "pantheon") {
                    if (mode.id == 'off') {
                        G.playSound(magixURL + 'PolicySwitchOff.wav');
                        me.l.classList.add('off');
                    } else { G.playSound(magixURL + 'PolicySwitchOn.wav'); me.l.classList.remove('off') }
                } else {
                    if (mode.id == 'off') {
                        G.playSound(magixURL + 'spiritReject.wav');
                        me.l.classList.add('off');
                    } else {
                        G.playSound(orteilURL + 'spirit.mp3');
                        me.l.classList.remove('off')
                    }
                }
            }
        }
        //=================================================================


        /*===============================SELECT MODE FOR Policy*/
        G.selectModeForPolicy = function (me, div) {
            if (div == G.widget.parent) G.widget.close();
            else {
                G.widget.popup({
                    func: function (widget) {
                        var str = '';
                        var me = widget.linked;
                        var proto = me;
                        for (var i in proto.modes) {
                            var mode = proto.modes[i];
                            if (!mode.req || G.checkReq(mode.req)) { str += '<div class="button' + (mode.num == me.mode.num ? ' on' : '') + '" id="mode-button-' + mode.num + '">' + mode.name + '</div>'; }
                        }
                        widget.l.innerHTML = str;
                        modeFunction = function () {
                            widget.close();
                        }
                        for (var i in proto.modes) {
                            var mode = proto.modes[i];
                            if (!mode.req || G.checkReq(mode.req)) {
                                modeTarget = l('mode-button-' + mode.num)
                                modeTarget.onmouseup = function (target, mode) {
                                    return function () {
                                        //released the mouse on this mode button; test if we can switch to this mode, then close the widget
                                        if (G.speed > 0) {
                                            var me = target;
                                            var proto = me;
                                            if (mode.id != me.mode.id && G.testCost(me.cost, 1)) {
                                                if (!me.mode.use || G.testUse(G.subtractCost(me.mode.use, mode.use), 1)) {
                                                    G.doCost(me.cost, 1);
                                                    //remove "on" class from all mode buttons and add it to the current mode button
                                                    for (var i in proto.modes) { if (l('mode-button-' + proto.modes[i].num)) { l('mode-button-' + proto.modes[i].num).classList.remove('on'); } }
                                                    l('mode-button-' + mode.num).classList.add('on');
                                                    G.setPolicyMode(me, mode);
                                                    G.playSound(magixURL + 'PolicySwitchOn.wav');
                                                    if (me.l) G.popupSquares.spawn(l('mode-button-' + mode.num), me.l);
                                                }
                                            }
                                        } else G.cantWhenPaused();
                                        widget.closeOnMouseUp = false;//override default behavior
                                        widget.close(5);//schedule to close the widget in 5 frames
                                    };
                                }(me, mode, div);

                                if (!me.mode.use || G.testUse(G.subtractCost(me.mode.use, mode.use), me.amount)) addHover(modeTarget, 'hover');//fake mouseover because :hover doesn't trigger when mouse is down
                                G.addTooltip(modeTarget, function (me, target) {
                                    return function () {
                                        var proto = target;
                                        //var uses=G.subtractCost(target.mode.use,me.use);
                                        var str = '<div class="info">' + G.parse(me.desc);
                                        //if (!isEmpty(me.use)) str+='<div class="divider"></div><div class="fancyText par">Uses : '+G.getUseString(me.use,true,true)+' per '+proto.name+'</div>';
                                        //if (target.amount>0 && target.mode.num!=me.num && !isEmpty(uses)) str+='<div class="divider"></div><div class="fancyText par">Needs '+G.getUseString(uses,true,false,target.amount)+' to switch</div>';
                                        var costStr = G.getCostString(proto.cost, true, false, 1)
                                        str += (costStr.length !== 0 ? '<div><b>Changing to this mode will cost you </b>' + G.getCostString(proto.cost, true, false, 1) + '.</div>' : '<div><b>This change will not cost anything!</b></div>');
                                        return str;
                                    };
                                }(mode, me), { offY: -8 });
                            }
                        }
                    },
                    offX: 0,
                    offY: -8,
                    anchor: 'top',
                    parent: div,
                    linked: me,
                    closeOnMouseUp: true
                });
            }
        }


        G.Clear = function () {
            //erase the save and start a new one, handy when the page crashes when testing new save formats
            console.log('Save data cleared. The page should refresh!');
            setObj("civ", 0);
            G.T = 0;
            localStorage.setItem(G.saveTo, '');
            var debug = 0;
            if (G.getSetting('debug')) debug = 1;
            G.Reset(true);
            if (debug) G.setSetting('debug', 1);
            G.NewGame();
            onbeforeunload = null;
            location.reload();
        }

        /*======NEW DEBUG MENU======*/
        G.createDebugMenu = function () {
            var str = '' +
                '<div style="float:left;"><center>' +
                G.button({ text: '<font color="orange">New game</font>', tooltip: 'Instantly start a new game.', onclick: function () { G.T = 0; G.NewGameWithSameMods2(); } }) +
                G.button({ text: '<font color="lime">Load</font>', tooltip: 'Load the save again.', onclick: function () { G.T = 0; G.Load(); } }) +
                G.button({ text: '<font color="pink">Clear</font>', tooltip: 'Wipe save data.', onclick: function () { G.Clear(); } }) +
                '<br>' +
                G.button({
                    text: 'ALMIGHTY', tooltip: 'Unlock every tech, trait and policy instantly. Also unlocks the elf race!', onclick: function () {
                        G.achievByName['???'].won = 1;
                        for (var i in G.tech) {
                            var tech = G.tech[i]
                            if (!tech.skip && !G.techsOwnedNames.includes(tech.name)) G.gainTech(tech);
                        }
                        for (var i in G.trait) {
                            var trait = G.trait[i]
                            if (!trait.skip && !G.traitsOwnedNames.includes(trait.name)) {
                                G.gainTrait(trait);
                                trait.yearOfObtainment = G.year;
                            }
                        }
                        for (var i in G.policy) {
                            if (!G.policy[i].skip) G.gainPolicy(G.policy[i]);
                        }
                        G.shouldRunReqs = true;
                        var audio = new Audio(magixURL + 'spiritReject.wav');
                        audio.play();
                        G.middleText('<font color="#ebad0e">- You are almighty! -<br><small> - (cheater) - </small></font>', 'slow');
                    }
                }) +
                G.writeSettingButton({ id: 'showAllRes', name: 'showAllRes', text: '<font color="aqua">Show resources</font>', tooltip: 'Toggle whether all resources should be visible.' }) +
                //G.writeSettingButton({ id: 'tieredDisplay', name: 'tieredDisplay', text: '<font color="yellow">Show tiers</font>', tooltip: 'Toggle whether technologies should display in tiers instead of in the order they were researched.<br>While active, you can click a tech to highlight its ancestors and descendants.' }) +
                '<br>' +
                G.button({ text: '<font color="fuschia">Reveal map</font>', tooltip: 'Explore the whole map instantly.', onclick: function () { G.revealMap(G.currentMap); } }) +
                G.button({ text: '<font color="#e28">Party</font>', tooltip: 'Add some color to your gameplay!', onclick: function () { G.PARTY = G.PARTY == 0 ? 1 : 0 } }) +
                '<br><font color="lime">Debug mode has been enabled!</font>' +
                G.textWithTooltip('?', '<div style="width:240px;text-align:left;">This is the debug menu. Please debug responsibly.<br>Further debug abilities while this mode is active:<div class="bulleted">click resources to add/remove some (keyboard shortcuts work the same way they do for purchasing units)</div><div class="bulleted">ctrl-click a trait or policy to remove it (may have strange, buggy effects)</div><div class="bulleted">click the Fast ticks display to get more fast ticks<br>(the gain is ten times the amount that the add amount is)</div><div class="bulleted">always see tech costs and requirements</div><div class="bulleted">gain access to debug robot units<br><b>BEEP BOOP BEEP</b></div><div class="bulleted">edit the map</div></div>', 'infoButton') +
                '</center></div>';
            l('debug').innerHTML = str;

            G.addCallbacks();
        };


        ///////////MORE QUOTES!
        G.cantWhenPaused = function () {
            var randText = Math.floor(Math.random() * 15);
            switch (randText) {
                case 0: G.middleText('<font color="#ffffee"><small>Sorry. Can\'t do that when paused!</small></font>'); break;
                case 1: G.middleText('<font color="#ffddbb"><small>[ u n p a u s e ]</small></font>'); break;
                case 2: G.middleText('<font color="#ffd022"><small>I can\'t let you change things while time is stopped. From: Chra\'nos</small></font>'); break;
                case 3: G.middleText('<font color="#0fffee"><small>Unpause the game in order to perform this action.</small></font>'); break;
                case 4: G.middleText('<font color="#faffee"><small>You can\'t do that while time is stopped.</small></font>'); break;
                case 5: G.middleText('<font color="#ffff00"><small>You can\'t do that here...</small></font>'); break;
                case 6: G.middleText('<font color="#b0b0ff"><small>Sorry, but you can\'t rule a frozen civilization.</small></font>'); break;
                case 7: G.middleText('<font color="#b0b0ff"><small>Ask or DM pelletsstarPL (mod creator & Grand Magixian), and maybe he will help you.</small></font>'); break;
                case 8: G.middleText('<font color="lime"><small>Log #' + Math.round(Math.random() * 132767) + 1 + '<br>Attempted to perform operation while paused<br>ACTION INTERRUPTED</small></font>'); break;
                case 9: G.middleText('<font color="#ffbbaa"><small>Don\'t push while paused. It won\'t provide you anything.</small></font>'); break;
                case 10: G.middleText('<font color="cyan"><small>Oh no, no. Don\'t think I will let you do this like that. >:)</small></font>'); break;
                case 11: G.middleText('<font color="#aa00ff"><small>No doing things when paused in the halls.<br>' + Math.round(Math.random() * 30) + ' seconds. Detention for you.</small></font>'); break;
                case 12: G.middleText('<font color="#a0F0b0"><small>Nuh uh. Unpause first.</small></font>'); break;
                case 13: G.middleText('<font color="#0a0F0b"><small>You have no power to rule while the time is frozen.</small></font>'); break;
                case 14: G.middleText('<font color="#ffe5ba"><small>Did you know we have fifteen ways of telling you to unpause the time?</small></font>'); break;
            };
        }



        /*=============================
        MAP GENERATION. PASTED TO MAKE CUSTOM BIOMES GRAPHICALLY DISPLAY ON Map
        =============================*/
        G.LoadResources = function () { }

        G.createMaps = function ()//when creating a new game
        {
            G.currentMap = new G.Map(0, 24, 24);

            //set starting tile by ranking all land tiles by score and picking one
            var goodTiles = [];
            for (var x = 1; x < G.currentMap.w - 1; x++) {
                for (var y = 1; y < G.currentMap.h - 1; y++) {
                    var land = G.currentMap.tiles[x][y].land;
                    if (!land.ocean) goodTiles.push([x, y, (land.score || 0) + Math.random() * 2]);
                }
            }
            goodTiles.sort(function (a, b) { return b[2] - a[2] });
            var tile = 0;
            if (G.startingType == 2) tile = choose(goodTiles);//just drop me wherever
            else {
                var ind = 0;
                if (G.startingType == 1) ind = Math.floor((0.85 + Math.random() * 0.15) * goodTiles.length);//15% worst
                //ind=Math.floor((0.3+Math.random()*0.4)*goodTiles.length);//30% to 70% average
                else ind = Math.floor((Math.random() * 0.15) * goodTiles.length);//15% nicest
                tile = goodTiles[ind];
            }
            tile = G.currentMap.tiles[tile[0]][tile[1]];
            tile.owner = 1;
            var mark = Math.random();
            var bonus = 0;
            var exp = 0;
            var mausobonus = 0;
            if (mark <= 0.5) { bonus = bonus - 1 } else { bonus = bonus + 1 };
            if (G.modsByName['Default dataset']) {
                var mausobonus = Math.floor(G.achievByName['mausoleum'].won / 2);
                if (G.achievByName['mausoleum'].won > 10) mausobonus = 5;
                exp = 10 + bonus + mausobonus + mark;
            } else {
                exp = 10 + bonus;
            };
            tile.explored = (exp) / 100;//create one tile and 9-11% of it will be explored already. Oh, and +1 to 5 percent depending on how evolved your mauso is

            G.updateMapForOwners(G.currentMap);

            G.updateMapDisplay();
            G.centerMap(G.currentMap);
        }
        G.getLandIconBG = function (land) {
            return 'url(' + magixURL + '/terrainMagix.png),url(' + magixURL + '/terrainMagix.png)';
        }
        G.renderMap = function (map, obj) {
            var time = Date.now();
            var timeStep = Date.now();
            var verbose = false;
            var breakdown = false;//visually break down the drawing of the map into steps, which is handy to understand what's happening
            var toDiv = l('mapBreakdown');
            if (breakdown) toDiv.style.display = 'block';

            if (verbose) { console.log('Now rendering map.'); }

            Math.seedrandom(map.seed);

            var ts = 16;//tile size

            var colorShift = true;
            var seaFoam = true;
            //var x1=5,y1=5,x2=x1+3,y2=y1+3;
            var x1 = 0, y1 = 0, x2 = map.w, y2 = map.h;
            if (obj) {
                if (obj.x1) x1 = obj.x1;
                if (obj.x2) x2 = obj.x2;
                if (obj.y1) y1 = obj.y1;
                if (obj.y2) y2 = obj.y2;
            }

            var totalw = map.w;//x2-x1;
            var totalh = map.h;//y2-y1;

            var img = new Image();   //Create new img element
            img.src = magixURL + 'terrainMagix.png';
            var fog = Pic('img/blot.png');

            var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
            var ctx = c.getContext('2d');
            ctx.translate(ts / 2, ts / 2);
            for (var x = 0; x < map.w; x++) {
                for (var y = 0; y < map.h; y++) {
                    if (x >= x1 && x < x2 && y >= y1 && y < y2) {
                        var tile = map.tiles[x][y];
                        if (tile.explored > 0) {
                            ctx.globalAlpha = tile.explored * 0.9 + 0.1;
                            Math.seedrandom(map.seed + '-fog-' + x + '/' + y);
                            var s = 1;
                            //"pull" the center to other explored tiles
                            var sx = 0; var sy = 0; var neighbors = 0;
                            if (x == 0 || map.tiles[x - 1][y].explored > 0) { sx -= 1; neighbors++; }
                            if (x == map.w - 1 || map.tiles[x + 1][y].explored > 0) { sx += 1; neighbors++; }
                            if (y == 0 || map.tiles[x][y - 1].explored > 0) { sy -= 1; neighbors++; }
                            if (y == map.h - 1 || map.tiles[x][y + 1].explored > 0) { sy += 1; neighbors++; }
                            s *= 0.6 + 0.1 * (neighbors);
                            sx += Math.random() * 2 - 1;
                            sy += Math.random() * 2 - 1;
                            var pullAmount = 2;

                            var px = choose([0]); var py = choose([0]);
                            var r = Math.random() * Math.PI * 2;

                            ctx.translate(sx * pullAmount, sy * pullAmount);
                            ctx.scale(s, s);
                            ctx.rotate(r);
                            ctx.drawImage(fog, px * 32 + 1, py * 32 + 1, 30, 30, -ts, -ts, 32, 32);
                            ctx.rotate(-r);
                            ctx.scale(1 / s, 1 / s);
                            ctx.translate(-sx * pullAmount, -sy * pullAmount);
                        }
                    }
                    ctx.translate(0, ts);
                }
                ctx.translate(ts, -map.h * ts);
            }
            ctx.globalAlpha = 1;
            var imgFog = c;
            if (breakdown) toDiv.appendChild(c);
            if (verbose) { console.log('    FOG took             ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }

            var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
            var ctx = c.getContext('2d');
            ctx.drawImage(imgFog, 0, 0);
            var oldc = c;

            var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
            var ctx = c.getContext('2d');
            ctx.drawImage(oldc, 0, 0);
            ctx.drawImage(c, -1, 0);
            ctx.drawImage(c, 1, 0);
            ctx.drawImage(c, 0, -1);
            ctx.drawImage(c, 0, 1);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.drawImage(oldc, 0, 0);
            ctx.drawImage(oldc, 0, 0);
            ctx.drawImage(oldc, 0, 0);
            ctx.drawImage(oldc, 0, 0);
            ctx.drawImage(oldc, 0, 0);
            ctx.globalCompositeOperation = 'source-in';
            ctx.beginPath();
            ctx.rect(0, 0, map.w * ts, map.h * ts);
            ctx.fillStyle = 'rgb(200,150,100)';
            ctx.fill();
            oldc = 0;
            var imgOutline = c;
            if (breakdown) toDiv.appendChild(c);
            if (verbose) { console.log('    OUTLINE took         ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }
            var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
            var ctx = c.getContext('2d');
            ctx.globalCompositeOperation = 'lighten';
            ctx.translate(ts / 2, ts / 2);
            for (var x = 0; x < map.w; x++) {
                for (var y = 0; y < map.h; y++) {
                    if (x >= x1 && x < x2 && y >= y1 && y < y2) {
                        var land = map.tiles[x][y].land;
                        if (!land.ocean) {
                            Math.seedrandom(map.seed + '-base-' + x + '/' + y);
                            var s = 1;
                            //"pull" the center to other land tiles
                            var sx = 0; var sy = 0; var neighbors = 0;
                            if (x == 0 || !map.tiles[x - 1][y].land.ocean) { sx -= 1; neighbors++; }
                            if (x == map.w - 1 || !map.tiles[x + 1][y].land.ocean) { sx += 1; neighbors++; }
                            if (y == 0 || !map.tiles[x][y - 1].land.ocean) { sy -= 1; neighbors++; }
                            if (y == map.h - 1 || !map.tiles[x][y + 1].land.ocean) { sy += 1; neighbors++; }
                            s *= 0.6 + 0.1 * (neighbors);
                            if (neighbors == 0) s *= 0.65 + Math.random() * 0.35;//island
                            sx += Math.random() * 2 - 1;
                            sy += Math.random() * 2 - 1;
                            var pullAmount = 4;

                            var px = choose([0, 1]); var py = choose([0, 1, 2, 3, 4]);
                            var r = Math.random() * Math.PI * 2;

                            ctx.translate(sx * pullAmount, sy * pullAmount);
                            ctx.scale(s, s);
                            ctx.rotate(r);
                            ctx.drawImage(img, px * 32 + 1, py * 32 + 1, 30, 30, -ts, -ts, 32, 32);
                            ctx.rotate(-r);
                            ctx.scale(1 / s, 1 / s);
                            ctx.translate(-sx * pullAmount, -sy * pullAmount);
                        }
                    }
                    ctx.translate(0, ts);
                }
                ctx.translate(ts, -map.h * ts);
            }
            var imgBase = c;
            if (breakdown) toDiv.appendChild(c);
            if (verbose) { console.log('    HEIGHTMAP took         ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }

            //create colors for sea and land
            var c = document.createElement('canvas'); c.width = totalw * 2; c.height = totalh * 2;//sea
            var ctx = c.getContext('2d');
            for (var x = 0; x < map.w; x++) {
                for (var y = 0; y < map.h; y++) {
                    if (x >= x1 && x < x2 && y >= y1 && y < y2) {
                        var land = map.tiles[x][y].land;
                        if (land.ocean) {
                            Math.seedrandom(map.seed + '-seaColor-' + x + '/' + y);
                            var px = land.image; var py = 0;
                            ctx.drawImage(img, px * 32 + Math.random() * 30 + 1, py * 32 + Math.random() * 30 + 1, 1, 1, x * 2, y * 2, 1, 1);
                            ctx.drawImage(img, px * 32 + Math.random() * 30 + 1, py * 32 + Math.random() * 30 + 1, 1, 1, x * 2 + 1, y * 2, 1, 1);
                            ctx.drawImage(img, px * 32 + Math.random() * 30 + 1, py * 32 + Math.random() * 30 + 1, 1, 1, x * 2, y * 2 + 1, 1, 1);
                            ctx.drawImage(img, px * 32 + Math.random() * 30 + 1, py * 32 + Math.random() * 30 + 1, 1, 1, x * 2 + 1, y * 2 + 1, 1, 1);
                        }
                    }
                }
            }
            ctx.globalCompositeOperation = 'destination-over';//bleed
            ctx.drawImage(c, 1, 0);
            ctx.drawImage(c, -1, 0);
            ctx.drawImage(c, 0, -1);
            ctx.drawImage(c, 0, 1);
            ctx.globalCompositeOperation = 'source-over';//blur
            ctx.globalAlpha = 0.25;
            ctx.drawImage(c, 2, 0);
            ctx.drawImage(c, -2, 0);
            ctx.drawImage(c, 0, -2);
            ctx.drawImage(c, 0, 2);
            var imgSea = c;
            if (breakdown) toDiv.appendChild(c);
            if (verbose) { console.log('    MICROCOLORS took     ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }

            var c = document.createElement('canvas'); c.width = totalw * 2; c.height = totalh * 2;//land
            var ctx = c.getContext('2d');
            for (var x = 0; x < map.w; x++) {
                for (var y = 0; y < map.h; y++) {
                    if (x >= x1 && x < x2 && y >= y1 && y < y2) {
                        var land = map.tiles[x][y].land;
                        if (!land.ocean) {
                            Math.seedrandom(map.seed + '-landColor-' + x + '/' + y);
                            var px = land.image; var py = 0;
                            ctx.drawImage(img, px * 32 + Math.random() * 30 + 1, py * 32 + Math.random() * 30 + 1, 1, 1, x * 2, y * 2, 1, 1);
                            ctx.drawImage(img, px * 32 + Math.random() * 30 + 1, py * 32 + Math.random() * 30 + 1, 1, 1, x * 2 + 1, y * 2, 1, 1);
                            ctx.drawImage(img, px * 32 + Math.random() * 30 + 1, py * 32 + Math.random() * 30 + 1, 1, 1, x * 2, y * 2 + 1, 1, 1);
                            ctx.drawImage(img, px * 32 + Math.random() * 30 + 1, py * 32 + Math.random() * 30 + 1, 1, 1, x * 2 + 1, y * 2 + 1, 1, 1);
                        }
                    }
                }
            }
            ctx.globalCompositeOperation = 'destination-over';//bleed
            ctx.drawImage(c, 1, 0);
            ctx.drawImage(c, -1, 0);
            ctx.drawImage(c, 0, -1);
            ctx.drawImage(c, 0, 1);
            var imgLand = c;
            if (breakdown) toDiv.appendChild(c);
            if (verbose) { console.log('    LAND COLORS took     ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }


            //sea color
            var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
            var ctx = c.getContext('2d');
            ctx.drawImage(imgSea, 0, 0, map.w * ts, map.h * ts);
            ctx.globalCompositeOperation = 'source-over';
            ctx.translate(ts / 2, ts / 2);
            for (var x = 0; x < map.w; x++) {
                for (var y = 0; y < map.h; y++) {
                    if (x >= x1 && x < x2 && y >= y1 && y < y2) {
                        var land = map.tiles[x][y].land;
                        if (land.ocean) {
                            Math.seedrandom(map.seed + '-detail-' + x + '/' + y);
                            var px = land.image; var py = choose([2, 4]);
                            var r = Math.random() * Math.PI * 2;
                            var s = 0.9 + Math.random() * 0.3;

                            ctx.scale(s, s);
                            ctx.rotate(r);
                            ctx.drawImage(img, px * 32 + 1, py * 32 + 1, 30, 30, -ts, -ts, 32, 32);
                            ctx.rotate(-r);
                            ctx.scale(1 / s, 1 / s);
                        }
                    }
                    ctx.translate(0, ts);
                }
                ctx.translate(ts, -map.h * ts);
            }
            var imgSeaColor = c;
            if (breakdown) toDiv.appendChild(c);
            if (verbose) { console.log('    SEA COLORS took     ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }

            if (seaFoam) {
                var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
                var ctx = c.getContext('2d');
                ctx.drawImage(imgBase, 0, 0);
                var size = 4;
                ctx.globalAlpha = 0.25;
                ctx.drawImage(c, -size, 0);
                ctx.drawImage(c, size, 0);
                ctx.drawImage(c, 0, -size);
                ctx.drawImage(c, 0, size);
                ctx.drawImage(c, -size, 0);
                ctx.drawImage(c, size, 0);
                ctx.drawImage(c, 0, -size);
                ctx.drawImage(c, 0, size);
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = 'destination-out';
                ctx.drawImage(imgBase, -1, 0);
                ctx.drawImage(imgBase, 1, 0);
                ctx.drawImage(imgBase, 0, -1);
                ctx.drawImage(imgBase, 0, 1);
                ctx.globalCompositeOperation = 'source-in';
                ctx.beginPath();
                ctx.rect(0, 0, map.w * ts, map.h * ts);
                ctx.fillStyle = 'rgb(255,255,255)';
                ctx.fill();
                var imgEdges = c;
                if (breakdown) toDiv.appendChild(c);
                c = imgSeaColor; ctx = c.getContext('2d');
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.globalCompositeOperation = 'overlay';
                ctx.drawImage(imgEdges, 0, 0);
                ctx.drawImage(imgEdges, 0, 0);
                if (verbose) { console.log('    FOAM took             ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }
            }

            //draw land shadow on the sea
            c = imgSeaColor; ctx = c.getContext('2d');
            ctx.globalCompositeOperation = 'destination-out';
            ctx.globalAlpha = 0.5;
            ctx.drawImage(imgBase, 2, 2);
            ctx.drawImage(imgBase, 4, 4);
            ctx.globalCompositeOperation = 'destination-over';
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.rect(0, 0, map.w * ts, map.h * ts);
            ctx.fillStyle = 'rgb(0,0,0)';
            ctx.fill();
            if (verbose) { console.log('    SEA SHADOW took     ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }

            //sea heightmap
            var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
            var ctx = c.getContext('2d');
            //fill with dark base
            ctx.beginPath();
            ctx.rect(0, 0, map.w * ts, map.h * ts);
            ctx.fillStyle = 'rgb(64,64,64)';
            ctx.fill();
            ctx.globalCompositeOperation = 'overlay';
            ctx.translate(ts / 2, ts / 2);
            for (var x = 0; x < map.w; x++) {
                for (var y = 0; y < map.h; y++) {
                    if (x >= x1 && x < x2 && y >= y1 && y < y2) {
                        var land = map.tiles[x][y].land;
                        if (land.ocean) {
                            Math.seedrandom(map.seed + '-detail-' + x + '/' + y);
                            var px = land.image; var py = choose([1, 3]);
                            var r = Math.random() * Math.PI * 2;
                            var s = 0.9 + Math.random() * 0.3;

                            ctx.scale(s, s);
                            ctx.rotate(r);
                            ctx.drawImage(img, px * 32 + 1, py * 32 + 1, 30, 30, -ts, -ts, 32, 32);
                            ctx.rotate(-r);
                            ctx.scale(1 / s, 1 / s);
                        }
                    }
                    ctx.translate(0, ts);
                }
                ctx.translate(ts, -map.h * ts);
            }
            var imgSeaHeight = c;
            if (breakdown) toDiv.appendChild(c);
            if (verbose) { console.log('    SEA HEIGHTMAP took     ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }

            var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
            var ctx = c.getContext('2d');
            ctx.drawImage(imgBase, 0, 0, map.w * ts, map.h * ts);//draw the coastline
            ctx.globalCompositeOperation = 'source-in';
            ctx.drawImage(imgLand, 0, 0, map.w * ts, map.h * ts);//draw land colors within the coastline
            ctx.globalCompositeOperation = 'destination-over';
            ctx.drawImage(imgSeaColor, 0, 0, map.w * ts, map.h * ts);//draw sea colors behind the coastline
            if (verbose) { console.log('    COMPOSITING took     ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }

            //add color details for each tile
            ctx.globalCompositeOperation = 'source-over';
            ctx.translate(ts / 2, ts / 2);
            for (var x = 0; x < map.w; x++) {
                for (var y = 0; y < map.h; y++) {
                    if (x >= x1 && x < x2 && y >= y1 && y < y2) {
                        var land = map.tiles[x][y].land;
                        if (!land.ocean) {
                            Math.seedrandom(map.seed + '-detail-' + x + '/' + y);
                            var s = 1;
                            //"pull"
                            var sx = 0; var sy = 0; var neighbors = 0;
                            if (x == 0 || !map.tiles[x - 1][y].land.ocean) { sx -= 1; neighbors++; }
                            if (x == map.w - 1 || !map.tiles[x + 1][y].land.ocean) { sx += 1; neighbors++; }
                            if (y == 0 || !map.tiles[x][y - 1].land.ocean) { sy -= 1; neighbors++; }
                            if (y == map.h - 1 || !map.tiles[x][y + 1].land.ocean) { sy += 1; neighbors++; }
                            s *= 0.6 + 0.1 * (neighbors);
                            if (neighbors == 0) s *= 0.65 + Math.random() * 0.35;//island
                            sx += Math.random() * 2 - 1;
                            sy += Math.random() * 2 - 1;
                            var pullAmount = 4;

                            var px = land.image; var py = choose([2, 4]);
                            var r = Math.random() * Math.PI * 2;

                            ctx.translate(sx * pullAmount, sy * pullAmount);
                            ctx.scale(s, s);
                            ctx.rotate(r);
                            ctx.drawImage(img, px * 32 + 1, py * 32 + 1, 30, 30, -ts, -ts, 32, 32);
                            ctx.rotate(-r);
                            ctx.scale(1 / s, 1 / s);
                            ctx.translate(-sx * pullAmount, -sy * pullAmount);
                        }
                    }
                    ctx.translate(0, ts);
                }
                ctx.translate(ts, -map.h * ts);
            }
            var imgColor = c;
            if (breakdown) toDiv.appendChild(c);
            if (verbose) { console.log('    COLOR DETAIL took     ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }

            //add heightmap details for each tile in overlay blending mode
            var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
            var ctx = c.getContext('2d');
            //fill with dark base
            ctx.beginPath();
            ctx.rect(0, 0, map.w * ts, map.h * ts);
            ctx.fillStyle = 'rgb(32,32,32)';
            ctx.fill();
            ctx.drawImage(imgSeaHeight, 0, 0, map.w * ts, map.h * ts);//draw the sea heightmap
            ctx.drawImage(imgBase, 0, 0, map.w * ts, map.h * ts);//draw the coastline
            ctx.globalCompositeOperation = 'overlay';
            ctx.translate(ts / 2, ts / 2);
            for (var x = 0; x < map.w; x++) {
                for (var y = 0; y < map.h; y++) {
                    if (x >= x1 && x < x2 && y >= y1 && y < y2) {
                        var land = map.tiles[x][y].land;
                        if (!land.ocean) {
                            Math.seedrandom(map.seed + '-detail-' + x + '/' + y);
                            var s = 1;
                            //"pull"
                            var sx = 0; var sy = 0; var neighbors = 0;
                            if (x == 0 || !map.tiles[x - 1][y].land.ocean) { sx -= 1; neighbors++; }
                            if (x == map.w - 1 || !map.tiles[x + 1][y].land.ocean) { sx += 1; neighbors++; }
                            if (y == 0 || !map.tiles[x][y - 1].land.ocean) { sy -= 1; neighbors++; }
                            if (y == map.h - 1 || !map.tiles[x][y + 1].land.ocean) { sy += 1; neighbors++; }
                            s *= 0.6 + 0.1 * (neighbors);
                            if (neighbors == 0) s *= 0.65 + Math.random() * 0.35;//island
                            sx += Math.random() * 2 - 1;
                            sy += Math.random() * 2 - 1;
                            var pullAmount = 4;

                            var px = land.image; var py = choose([1, 3]);
                            var r = Math.random() * Math.PI * 2;

                            ctx.translate(sx * pullAmount, sy * pullAmount);
                            ctx.scale(s, s);
                            ctx.rotate(r);
                            ctx.drawImage(img, px * 32 + 1, py * 32 + 1, 30, 30, -ts, -ts, 32, 32);
                            ctx.rotate(-r);
                            ctx.scale(1 / s, 1 / s);
                            ctx.translate(-sx * pullAmount, -sy * pullAmount);
                        }
                    }
                    ctx.translate(0, ts);
                }
                ctx.translate(ts, -map.h * ts);
            }
            var imgHeight = c;
            if (breakdown) toDiv.appendChild(c);
            if (verbose) { console.log('    HEIGHT DETAIL took     ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }

            //embossing
            var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
            var ctx = c.getContext('2d');
            ctx.drawImage(imgHeight, 1, 1);
            ctx.beginPath();
            ctx.rect(0, 0, map.w * ts, map.h * ts);
            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.globalCompositeOperation = 'difference';
            ctx.fill();//invert
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 0.5;
            ctx.drawImage(imgHeight, 0, 0);//create emboss
            ctx.globalCompositeOperation = 'hard-light';
            ctx.globalAlpha = 1;
            ctx.drawImage(c, 0, 0);
            //ctx.drawImage(c,0,0);
            var imgEmboss1 = c;
            if (breakdown) toDiv.appendChild(c);

            var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
            var ctx = c.getContext('2d');
            ctx.drawImage(imgHeight, 1, 1);
            ctx.beginPath();
            ctx.rect(0, 0, map.w * ts, map.h * ts);
            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.globalCompositeOperation = 'difference';
            ctx.fill();//invert
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 0.5;
            ctx.drawImage(imgHeight, -1, -1);//create emboss
            ctx.globalCompositeOperation = 'hard-light';
            ctx.globalAlpha = 1;
            //ctx.drawImage(c,0,0);
            var imgEmboss2 = c;
            if (breakdown) toDiv.appendChild(c);

            //ambient occlusion (highpass)
            var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
            var ctx = c.getContext('2d');
            ctx.drawImage(imgHeight, 0, 0);
            var size = 2;
            ctx.globalAlpha = 0.5;
            ctx.drawImage(c, -size, 0);
            ctx.drawImage(c, size, 0);
            ctx.drawImage(c, 0, -size);
            ctx.drawImage(c, 0, size);
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.rect(0, 0, map.w * ts, map.h * ts);
            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.globalCompositeOperation = 'difference';
            ctx.fill();//invert
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 0.5;
            ctx.drawImage(imgHeight, 0, 0);
            ctx.globalCompositeOperation = 'overlay';
            ctx.drawImage(c, 0, 0);
            ctx.drawImage(c, 0, 0);
            var imgAO = c;
            if (breakdown) toDiv.appendChild(c);
            if (verbose) { console.log('    RELIEF took         ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }

            //add emboss and color
            var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
            var ctx = c.getContext('2d');
            ctx.drawImage(imgEmboss1, 0, 0);
            ctx.globalCompositeOperation = 'overlay';
            ctx.drawImage(imgEmboss2, 1, 1);//combine both emboss passes
            /*ctx.globalAlpha=0.5;
            ctx.drawImage(imgHeight,0,0);
            ctx.globalAlpha=1;*/
            ctx.globalCompositeOperation = 'hard-light';
            ctx.drawImage(imgColor, 0, 0);//add color
            ctx.globalCompositeOperation = 'overlay';
            ctx.drawImage(imgAO, 0, 0);//add AO
            var imgFinal = c;
            if (verbose) { console.log('    COMPOSITING 2 took     ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }

            //blots (big spots of random color to give the map some unity)
            Math.seedrandom(map.seed + '-blots');
            ctx.globalCompositeOperation = 'soft-light';
            ctx.globalAlpha = 0.25;
            for (var i = 0; i < 4; i++) {
                var x = Math.random() * map.w * ts;
                var y = Math.random() * map.h * ts;
                var s = Math.max(map.w, map.h) * ts;
                var grd = ctx.createRadialGradient(x, y, 0, x, y, s / 2);
                grd.addColorStop(0, 'rgb(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ')');
                grd.addColorStop(1, 'rgb(128,128,128)');
                ctx.fillStyle = grd;
                ctx.fillRect(x - s / 2, y - s / 2, s, s);
            }
            if (verbose) { console.log('    BLOTS took             ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }

            if (colorShift) {
                //heck, why not. slight channel-shifting
                var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
                var ctx = c.getContext('2d');
                ctx.drawImage(imgFinal, 0, 0);
                ctx.globalCompositeOperation = 'multiply';
                ctx.beginPath();
                ctx.rect(0, 0, map.w * ts, map.h * ts);
                ctx.fillStyle = 'rgb(255,0,0)';
                ctx.fill();
                var imgRed = c;
                var c = document.createElement('canvas'); c.width = totalw * ts; c.height = totalh * ts;
                var ctx = c.getContext('2d');
                ctx.drawImage(imgFinal, 0, 0);
                ctx.globalCompositeOperation = 'multiply';
                ctx.beginPath();
                ctx.rect(0, 0, map.w * ts, map.h * ts);
                ctx.fillStyle = 'rgb(0,255,255)';
                ctx.fill();
                var imgCyan = c;
                //if (breakdown) toDiv.appendChild(c);
                if (verbose) { console.log('    COLORSHIFT took     ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }
            }

            c = imgFinal; ctx = c.getContext('2d');
            if (colorShift) {
                ctx.globalCompositeOperation = 'lighten';
                ctx.globalAlpha = 0.5;
                ctx.drawImage(imgRed, -1, -1);
                ctx.drawImage(imgCyan, 1, 1);
            }
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'soft-light';
            ctx.beginPath();
            ctx.rect(0, 0, map.w * ts, map.h * ts);
            ctx.fillStyle = 'rgb(160,128,96)';
            ctx.fill();//some slight sepia to finish it up

            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(imgFog, 0, 0);//fog
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(imgOutline, 0, 0);//outline

            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;

            if (breakdown) toDiv.appendChild(c);
            else {
                //flush
                var imgBase = 0;
                var imgFog = 0;
                var imgOutline = 0;
                var imgSea = 0;
                var imgLand = 0;
                var imgSeaColor = 0;
                var imgColor = 0;
                var imgEdges = 0;
                var imgSeaHeight = 0;
                var imgHeight = 0;
                var imgEmboss1 = 0;
                var imgEmboss2 = 0;
                var imgAO = 0;
                var imgFinal = 0;
                var imgRed = 0;
                var imgCyan = 0;
            }
            Math.seedrandom();
            if (verbose) { console.log('    FINAL STEPS took     ' + (Date.now() - timeStep) + 'ms'); timeStep = Date.now(); }

            if (verbose) console.log('Rendering map took ' + (Date.now() - time) + 'ms.');
            return c;
        }
        var faicost; var inscost;

        ///////////////////
        G.Message = function (obj) {
            //syntax :
            //G.Message({type:'important',text:'This is a message.'});
            //.type is optional
            var me = {};
            me.type = 'normal';
            for (var i in obj) { me[i] = obj[i]; }
            var scrolled = !(Math.abs(G.messagesWrapl.scrollTop - (G.messagesWrapl.scrollHeight - G.messagesWrapl.offsetHeight)) < 3);//is the message list not scrolled at the bottom? (if yes, don't update the scroll - the player probably manually scrolled it)

            me.date = G.year * 300 + G.day;
            var text = me.text || me.textFunc(me.args);

            var mergeWith = 0;
            if (me.mergeId) {
                //this is a system where similar messages merge together if they're within 100 days of each other, in order to reduce spam
                //simply declare a .mergeId to activate merging on this message with others like it
                //syntax :
                //var cakes=10;G.Message({type:'important',mergeId:'newCakes',textFunc:function(args){return 'We\'ve baked '+args.n+' new cakes.';},args:{n:cakes}});
                //numeric arguments will be added to the old ones unless .replaceOnly is true

                for (var i in G.messages) {
                    var other = G.messages[i];
                    if (other.id == me.mergeId && me.date - other.date < 100) mergeWith = other;
                }
                me.id = me.mergeId;
            }
            if (mergeWith) {
                me.date = other.date;
                if (me.replaceOnly) {
                    for (var i in me.args) { mergeWith.args[i] = me.args[i]; }
                }
                else {
                    for (var i in me.args) {
                        if (!isNaN(parseFloat(me.args[i]))) mergeWith.args[i] += me.args[i];
                        else mergeWith.args[i] = me.args[i];
                    }
                }
                text = me.textFunc(mergeWith.args);
            }
            if (G.has('primary time measure') && !G.has('time measuring 1/2')) {
                var str = '<div class="messageTimestamp" title="' + 'century ' + Math.floor(((G.year / 100) + 1)) + '">' + 'C:' + Math.floor(((G.year / 100) + 1)) + '</div>' +
                    '<div class="messageContent' + (me.icon ? ' hasIcon' : '') + '">' + (me.icon ? (G.getArbitraryIcon(me.icon)) : '') + '<span class="messageText">' + text + '</span></div>';
            }
            else if (G.has('time measuring 2/2')) {
                var str = '<div class="messageTimestamp" title="' + 'Year ' + (G.year + 1) + ', day ' + (G.day + 1) + '">' + 'Y:' + (G.year + 1) + '</div>' +
                    '<div class="messageContent' + (me.icon ? ' hasIcon' : '') + '">' + (me.icon ? (G.getArbitraryIcon(me.icon)) : '') + '<span class="messageText">' + text + '</span></div>';
            } else if (G.has('time measuring 1/2') && !G.has('time measuring 2/2')) {
                var str = '<div class="messageTimestamp" title="' + 'Year ' + (G.year + 1) + '">' + 'Y:' + (G.year + 1) + '</div>' +
                    '<div class="messageContent' + (me.icon ? ' hasIcon' : '') + '">' + (me.icon ? (G.getArbitraryIcon(me.icon)) : '') + '<span class="messageText">' + text + '</span></div>';
            } else {
                var str = '<div class="messageTimestamp"></div>' +
                    '<div class="messageContent' + (me.icon ? ' hasIcon' : '') + '">' + (me.icon ? (G.getArbitraryIcon(me.icon)) : '') + '<span class="messageText">' + text + '</span></div>';
            }
            if (mergeWith) mergeWith.l.innerHTML = str;
            else {
                var div = document.createElement('div');
                div.innerHTML = str;
                div.className = 'message popInVertical ' + (me.type).replaceAll(' ', 'Message ') + 'Message';
                G.messagesl.appendChild(div);
                me.l = div;
                G.messages.push(me);
                if (G.messages.length > G.maxMessages) {
                    var el = G.messagesl.firstChild;
                    for (var i in G.messages) {
                        if (G.messages[i].l == el) {
                            G.messages.splice(i, 1);
                            break;
                        }
                    }
                    G.messagesl.removeChild(el);
                    //G.messages.pop();
                    //G.messagesl.removeChild(G.messagesl.firstChild);
                }
                if (!scrolled) G.messagesWrapl.scrollTop = G.messagesWrapl.scrollHeight - G.messagesWrapl.offsetHeight;
            }
            G.addCallbacks();
        }

        G.Logic = function (forceTick) {
            for (var i in G.unit) {
                if (G.unit[i].visible == undefined) G.unit[i].visible = true;
            }
            //Speedresearcher
            var techs = G.techN - G.miscTechN + G.knowN;

            if (G.modsByName['Default dataset']) {
                if (Date.now() - G.startDate <= 600000) {
                    if (techs >= 60) {
                        if (G.achievByName['speedresearcher'].won == 0) G.middleText("- Completed Speedresearcher I<br>shadow achievement - ", 'slow');
                        G.achievByName['speedresearcher'].won = 1;
                    }

                    if (techs >= 100) {
                        if (G.achievByName['speedresearcher II'].won == 0) G.middleText("- Completed Speedresearcher II<br>shadow achievement - <br><hr width='30%' /><br><small>So speedy...</small>", 'slow');
                        G.achievByName['speedresearcher II'].won = 1;
                    }
                }
            }
            if (G.modsByName['Elves']) {
                if (Date.now() - G.startDate <= 1800000) {
                    if (techs >= 50) {
                        if (G.achievByName['speeddiscoverer'].won == 0) G.middleText("- Completed Speeddiscoverer I<br>shadow achievement - <br><hr width='30%' /><br><small>The battery is burning...it looks like.</small>", 'slow');
                        G.achievByName['speeddiscoverer'].won = 1;
                    }
                }
            }


            if (G.PARTY) {
                //Messing with CSS is goofy
                var pulse = Math.pow((G.T % 10) / 10, 0.5);
                G.l.style.filter = 'hue-rotate(' + ((G.T * 5) % 360) + 'deg) brightness(' + (150 - 50 * pulse) + '%)';
                G.l.style.webkitFilter = 'hue-rotate(' + ((G.T * 5) % 360) + 'deg) brightness(' + (150 - 50 * pulse) + '%)';
                G.l.style.transform = 'scale(' + (1.02 - 0.02 * pulse) + ',' + (1.02 - 0.02 * pulse) + ') rotate(' + (Math.sin(G.T * 0.5) * 0.5) + 'deg)';
                l('foreground').style.overflowX = 'hidden';
                l('foreground').style.overflowY = 'hidden';
            } else {
                G.l.style.filter = null;
                G.l.style.webkitFilter = null;
                G.l.style.transform = null;
                l('foreground').style.overflowX = null;
                l('foreground').style.overflowY = null;
            }
            //forceTick lets us execute logic and force a tick update
            if (G.sequence == 'loading' || G.sequence == 'checking' || G.sequence == 'updating') {
                var done = G.LogicModLoading();
            }
            else if (G.sequence == 'main') {
                G.oldSpeed = G.speed;
                G.speed = 1;
                if (G.getSetting('fast')) G.speed = 2;
                if (G.getSetting('paused')) G.speed = 0;
                if (G.getSetting('forcePaused')) G.speed = 0;
                if (forceTick) G.speed = 1;

                if (G.speed == 0) {
                    //accumulate fast ticks when paused
                    G.nextFastTick--;
                    if (G.nextFastTick <= 0) { G.fastTicks++; G.nextFastTick = G.tickDuration; }
                }

                if (G.oldSpeed != G.speed) {
                    if (G.speed == 1) {
                        G.wrapl.classList.remove('speed0');
                        G.wrapl.classList.add('speed1');
                        G.wrapl.classList.remove('speed2');
                    }
                    else if (G.speed == 2) {
                        G.wrapl.classList.remove('speed0');
                        G.wrapl.classList.remove('speed1');
                        G.wrapl.classList.add('speed2');
                    }
                    else {
                        G.wrapl.classList.add('speed0');
                        G.wrapl.classList.remove('speed1');
                        G.wrapl.classList.remove('speed2');
                    }
                }

                if (G.T > 0 && G.oldSpeed != G.speed) {
                    if (G.speed == 0)//just paused
                    {
                        l('foreground').style.display = 'block';
                        G.middleText('- Paused -<br><small>Press space to unpause</small>');
                    }
                    else if (G.oldSpeed == 0)//just unpaused
                    {
                        l('foreground').style.display = 'none';
                        if (G.T > 0) G.middleText('- Unpaused -');
                    }
                    else if (G.speed == 1) {
                        G.middleText('- Speed x1 -');
                    }
                    else if (G.speed == 2) {
                        G.middleText('- Speed x30 -<br><small>That is quite fast :)</small>');
                    }
                }

                if (G.speed > 0)//not paused
                {
                    if (G.nextTick <= 0 || forceTick) {
                        if (G.speed == 2) {
                            //use up fast ticks when on fast speed
                            G.fastTicks--;
                            if (G.fastTicks <= 0) { G.fastTicks = 0; G.speed = 1; G.setSetting('fast', 0); }
                        }
                        G.logic['res']();
                        G.logic['unit']();
                        G.logic['land']();
                        G.logic['tech']();
                        G.logic['trait']();

                        //exploring
                        var map = G.currentMap;
                        var updateMap = false;
                        if (G.exploreOwnedTiles && map.tilesByOwner[1].length > 0)//LAND
                        {

                            G.exploreOwnedTiles = randomFloor(G.exploreOwnedTiles);
                            for (var i = 0; i < G.exploreOwnedTiles; i++) {
                                var tile = choose(map.tilesByOwner[1]);
                                if (tile.explored < 1) {
                                    if (!tile.land.ocean) tile.explored += 0.01;
                                    else tile.explored += 0;
                                    tile.explored = Math.min(tile.explored, 1);
                                    G.tileToRender(tile);
                                    updateMap = true;
                                }
                                if (tile.explored > 1) tile.explored = 1;
                            }
                        }
                        if (G.exploreNewTiles && map.tilesByOwner[1].length > 0)//LAND
                        {
                            G.exploreNewTiles = randomFloor(G.exploreNewTiles);
                            for (var i = 0; i < G.exploreNewTiles; i++) {
                                var dirs = [];
                                var tile = choose(map.tilesByOwner[1]);
                                var fromLand = true;
                                if (tile.land.ocean) fromLand = false;
                                if (fromLand || G.allowShoreExplore) {
                                    if (tile.x > 0 && map.tiles[tile.x - 1][tile.y].explored == 0 && !map.tiles[tile.x - 1][tile.y].ocean) dirs.push([-1, 0]);
                                    if (tile.x < map.w - 1 && map.tiles[tile.x + 1][tile.y].explored == 0 && !map.tiles[tile.x + 1][tile.y].ocean) dirs.push([1, 0]);
                                    if (tile.y > 0 && map.tiles[tile.x][tile.y - 1].explored == 0 && !map.tiles[tile.x][tile.y - 1].ocean) dirs.push([0, -1]);
                                    if (tile.y < map.h - 1 && map.tiles[tile.x][tile.y + 1].explored == 0 && !map.tiles[tile.x][tile.y + 1].ocean) dirs.push([0, 1]);
                                    if (dirs.length > 0) {
                                        var dir = choose(dirs);
                                        tile = map.tiles[tile.x + dir[0]][tile.y + dir[1]];
                                        var isShore = false;
                                        if (tile.land.ocean && fromLand) isShore = true;
                                        if (!tile.land.ocean || isShore) {
                                            tile.owner = 1;
                                            tile.explored += G.canoeRaftEffect(0.1, tile.land.name);
                                            updateMap = true;
                                            if (tile.land.name == 'dead forest') G.achievByName['lands of despair'].won++;
                                            if (G.achievByName['lands of despair'].won < 1 && tile.explored.displayName == 'Dead forest') { G.middleText('- Completed <font color="gray">Lands of despair</font> achievement -', 'slow') };
                                            G.doFuncWithArgs('found tile', [tile]);
                                        }
                                    }
                                }
                            }
                        }
                        if (G.exploreNewTilesAlternate && map.tilesByOwner[1].length > 0)//LAND alternative tech
                        {
                            G.exploreNewTilesAlternate = randomFloor(G.exploreNewTilesExploration);
                            for (var i = 0; i < G.exploreNewTiles; i++) {
                                var dirs = [];
                                var tile = choose(map.tilesByOwner[1]);
                                var fromLand = true;
                                if (tile.land.ocean) fromLand = false;
                                if (fromLand || G.allowShoreExplore) {
                                    if (G.day % 7 == 0 && map.tiles[tile.x][tile.y].explored > 0.5) {
                                        if (tile.x > 0 && map.tiles[tile.x - 1][tile.y].explored == 0 && !map.tiles[tile.x - 1][tile.y].ocean) dirs.push([-1, 0]);
                                        if (tile.x < map.w - 1 && map.tiles[tile.x + 1][tile.y].explored == 0 && !map.tiles[tile.x + 1][tile.y].ocean) dirs.push([1, 0]);
                                        if (tile.y > 0 && map.tiles[tile.x][tile.y - 1].explored == 0 && !map.tiles[tile.x][tile.y - 1].ocean) dirs.push([0, -1]);
                                        if (tile.y < map.h - 1 && map.tiles[tile.x][tile.y + 1].explored == 0 && !map.tiles[tile.x][tile.y + 1].ocean) dirs.push([0, 1]);
                                        if (dirs.length > 0) {
                                            var dir = choose(dirs);
                                            tile = map.tiles[tile.x + dir[0]][tile.y + dir[1]];
                                            var isShore = false;
                                            if (tile.land.ocean && fromLand) isShore = true;
                                            if (!tile.land.ocean || isShore) {
                                                tile.owner = 1;
                                                tile.explored += G.canoeRaftEffect(0.2, tile.land.name);
                                                G.tileToRender(tile);
                                                updateMap = true;
                                                if (tile.land.name == 'dead forest') G.achievByName['lands of despair'].won++;
                                                if (G.achievByName['lands of despair'].won < 1 && tile.explored.displayName == 'Dead forest') { G.middleText('- Completed <font color="gray">Lands of despair</font> achievement -', 'slow') };
                                                G.doFuncWithArgs('found tile', [tile]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (G.exploreOwnedOceanTiles && map.tilesByOwner[1].length > 0)//OCEAN
                        {

                            G.exploreOwnedOceanTiles = randomFloor(G.exploreOwnedOceanTiles);
                            for (var i = 0; i < G.exploreOwnedOceanTiles; i++) {
                                var tile = choose(map.tilesByOwner[1]);
                                if (tile.explored < 1) {
                                    if (tile.land.ocean) tile.explored += 0.02;
                                    else tile.explored += 0;
                                    G.tileToRender(tile);
                                    updateMap = true;
                                }
                                if (tile.explored > 1) tile.explored = 1;
                            }
                        }
                        if (G.exploreNewOceanTiles && map.tilesByOwner[1].length > 0)//OCEAN
                        {
                            G.exploreNewOceanTiles = randomFloor(G.exploreNewOceanTiles);
                            for (var i = 0; i < G.exploreNewOceanTiles; i++) {
                                var dirs = [];
                                var tile = choose(map.tilesByOwner[1]);
                                var fromLand = true;
                                if (tile.land.ocean) fromLand = false;
                                if (fromLand || G.allowShoreExplore) {
                                    if (tile.x > 0 && map.tiles[tile.x - 1][tile.y].explored == 0) dirs.push([-1, 0]);
                                    if (tile.x < map.w - 1 && map.tiles[tile.x + 1][tile.y].explored == 0) dirs.push([1, 0]);
                                    if (tile.y > 0 && map.tiles[tile.x][tile.y - 1].explored == 0) dirs.push([0, -1]);
                                    if (tile.y < map.h - 1 && map.tiles[tile.x][tile.y + 1].explored == 0) dirs.push([0, 1]);
                                    if (dirs.length > 0) {
                                        var dir = choose(dirs);
                                        tile = map.tiles[tile.x + dir[0]][tile.y + dir[1]];
                                        var isShore = false;
                                        if (tile.land.ocean && fromLand) isShore = true;
                                        if (tile.land.ocean) {
                                            tile.owner = 1;
                                            tile.explored += 0.05;
                                            G.tileToRender(tile);
                                            updateMap = true;
                                            G.doFuncWithArgs('found tile', [tile]);
                                        }
                                    }
                                }
                            }
                        }
                        if (updateMap) {
                            G.updateMapForOwners(map);
                            //G.mapToRefresh=true;
                        }
                        G.exploreOwnedTiles = 0;
                        G.exploreNewTilesAlternate = 0;
                        G.exploreNewTiles = 0;

                        G.exploreOwnedOceanTiles = 0;
                        G.exploreNewOceanTiles = 0;

                        G.tickChooseBoxes();
                        G.nextTick = (G.speed == 1 ? G.tickDuration : 1);
                        G.tick++;
                        if (G.day > 0 || G.tick > 1) { G.day++; G.totalDays++; G.furthestDay = Math.max(G.furthestDay, G.day + G.year * 300); G.doFunc('new day'); }
                        if (G.day > 300) { G.day = 0; G.year++; G.doFunc('new year'); }
                        //Time measuring tech. It will have 2 levels. Here goes the code:
                        if (!G.has('time measuring 1/2') && !G.has('primary time measure')) {
                            l('date').innerHTML = 'No ' + G.getName('inhabs') + ' know the time yet';
                            G.addTooltip(l('date'), function () { return '<div class="barred">Date</div><div class="par">While researching, people may get the <b>Primary time measure</b> knowledge to display the current date<br>(you\'ll see it in Centuries).<br>Despite that, current date events related to time may still occur.</div>'; }, { offY: -8 });
                            G.addTooltip(l('fastTicks'), function () { return '<div class="barred">Fast ticks</div><div class="par">This is how many in-game days you can run at fast speed.</div><div class="par">You gain a fast tick for every second you\'re paused or offline.</div><div class="par">You also gain fast ticks every single time you research a technology.</div><div class="divider"></div><div class="par">You currently have <b>' + BT(G.fastTicks) + '</b> of game time saved up,<br>which will execute in <b>' + BT(G.fastTicks / 30) + '</b> at fast speed</b>.</div>'; }, { offY: -8 });
                        }
                        else if (G.has('primary time measure') && !G.has('time measuring 1/2')) {
                            l('date').innerHTML = 'Century ' + Math.floor(((G.year / 100) + 1)) + ' in ' + G.getName('civ');
                            G.addTooltip(l('fastTicks'), function () { return '<div class="barred">Fast ticks</div><div class="par">This is how many in-game days you can run at fast speed.</div><div class="par">You gain a fast tick for every second you\'re paused or offline.</div><div class="par">You also gain fast ticks every single time you research a technology.</div><div class="divider"></div><div class="par">You currently have <b>' + BT(G.fastTicks) + '</b> of game time saved up,<br>which will execute in <b>' + BT(G.fastTicks / 30) + '</b> at fast speed</b>.</div>'; }, { offY: -8 });
                            G.addTooltip(l('date'), function () { return '<div class="barred">Date</div><div class="par">This is the current date in your civilization.<br>Sometimes a new century starts. To see years, obtain the <b>Time measuring 1/2</b> research.</div>'; }, { offY: -8 });
                        } else if (G.has('time measuring 1/2') && !G.has('time measuring 2/2')) {
                            l('date').innerHTML = 'Year ' + (G.year + 1) + ' in ' + G.getName('civ');
                            G.addTooltip(l('fastTicks'), function () { return '<div class="barred">Fast ticks</div><div class="par">This is how many in-game days you can run at fast speed.</div><div class="par">You gain a fast tick for every second you\'re paused or offline.</div><div class="par">You also gain fast ticks every time you research a technology.</div><div class="divider"></div><div class="par">You currently have <b>' + BT(G.fastTicks) + '</b> of game time saved up,<br>which will execute in <b>' + BT(G.fastTicks / 30) + '</b> at fast speed,<br>advancing your civilization by <b>' + Math.floor(G.fastTicks / 300) + ' years</b>.</div>'; }, { offY: -8 });
                            G.addTooltip(l('date'), function () { return '<div class="barred">Date</div><div class="par">This is the current date in your civilization.<br>Sometimes a new year starts. To see days, obtain the <b>Time measuring 2/2</b> research.</div>'; }, { offY: -8 });
                        } else if (G.has('time measuring 2/2')) {
                            l('date').innerHTML = 'Year ' + (G.year + 1) + ', day ' + (G.day + 1) + ' in ' + G.getName('civ');
                            G.addTooltip(l('fastTicks'), function () { return '<div class="barred">Fast ticks</div><div class="par">This is how many in-game days you can run at fast speed.</div><div class="par">You gain a fast tick for every second you\'re paused or offline.</div><div class="par">You also gain fast ticks every time you research a technology.</div><div class="divider"></div><div class="par">You currently have <b>' + BT(G.fastTicks) + '</b> of game time saved up,<br>which will execute in <b>' + BT(G.fastTicks / 30) + '</b> at fast speed,<br>advancing your civilization by <b>' + G.BT(G.fastTicks) + '</b>.</div>'; }, { offY: -8 });
                            G.addTooltip(l('date'), function () { return '<div class="barred">Date</div><div class="par">This is the current date in your civilization.<br>One day elapses every second.</div>'; }, { offY: -8 });

                        }
                    }
                    if (!forceTick) G.nextTick--;
                }
                if (!isFinite(G.fastTicks)) {
                    G.fastTicks = 0;
                }
                if (!G.has('time measuring 2/2') && !G.has('time measuring 1/2')) {
                    l('fastTicks').innerHTML = '' + B(G.fastTicks) + (G.fastTicks == 1 ? ' fast tick' : ' fast ticks');
                } else if (G.has('time measuring 1/2') && !G.has('time measuring 2/2')) {
                    l('fastTicks').innerHTML = '' + B(G.fastTicks / 300) + ' years';
                } else if (G.has('time measuring 1/2') && G.has('time measuring 2/2')) {
                    l('fastTicks').innerHTML = G.BT(G.fastTicks);
                }
                if (G.getSetting('autosave') && G.T % (G.fps * 60) == (G.fps * 60 - 1)) G.Save();
            }

            if (G.mapToRefresh) G.refreshMap(G.currentMap);
            if (G.mapToRedraw) G.redrawMap(G.currentMap);

            if (G.shouldRunReqs) {
                G.runUnitReqs();
                G.runPolicyReqs();
                G.update['unit']();
                G.shouldRunReqs = 0;
            }

            G.logicMapDisplay();
            G.widget.update();
            if (G.T % 5 == 0) G.tooltip.refresh();
            G.tooltip.update();
            G.infoPopup.update();
            G.popupSquares.update();
            G.updateMessages();

            //keyboard shortcuts
            if (G.keysD[27]) { G.dialogue.close(); }//esc
            if (G.sequence == 'main') {
                if (G.keys[17] && G.keysD[83]) { G.Save(); }//ctrl-s
                if (G.keysD[32])//space
                {
                    if (G.getSetting('paused')) G.setSetting('paused', 0);
                    else G.setSetting('paused', 1)
                }
            }

            G.logic['particles']();

            if (G.T % 5 == 0 && G.resizing) { G.stabilizeResize(); }

            if (G.mouseUp) G.mousePressed = false;
            G.mouseDown = false;
            G.mouseUp = false;
            if (G.mouseMoved && G.mousePressed) G.draggedFrames++; else if (!G.mousePressed) G.draggedFrames = 0;
            G.mouseMoved = 0;
            G.Scroll = 0;
            G.clickL = 0;
            G.keysD = [];
            G.keysU = [];
            if (document.activeElement.nodeName == 'TEXTAREA' || document.activeElement.nodeName == 'INPUT') G.keys = [];

            G.T++;
        }
        G.ca = 1; G.cb = 2;
        G.herbReq = 0;
        G.fruitReq = 0;

        G.fullApplyUnitEffects = function (me, type, amountParam) {
            //run through every effect in a unit and apply them
            //"type" lets us run specific effects only : 0 means all effects that happen every tick, 1 means all effects that happen on unit purchase (or sale, or death, if the amount is negative), 2 means all effects that affect the effective unit amount, 3 means all effects that happen when unit is made unidle (or idle, if the amount is negative)
            //"amountParam" depends on the type : if type is 0, it represents the effective unit amount; if type is 1, it is the new amount of the unit we just purchased; if type is 3, it is the amount that was just made unidle

            var len = me.unit.effects.length;
            var visible = false;
            if (me.l && G.tab.id == 'unit') visible = true;
            var out = 0;//return value; only used by type 2 effects
            if (type == 2) out = me.amount - me.idle;

            for (var i = 0; i < len; i++) {
                var effect = me.unit.effects[i];
                if (!effect.req || G.checkReq(effect.req)) {
                    if (typeof me.mode === "undefined") {
                        me.mode = 0
                    }
                    if ((!effect.mode || me.mode.id == effect.mode) && (!effect.notMode || me.mode.id != effect.notMode)) {
                        if (type == 0)//effects that happen every tick
                        {
                            if (!effect.every || G.tick % effect.every == 0)//.every : effect only triggers every X days
                            {
                                var repeat = 1;
                                if (effect.repeat) repeat = effect.repeat;//.repeat : effect triggers X times every day
                                for (var repI = 0; repI < repeat; repI++) {
                                    var myAmount = amountParam;
                                    if (effect.type == 'gather')//gather : extract either specific resources, or anything from a context, or both, using the available resources in owned tiles
                                    //if .max is specified, each single unit can only gather that amount at most, forcing the player to create enough units to match the resources available in owned tiles
                                    //by default, units try to gather a random amount between 50% and 100% of the specified amount; add .exact=true to get the precise amount instead
                                    //the amount gathered is soft-capped by the natural resource
                                    {
                                        if (!effect.chance || Math.random() < effect.chance) {
                                            var resWeight = 0.95;
                                            var unitWeight = 1 - resWeight;
                                            var res = [];
                                            var specific = false;
                                            if (effect.what)//gathering something in particular
                                            { res = effect.what; specific = true; }
                                            else//harvest by context only
                                            { res = G.currentMap.computedPlayerRes[effect.context]; }
                                            for (var ii in res) {
                                                var amount = 0;
                                                if (specific) {
                                                    var toGather = myAmount * res[ii];
                                                    var resAmount = toGather;//if no context is defined, ignore terrain goods - just harvest from thin air
                                                    if (effect.context && G.currentMap.computedPlayerRes[effect.context]) resAmount = G.currentMap.computedPlayerRes[effect.context][ii] || 0;
                                                    var max = effect.max || 0;
                                                }
                                                else {
                                                    var toGather = myAmount * (effect.amount || 1);
                                                    var resAmount = res[ii];
                                                    var max = effect.max || 0;
                                                }

                                                amount = Math.min(resAmount, toGather) * resWeight + unitWeight * (toGather);
                                                if (!effect.exact) amount *= (0.5 + 0.5 * Math.random());
                                                if (max) amount = Math.min(max * myAmount, amount);
                                                amount = randomFloor(amount);

                                                if (amount > 0) {
                                                    if (G.getRes(ii).whenGathered) G.getRes(ii).whenGathered(G.getRes(ii), amount, me, effect);
                                                    else G.gain(ii, amount, me.unit.displayName);
                                                    if (visible) me.popups.push(G.dict[ii].icon);
                                                }
                                            }
                                        }
                                    }
                                    else if (effect.type == 'convert')//convert : convert resources into other resources as long as we have enough materials
                                    {
                                        if (!effect.chance || Math.random() < effect.chance) {
                                            //establish how many we can make from the current resources
                                            //i hope i didn't mess up somewhere in there
                                            var amountToMake = myAmount;
                                            for (var ii in effect.from) {
                                                amountToMake = Math.min(amountToMake, G.getRes(ii).amount / ((effect.from[ii] * myAmount) == 0 ? 1 : effect.from[ii] * myAmount));
                                            }

                                            amountToMake = randomFloor(Math.min(1, amountToMake) * myAmount);

                                            if (amountToMake > 0) {
                                                for (var ii in effect.from) {
                                                    G.lose(ii, effect.from[ii] * amountToMake, me.unit.displayName);
                                                }
                                                for (var ii in effect.into) {
                                                    if (G.getRes(ii).whenGathered) G.getRes(ii).whenGathered(G.getRes(ii), effect.into[ii] * amountToMake, me, effect);
                                                    else G.gain(ii, effect.into[ii] * amountToMake, me.unit.displayName);
                                                    if (visible && effect.into[ii] * amountToMake > 0) me.popups.push(G.dict[ii].icon);
                                                }
                                            }
                                        }
                                    }
                                    else if (effect.type == 'waste')//waste : a random percent of the unit dies off every tick
                                    {
                                        var toDie = randomFloor(effect.chance * me.amount);
                                        if (toDie > 0) {
                                            if (effect.desired) {
                                                //if(me.unit.name.indexOf('grave')!=-1 || me.unit.name.indexOf('cemetary')!=-1)G.gain('corpse',-toDie*G.unitByName[''].effects[0].what['burial spot'],'decay');
                                                me.targetAmount -= toDie;
                                            }
                                            G.wasteUnit(me, toDie);
                                        }
                                    }
                                    else if (effect.type == 'explore') {
                                        var limit = 500;
                                        if (G.modsByName["Default dataset"]) {
                                            limit += (G.has("advanced mapping") ? Infinity : (G.has("basic mapping") ? 6500 : 0) + (G.has("map details") ? 14500 : 0) + (G.has("scouting") ? 1000 : 0) + (G.has("focused scouting") ? 20000 : 0));
                                            if (G.getRes("wtr").amount + G.getRes("land").amount < limit && G.isMap == 0) {
                                                if (effect.explored) G.exploreOwnedTiles += Math.random() * effect.explored * myAmount;
                                                if (effect.unexplored) G.exploreNewTiles += Math.random() * effect.unexplored * myAmount;
                                                G.getDict('wanderer').effects[G.unitByName['wanderer'].effects.length - 1].chance = 0.01;
                                                G.getDict('globetrotter').effects[G.unitByName['globetrotter'].effects.length - 1].chance = 0.01;
                                                G.getDict('scout').effects[G.unitByName['scout'].effects.length - 1].chance = 0.01;
                                            } else {
                                                G.getDict('wanderer').effects[G.unitByName['wanderer'].effects.length - 1].chance = 1e-300;
                                                G.getDict('globetrotter').effects[G.unitByName['globetrotter'].effects.length - 1].chance = 1e-300;
                                                G.getDict('scout').effects[G.unitByName['scout'].effects.length - 1].chance = 1e-300;
                                            }
                                        } else {
                                            //limit+=(G.has("advanced mapping") ? Infinity : (G.has("basic mapping") ? 6000 : 0)+(G.has("map details") ? 14000 : 0));
                                            limit += (G.has("map details") ? Infinity : (G.has("basic mapping") ? 6500 : 0) + (G.has("scouting") ? 300 : 0)); //for now since advanced mapping isn't available for C2 yet
                                            if (G.getRes("wtr").amount + G.getRes("land").amount < limit && G.isMap == false) {
                                                if (effect.explored) G.exploreOwnedTiles += Math.random() * effect.explored * myAmount;
                                                if (effect.unexplored) G.exploreNewTiles += Math.random() * effect.unexplored * myAmount;
                                            } else {
                                                G.getDict('wanderer').effects[G.unitByName['wanderer'].effects.length - 1].chance = 1e-300;
                                                G.getDict('scout').effects[G.unitByName['scout'].effects.length - 1].chance = 1e-300;
                                            }
                                        }
                                    }
                                    else if (effect.type == 'exploreAlt') {
                                        var limit = 750;
                                        if (G.modsByName["Default dataset"]) {
                                            limit += (G.has("advanced mapping") ? Infinity : (G.has("basic mapping") ? 6500 : 0) + (G.has("map details") ? 14000 : 0) + (G.has("scouting") ? 1000 : 0) + (G.has("focused scouting") ? 20000 : 0));
                                            if (G.getRes("wtr").amount + G.getRes("land").amount < limit && G.isMap == 0) {
                                                if (effect.explored) G.exploreOwnedTiles += Math.random() * effect.explored * myAmount;
                                                if (effect.unexplored) G.exploreNewTilesAlternate += Math.random() * effect.unexplored * myAmount;
                                                G.getDict('wanderer').effects[G.unitByName['wanderer'].effects.length - 1].chance = 0.01;
                                                G.getDict('globetrotter').effects[G.unitByName['globetrotter'].effects.length - 1].chance = 0.01;
                                            } else {
                                                G.getDict('wanderer').effects[G.unitByName['wanderer'].effects.length - 1].chance = 1e-300;
                                                G.getDict('globetrotter').effects[G.unitByName['globetrotter'].effects.length - 1].chance = 1e-300;
                                            }
                                        } else {
                                            //limit+=(G.has("advanced mapping") ? Infinity : (G.has("basic mapping") ? 6000 : 0)+(G.has("map details") ? 14000 : 0));
                                            limit += (G.has("map details") ? Infinity : (G.has("basic mapping") ? 6500 : 0) + (G.has("scouting") ? 300 : 0)); //for now since advanced mapping isn't available for C2 yet
                                            if (G.getRes("wtr").amount + G.getRes("land").amount < limit && G.isMap == false) {
                                                if (effect.explored) G.exploreOwnedTiles += Math.random() * effect.explored * myAmount;
                                                if (effect.unexplored) G.exploreNewTilesAlternate += Math.random() * effect.unexplored * myAmount;
                                            } else {
                                                G.getDict('wanderer').effects[G.unitByName['wanderer'].effects.length - 1].chance = 1e-300;
                                            }
                                        }
                                    }
                                    else if (effect.type == 'exploreOcean')//exploreOcean : discover new tiles or explore owned ocean
                                    {
                                        var limit = 500;
                                        if (G.modsByName["Default dataset"]) {
                                            limit += (G.has("advanced mapping") ? Infinity : (G.has("basic mapping") ? 6500 : 0) + (G.has("map details") ? 14500 : 0) + (G.has("focused scouting") ? 20000 : 0) + (G.has("scouting") ? 1000 : 0));
                                            if (G.getRes("wtr").amount + G.getRes("land").amount < limit && !G.isMap) {
                                                G.getDict('boat').effects[2].chance = 1 / 117.5;
                                                G.getDict('boat').effects[3].chance = 1 / 150;
                                                var upkeepMet = true
                                                if (effect.upkeep) {
                                                    if (G.lose(effect.upkeep[0], effect.upkeep[1], 'unit upkeep') < effect.upkeep[1]) upkeepMet = false //Bad upkeep programming is fun
                                                }
                                                if (upkeepMet) {
                                                    if (effect.explored) G.exploreOwnedOceanTiles += Math.random() * effect.explored * myAmount;
                                                    if (effect.unexplored) G.exploreNewOceanTiles += Math.random() * effect.unexplored * myAmount;
                                                } else {
                                                    G.getDict('boat').effects[2].chance = 1e-300;
                                                    G.getDict('boat').effects[3].chance = 1e-300;
                                                }
                                            } else {
                                                G.getDict('boat').effects[2].chance = 1e-300;
                                                G.getDict('boat').effects[3].chance = 1e-300;
                                            }
                                        } else {
                                            //limit+=(G.has("advanced mapping") ? Infinity : (G.has("basic mapping") ? 6000 : 0)+(G.has("map details") ? 14000 : 0));
                                            limit += (G.has("map details") ? Infinity : (G.has("basic mapping") ? 6500 : 0)) + (G.has("scouting") ? 1000 : 0); //for now since advanced mapping isn't available for C2 yet
                                            if (G.getRes("wtr").amount + G.getRes("land").amount < limit) {
                                                if (effect.explored) G.exploreOwnedOceanTiles += Math.random() * effect.explored * myAmount;
                                                if (effect.unexplored) G.exploreNewOceanTiles += Math.random() * effect.unexplored * myAmount;
                                                G.getDict('wanderer').effects[G.unitByName['wanderer'].effects.length - 1].chance = 0.02;
                                                G.getDict('druidish travellers team').effects[G.unitByName['druidish travellers team'].effects.length - 1].chance = 1 / 230;
                                                G.getDict('scout').effects[G.unitByName['scout'].effects.length - 1].chance = 1 / 90;
                                            } else {
                                                G.getDict('wanderer').effects[G.unitByName['wanderer'].effects.length - 1].chance = 1e-300;
                                                G.getDict('druidish travellers team').effects[G.unitByName['druidish travellers team'].effects.length - 1].chance = 1e-300;
                                                G.getDict('scout').effects[G.unitByName['scout'].effects.length - 1].chance = 1e-300;
                                            }
                                        }
                                    }
                                    else if (effect.type == 'function')//function : any arbitrary function (or list of functions)
                                    {
                                        if (!effect.chance || Math.random() < effect.chance) {
                                            if (effect.funcs) {
                                                for (var ii in effect.funcs) { effect.funcs[ii](me); }
                                            }
                                            else effect.func(me);
                                        }
                                    }
                                }
                            }
                        }
                        else if (type == 1)//effects that happen when the unit is bought or killed
                        {
                        }
                        else if (type == 3)//effects that happen when the unit is made unidle or idle
                        {
                            if (effect.type == 'provide')//provide : when the unit is bought, give a flat amount of a resource; remove that same amount when the unit is deleted
                            {
                                if (effect.what) {
                                    for (var ii in effect.what) {
                                        var amount = effect.what[ii] * amountParam;
                                        if (G.getRes(ii).whenGathered) G.getRes(ii).whenGathered(G.getRes(ii), amount, me, effect);
                                        else G.gain(ii, amount, me.unit.displayName);
                                        if (visible && amount > 0) me.popups.push(G.dict[ii].icon);
                                    }
                                }
                            }
                        }
                        else if (type == 2)//effects that modify the effective unit amount
                        {
                            if (effect.what) {
                                if (effect.type == 'add')//add the amount of these resources to the amount
                                {
                                    for (var ii in effect.what) {
                                        var res = G.getRes(ii);
                                        out += res.amount * effect.what[ii];
                                    }
                                }
                                else if (effect.type == 'addFree')//add the free portion of these resources to the amount
                                {
                                    for (var ii in effect.what) {
                                        var res = G.getRes(ii);
                                        out += Math.max(0, res.amount - res.used) * effect.what[ii];
                                    }
                                }
                                else if (effect.type == 'mult')//multiply the amount by the amount of these resources
                                {
                                    for (var ii in effect.what) {
                                        var res = G.getRes(ii);
                                        out += res.amount * effect.what[ii];
                                    }
                                }
                                else if (effect.type == 'multFree')//multiply the amount by the free portion of these resources
                                {
                                    for (var ii in effect.what) {
                                        var res = G.getRes(ii);
                                        out *= Math.max(0, res.amount - res.used) * effect.what[ii];
                                    }
                                }
                            }
                            else//flat values
                            {
                                if (effect.type == 'add')//add the value to the amount
                                {
                                    out += effect.value;
                                }
                                else if (effect.type == 'mult')//multiply the amount by the value
                                {
                                    out *= effect.value;
                                }
                            }
                        }
                    }
                }
            }
            return out;
        }
        /////////////////////////
        //Fixes copied out of heritage mod
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
        G.initializeFixIcons = function () {
            if (G.parse("http://").search("http://") == -1) {
                G.fixTooltipIcons();
                setTimeout(G.initializeFixIcons, 500); //check again to make sure this version of the function stays applied during page load
            }
        }
        G.initializeFixIcons();

        // Modify particle setting to just hide most particles with a random function
        G.showParticle = function (obj) {
            if (!G.getSetting('particles') || Math.random() > (G.getSetting('fast') == true ? 0.05 : 0.03)) return 0;
            if (obj.y && (obj.y > G.h - 102 || obj.y < 26)) return 0;//cull if on black interface
            var me = G.particles[G.particlesI];
            me.x = 0;
            me.y = 0;
            me.lm = 0;
            me.icon = [0, 0];
            me.type = 0;
            for (var i in obj) { me[i] = obj[i]; }
            me.on = true;
            me.l = 0;
            if (me.type == 0) {
                me.x += Math.random() * 32 - 16;
                me.xd = Math.random() * 4 - 2;
                me.yd = -(Math.random() * 2 + 1);
                me.lm = me.lm || 30;
                //me.icon=choose(G.res).icon;
                me.el.style.transform = 'translate(' + (me.x - 12) + 'px,' + (me.y - 12) + 'px)';
                var iconStr = G.getIcon(me.icon, true);
                me.el.style.background = iconStr[0];
                me.el.style.backgroundPosition = iconStr[1];
                //me.el.style.backgroundPosition=(-me.icon[0]*24*G.iconScale)+'px '+(-me.icon[1]*24*G.iconScale)+'px';
                me.el.style.display = 'block';
            }
            G.particlesI++;
            if (G.particlesI >= G.particlesN) G.particlesI = 0;
        }



        G.NewGameWithSameMods = function () {
            delete G.storageObject.drought;
            delete G.storageObject.iconTick;
            delete G.storageObject.gatherIcon;
            G.Save();
            G.loadMenu = undefined;
            G.loadCiv = 0;
            G.setTab = function (tab) {
                if (tab.popup) {
                    if (G.getSetting('animations')) triggerAnim(tab.l, 'plop');
                    G.dialogue.popup(G.tabPopup[tab.id], 'bigDialogue', tab.l);
                }
                else {
                    G.tab = tab;
                    G.settingsByName['tab'].value = G.tab.I;
                    for (var i in G.tabs) {
                        var me = G.tabs[i];
                        if (me.id != tab.id)//close other tabs
                        {
                            me.l.classList.remove('on');
                            me.l.classList.remove('bgLight');
                            me.l.classList.add('bgMid');
                            if (me.div) { l(me.div).style.display = 'none'; l(me.div).innerHTML = ''; }
                        }
                        else//update focused tab
                        {
                            me.l.classList.add('on');
                            me.l.classList.remove('bgMid');
                            me.l.classList.add('bgLight');
                            if (me.div) l(me.div).style.display = 'block';
                            if (me.update) G.update[me.update]();
                            if (G.getSetting('animations')) triggerAnim(me.l, 'plop');
                        }
                    }
                    if (tab.showMap) G.showMap();
                    else G.hideMap();
                    G.particlesReset();
                }
            }
            G.achievByName['wondersDuringRun'].won = 0;
            if (G.achievByName['???'].won > 0) G.tragedyHappened = true;
            G.resets = G.achievByName['first glory'].won + G.achievByName['druidish heart'].won;
            var mods = [];
            for (var i in G.mods) {
                mods.push(G.mods[i].url);
            }
            G.NewGame(false, mods);
        }
        G.NewGameWithSameMods2 = function () //this one does not change loadmenu
        {
            if (!G.currentMap) {
                alert("It appears that Magix has not fully loaded. Reload and reimport mods to fix the issue!")
                return
            }
            delete G.storageObject.drought;
            delete G.storageObject.iconTick;
            delete G.storageObject.gatherIcon;
            G.setSetting('buyAmount', 1);
            G.Save();
            G.setTab = function (tab) {
                if (tab.popup) {
                    if (G.getSetting('animations')) triggerAnim(tab.l, 'plop');
                    G.dialogue.popup(G.tabPopup[tab.id], 'bigDialogue', tab.l);
                }
                else {
                    G.tab = tab;
                    G.settingsByName['tab'].value = G.tab.I;
                    for (var i in G.tabs) {
                        var me = G.tabs[i];
                        if (me.id != tab.id)//close other tabs
                        {
                            me.l.classList.remove('on');
                            me.l.classList.remove('bgLight');
                            me.l.classList.add('bgMid');
                            if (me.div) { l(me.div).style.display = 'none'; l(me.div).innerHTML = ''; }
                        }
                        else//update focused tab
                        {
                            me.l.classList.add('on');
                            me.l.classList.remove('bgMid');
                            me.l.classList.add('bgLight');
                            if (me.div) l(me.div).style.display = 'block';
                            if (me.update) G.update[me.update]();
                            if (G.getSetting('animations')) triggerAnim(me.l, 'plop');
                        }
                    }
                    if (tab.showMap) G.showMap();
                    else G.hideMap();
                    G.particlesReset();
                }
            }
            var mods = [];
            for (var i in G.mods) {
                mods.push(G.mods[i].url);
            }
            G.NewGame(false, mods);
        }
        G.buyUnit = function (me, amount, any) {
            //if any is true, by anywhere between 0 and amount; otherwise, fail if we can't buy the precise amount
            var success = true;
            amount = Math.round(amount);
            if (me.unit.wonder && amount > 0) {
                //check requirements
                if (me.mode == 0) {
                    //initial step
                    if (!G.testCost(me.unit.cost, amount)) success = false;
                    else if (!G.testUse(me.unit.use, amount)) success = false;
                    else if (!G.testUse(me.unit.require, amount)) success = false;
                    if (success) {
                        if (G.getSetting('wonder messages') || G.resets <= 3) if (me.unit.messageOnStart) G.Message({ type: 'important', text: me.unit.messageOnStart });
                        G.doCost(me.unit.cost, amount);
                        G.doUse(me.unit.use, amount);
                        G.applyUnitBuyEffects(me, amount);
                        me.mode = 2;//start paused
                        me.percent = 0;
                        if (G.getSetting('animations')) triggerAnim(me.l, 'plop');
                        var bounds = me.l.getBoundingClientRect();
                        var posX = bounds.left + bounds.width / 2;
                        var posY = bounds.top;
                        for (var i in me.unit.cost) { G.showParticle({ x: posX, y: posY, icon: G.dict[i].icon }); }
                    }
                }
                else if (me.mode == 1) {
                    //building in progress; pausing construction
                    if (success) {
                        me.mode = 2;
                        if (G.getSetting('animations')) triggerAnim(me.l, 'plop');
                    }
                }
                else if (me.mode == 2) {
                    //building in progress; resuming construction
                    if (success) {
                        me.mode = 1;
                        if (G.getSetting('animations')) triggerAnim(me.l, 'plop');
                    }
                }
                else if (me.mode == 3 || me.mode == 4) {
                    var displayAscend = true;
                    //building complete; applying the final step
                    //this also handles the step afterwards, when we click the final wonder
                    G.dialogue.popup(function (me, instance) {
                        return function (div) {
                            var str =
                                '<div style="width:275px;min-height:400px;">' +
                                '<div class="thing standalone' + G.getIconClasses(me, true) + '' + (instance.mode == 3 ? ' wonderUnbuilt' : ' wonderBuilt') + '" style="transform:scale(2);position:absolute;left:70px;top:52px;">' + G.getIconStr(me, 0, 0, true) + '</div>' +
                                '<div class="fancyText title">' + me.displayName + '</div><div class="bitBiggerText scrollBox underTitle shadowed" style="text-align:center;overflow:hidden;top:118px;bottom:50px;">';
                            if (instance.mode == 3) {
                                str += '<div class="fancyText par"><font color="' + (getObj('civ') == 0 ? 'fuschia' : '#ccffcc') + '">This wonder only needs one more step to finalize.</font></div>';
                                if (me.finalStepDesc) str += '<div class="fancyText par">' + G.parse(me.finalStepDesc) + '</div>';
                                str += '<div class="divider"></div>' +
                                    G.button({
                                        text: '<font color="#2b0">Complete</font>', tooltipFunc: function (me) { return function () { return '<div style="max-width:240px;padding:16px 24px;">You need ' + G.getCostString(me.finalStepCost, true, false, 1) + '.</div>'; } }(me), onclick: function (me) {
                                            return function () {
                                                var amount = 1;
                                                var success = true;
                                                if (!G.testCost(me.unit.finalStepCost, amount)) success = false;
                                                //else if (!G.testUse(me.unit.finalStepUse,amount)) success=false;
                                                //else if (!G.testUse(me.unit.finalStepRequire,amount)) success=false;
                                                if (success) {
                                                    G.dialogue.close();
                                                    G.doCost(me.unit.finalStepCost, amount);
                                                    if (me.unit.name == 'temple of deities') G.achievByName['heavenly'].won++;
                                                    G.achievByName['wondersDuringRun'].won++;
                                                    if (me.unit.name == 'wonderful fortress of christmas') { G.achievByName['capital of christmas'].won = 1; G.middleText('-  Completed <font color="#bbbbff">Citadel of christmas</font><br>seasonal achievement -<br><hr width="300"> Ho ho ho! Merry christmas to you! From now on, you can unlock a special Christmas bonus.', 'slow') };
                                                    if (me.unit.name == 'fortress of magicians') { G.achievByName['magical'].won = 1; G.middleText('-  Completed <font color="#ff00ff">Magical</font> achievement -', 'slow'); G.gainTech(G.techByName['magical presence']) };
                                                    if (me.unit.name == 'fortress of love') { G.achievByName['love for eternity'].won = 1; G.middleText('-  Completed <font color="#bbbbff">Love for eternity</font><br>seasonal achievement -<br><hr width="300"> Love is in the air! From now on, you can unlock a special Valentine\'s day bonus.', 'slow') };
                                                    if (me.unit.name == 'mausoleum' && G.achievByName['mausoleum'].won >= 3 && G.getRes('population').amount - me.unit.finalStepCost.population == 0 && G.achievByName['cruel goal'].won == 0) { G.achievByName['cruel goal'].won = 1; G.middleText('-  Completed <font color="#ff00ff">Cruel goal</font><br>shadow achievement -', 'slow') };
                                                    /*that was so brutal*/
                                                    if (G.achievByName['cruel goal'].won >= 1) {
                                                        if (me.unit.name == 'pagoda of passing time' || me.unit.name == 'Pagoda of culture' || me.unit.name == 'Hartar\'s statue' || me.unit.name == 'Pagoda of democracy' || me.unit.name == 'Fortress of cultural legacy' || me.unit.name == 'Complex of Dreamers' || me.unit.name == 'Fortress of magicians' || me.unit.name == 'Platinum fish statue' || me.unit.name == 'Tomb of oceans' || me.unit.name == 'The Herboleum' || me.unit.name == 'Temple of the Stone' || me.unit.name == 'Mausoleum of the Dreamer') {
                                                            if (G.getRes('population').amount - me.unit.finalStepCost.population == 0 && G.achievByName['that was so brutal'].won == 0) { G.achievByName['that was so brutal'].won = 1; G.middleText('- Hey...that was brutal. Why? Just why would you do that? -<br><small>Completed <font color="pink">That was so brutal</font> shadow achievement.</small>', 'slow') };
                                                        }
                                                    }
                                                    G.playSound(magixURL + 'WonderComplete.mp3');
                                                    me.mode = 4;
                                                    me.amount += 1;
                                                    if (G.getSetting('animations')) triggerAnim(me.l, 'plop');

                                                    var bounds = me.l.getBoundingClientRect();
                                                    var posX = bounds.left + bounds.width / 2;
                                                    var posY = bounds.top;
                                                    for (var i in me.unit.finalStepCost) { G.showParticle({ x: posX, y: posY, icon: G.dict[i].icon }); }
                                                    G.buyUnit(me, amount, true);//show dialogue for step 4
                                                }
                                            }
                                        }(instance)
                                    }) + '<br>' + G.dialogue.getCloseButton('- Back -') + '</div>';
                            }
                            else if (me.type == 'stepByStep' || me.type == 'tiered') {
                                str += '<div class="fancyText par">Building completed</div>';
                                str += '<div class="fancyText par">This building isn\'t made for ascending.</div>';
                                '</div>';
                            }
                            else if (me.type == 'portal') {
                                str += '<div class="fancyText par">Portal activated</div>';
                                str += '<div class="fancyText par">Now you can unlock new things, discover new content, and much more!</div>';
                                '</div>';
                            }
                            else {
                                //cases where we do not allow ascending by wonder
                                if (me.name == 'mausoleum' && G.achievByName['mausoleum eternal'].won > 0 && G.achievByName['mausoleum'].won >= 10) displayAscend = false;
                                if (me.name == 'temple of the paradise' && G.achievByName['next to the God'].won > 0) displayAscend = false;
                                if (me.name == 'fortress of magicians' && G.achievByName['magical'].won > 0) displayAscend = false;
                                if (me.name == 'pagoda of democracy' && (G.achievByName['democration'].won > 0 && G.achievByName['the fortress'].won < 3 || G.achievByName['democration'].won > 1)) displayAscend = false;
                                if (me.name == 'complex of dreamers' && G.achievByName['insight-ly'].won > 0 && G.achievByName['the fortress'].won < 3 || G.achievByName['insight-ly'].won > 1) displayAscend = false;
                                if (me.name == 'complex of dreamers' && G.achievByName['insight-ly'].won > 0 && G.achievByName['the fortress'].won < 3 || G.achievByName['insight-ly'].won > 1) displayAscend = false;
                                if (me.name == 'fortress of cultural legacy' && G.achievByName['sacrificed for culture'].won > 0 && G.achievByName['the fortress'].won < 4 || G.achievByName['sacrificed for culture'].won > 1) displayAscend = false;
                                str += '<div class="fancyText par">Wonder completed</div>';
                                if (displayAscend) {
                                    str += '<div class="fancyText par">You can now ascend to a higher state of existence, or remain on this mortal plane for as long as you wish.</div>';
                                    str += '<div class="divider"></div>' +

                                        G.button({
                                            text: '<font color="#d4af37">Ascend</font>', style: 'box-shadow:0px 0px 10px 1px #39f;', tooltipFunc: function (me) { return function () { return '<div style="max-width:240px;padding:16px 24px;"><div class="par">Ascending will end this game and let you create a new one.</div><div class="par">You will unlock permanent legacy bonuses for completion of this wonder.</div><div class="par">You can decide to do this later; you can click on this wonder again to ascend at any time.</div><div class="par">Make sure you\'re certain you\'re done with this world (seriously)!</div></div>'; } }(me), onclick: function (me) {
                                                return function () {
                                                    //ascend and prevent rapid reascend
                                                    if (ascended) {
                                                        return;
                                                    }
                                                    ascended = true;
                                                    G.dialogue.close();
                                                    var middleText = '';
                                                    var achiev = G.getAchiev(me.unit.wonder);
                                                    G.playSound(magixURL + 'Ascending.wav');
                                                    if (achiev) {
                                                        if (!achiev.won) middleText = '<font color="pink">- Completed the ' + achiev.displayName + ' victory -</font>'
                                                        achiev.won++;
                                                    }
                                                    document.title = 'Ascending: NeverEnding Legacy';
                                                    G.theme = G.theme;
                                                    setTimeout(function () { document.title = 'NeverEnding Legacy' }, 2000);
                                                    if (G.modsByName['Default dataset']) {
                                                        G.achievByName['first glory'].won++;
                                                        if (G.checkPolicy('theme changer') == 'default') G.theme = 0;
                                                    } else G.achievByName['druidish heart'].won++;
                                                    G.resets++;
                                                    G.NewGameWithSameMods();
                                                    G.middleText(middleText, true);
                                                }
                                            }(instance)
                                        }) + '</div><br>';
                                } else {
                                    str += '<div class="fancyText par">This wonder no longer needs ascending.</div>';
                                }
                                G.dialogue.getCloseButton('Back');
                            }
                            str += '</div>';
                            return str;
                        }
                    }(me.unit, me));
                }
            }
            else if (amount > 0) {
                //check requirements
                if (any) {
                    var originalAmount = amount;
                    var n = 0;
                    n = G.testAnyCost(me.unit.cost);
                    if (n != -1) amount = Math.min(n, amount);
                    n = G.testAnyUse(me.unit.use, amount);
                    if (n != -1) amount = Math.min(n, amount);
                    n = G.testAnyUse(me.unit.require, amount);
                    if (n != -1) amount = Math.min(n, amount);
                    //n=G.testAnyUse(me.mode.use,amount);
                    //if (n!=-1) amount=Math.min(n,amount);
                    n = G.testAnyLimit(me.unit.limitPer, G.getUnitAmount(me.unit.name) + amount);
                    if (n != -1) amount = Math.min(n, amount);
                    if (amount <= 0) success = false;
                }
                else {
                    if (!G.testCost(me.unit.cost, amount)) success = false;
                    else if (!G.testUse(me.unit.use, amount)) success = false;
                    else if (!G.testUse(me.unit.require, amount)) success = false;//should amount count?
                    //else if (!G.testUse(me.mode.use,amount)) success=false;
                    else if (!G.testLimit(me.unit.limitPer, G.getUnitAmount(me.unit.name) + amount)) success = false;
                }
                //actually purchase if we meet the requirements
                if (success) {
                    G.doCost(me.unit.cost, amount);
                    G.doUse(me.unit.use, amount);
                    //G.doUse(me.mode.use,amount);
                    G.applyUnitBuyEffects(me, amount);
                    me.amount += amount;
                    me.idle += amount;
                    if (me.visible) {
                        if (G.tooltip.parent != me.l && G.getSetting('animations')) triggerAnim(me.l, 'plop');

                        var bounds = me.l.getBoundingClientRect();
                        var posX = bounds.left + bounds.width / 2;
                        var posY = bounds.top;
                        for (var i in me.unit.cost) { G.showParticle({ x: posX, y: posY, icon: G.dict[i].icon }); }
                    }
                }
            }
            return success;
        }

        G.greeting = function () {
            var truY = yer.getFullYear();
            var timeOffline = Math.max(0, (Date.now() - G.lastDate) / 1000);
            if (day >= 289 && day <= 305) {
                G.middleText('<big><font color="orange">Happy Halloween!</big><br>- Welcome back -<br><small>You accumulated ' + B(timeOffline) + ' fast ticks while you were away.</small></font>', 'slow');
                G.playSound(magixURL + 'halloweenGreeting.mp3');
            }
            if (day >= 365 && day <= 366) { G.middleText('<big><font color="pink">Happy ' + (truY + 1) + '!</big><br>- Welcome back -<br><small>You accumulated ' + B(timeOffline) + ' fast ticks while you were away!</small></font>', 'slow') };
            if (day > 0 && day <= 2) {
                G.middleText('<big><font color="pink">Happy ' + truY + '!</big><br>- Welcome back -<br><small>You accumulated ' + B(timeOffline) + ' fast ticks while you were away!</small></font>', 'slow');
            };
            if (yer.getMonth() == 6 && yer.getDate() >= 14 && yer.getDate() <= 20) { //Magix anniversary week
                G.middleText('<big><font color="#c4b400">Magix turns ' + (yer.getFullYear() - 2019) + '</big><br>- Welcome back -<br><small>You accumulated ' + B(timeOffline) + ' fast ticks while you were away.<br>Thanks for playing this neat mod \u2014pelletsstarPL<br><font color="aqua">Thanks for motivating me. Keep playing.</font></small></font>', 'slow');
            };
            if (day >= easterDay - 7 && day <= easterDay) { //EASTER
                G.middleText('<big><font color="green">Happy Easter!</big><br>- Welcome back -<br><small>You accumulated ' + B(timeOffline) + ' fast ticks while you were away. Easter bunny does a sniff,sniff</small></font>', 'slow');
            };
            if (yer.getMonth() == 9 && yer.getDate() == 9) { //MOD CREATOR's birthday (well, pelletsstarPL, anyway)
                G.middleText('<big>Today the original Magix creator has their birthday!</big><br>- Welcome back -<br><small>You accumulated ' + B(timeOffline) + ' fast ticks while you were away.<br></small></font>', 'slow');
            };
            if (yer.getMonth() == 2 && yer.getDate() == 8) { //Females/Ladies day greeting
                G.middleText('<big>Today is Female\'s day.</big><br><small>Make sure you will greet some lady nicely today and not just today :)<br>- Welcome back -<br>You accumulated ' + B(timeOffline) + ' fast ticks while you were away.<br></small></font>', 'slow');
            };
            if (yer.getMonth() == 2 && yer.getDate() == 8) { //Males/Gentlemen day greeting
                G.middleText('<big>Today is Male\'s day.</big><br><small>Yeah boiii<br>- Welcome back -<br>You accumulated ' + B(timeOffline) + ' fast ticks while you were away.<br></small></font>', 'slow');
            };
            if ((yer.getMonth() == 3 && yer.getDate() == 1)) { //fools, maybe, maybe not, rather not
                G.middleText('-kcab emoclew,dooG -<br><small>Yo accmlatd ' + B(timeOffline) + ' fast ticks whil yo wr away.<br><font color="#2b0">My two kys on my kyboard got brokn, so this happnd.</font></small>', 'slow');
            };
        }




        G.funcs['>9000'] = function () {
            G.Message({ type: 'tutorial', text: '<font size="10">IT\'S OVER 9000!!!!</font>' });
            if (G.achievByName['it\'s over 9000'].won < 1) G.middleText('- Completed <font color="chocolate">It\'s over 9000</font> shadow achievement - <hr width="300"><br><small>Wow, it is insane! No way that can be right...</small>', 'slow');
            G.achievByName['it\'s over 9000'].won++;
            var audio = new Audio(magixURL + 'EasterEgg.mp3');
            audio.play();
        }
        //addition of policy temporary trait management
        G.clickTrait = function (me) {
            var debug = G.keys[17] && G.getSetting('debug');
            var lt = typeof (me.trait.lifetime) === 'function' ? me.trait.lifetime() : me.trait.lifetime;
            var tierSuffix = G.traitsOwnedNames.indexOf('eotm') != -1 ? " II" : "";
            var cost = lt == Infinity ? Math.floor(G.getRes('authority' + tierSuffix).amount) : Math.floor(G.getRes('authority' + tierSuffix).amount * 0.6);
            var index = G.traitsOwned.indexOf(me);
            var canRemoveViaInfluence = G.influenceTraitRemovalCooldown <= 0 && G.getSetting('traitRemovalMode') && Math.floor(G.getRes('influence' + tierSuffix).amount) >= cost;

            if (!canRemoveViaInfluence && !debug && lt != undefined) {
                if (Math.floor(G.getRes('influence' + tierSuffix).amount) < Math.floor(G.getRes('authority').amount * 0.6)) G.middleText('You need more Influence' + tierSuffix + ' to remove this trait.');
                if (G.influenceTraitRemovalCooldown > 0) G.middleText('The cooldown is still active.');
                if (G.getSetting('paused')) G.cantWhenPaused(); //of course can't when paused just to clarify
            }
            if (debug || (canRemoveViaInfluence && me.trait.lifetime != undefined)) {
                if (!debug) {
                    G.influenceTraitRemovalCooldown = 1200 * (lt == Infinity ? 10 : 1); //4 yrs
                    G.lose('influence' + tierSuffix, cost, 'temporary trait management');
                }

                G.traitsOwned.splice(index, 1);//remove trait
                G.traitsOwnedNames.splice(index, 1);
                G.applyKnowEffects(me.trait, true, true);
                G.update['trait']();
            }
        }
    }
})