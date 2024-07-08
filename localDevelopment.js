// THIS VARIABLE IS FOR LOCALLY MODIFYING MAGIX AND SHOULD NOT BE CHANGED WHEN PLAYING NORMALLY.
// If you wish to force Magix to use your local files (magix.js and magixUtils.js), set the value below to true. This is not advised because normally, the game will automatically use the newest version when possible and use your browser's local storage to keep an offline copy of the scripts. You should only use this if you are trying to modify Magix!

var offlineMode = true


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