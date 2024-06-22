# Setting up the Magix fixer
Magix is a mod developed by @pelletsstarPL for NeverEnding Legacy, a game made by Orteil (open [here](https://orteil.dashnet.org/legacy/)). You can follow the instructions below on how to fix Magix.
### Using Magix offline
If you wish, you can locally download a version of Magix that automatically updates. You can download the .zip file [here](https://github.com/plasma4/magix-fix/archive/refs/heads/main.zip). Open the index.html to start playing! (It is advised to extract the .zip file so that everything works properly.)

This offline version of Magix...
- Allows you to import Magix saves and tries to fix them
- Automatically updates to the newest version when online and uses that when offline
- Has the ability to locally mess around with Magix
- Has ALL sprites and files needed for both the base game and Magix pre-downloaded

Additionally, you are also able to locally modify Magix: just go to `localDevelopment.js` and set `offlineMode` to `true`.
## IF YOU ALREADY HAVE MAGIX INSTALLED (if you don't, look at the section below)
Paste in the following script into the console:
```js
javascript:localStorage.setItem("legacySave-alpha",btoa(encodeURIComponent(decodeURIComponent(atob(G.Export())).replace("Xbm-ilapeDSxWf1b/MagixOfficialR55B.js","ZmatEHzFI2_QBuAF/magix.js").replace("Xbm-ilapeDSxWf1b/MagixUtilsR55B.js","ZmatEHzFI2_QBuAF/magixUtils.js")))),location.reload()
```
It's that easy! If you can't open the console for some reason, you can try selecting all the code above and dragging it to your bookmarks bar. Then, go to the tab with NeverEnding Legacy open and click on the bookmark. After that, the bookmark isn't needed anymore and can be removed.

---
## IF YOU ARE STARTING AS A NEW PLAYER
### To set up this mod, go to Orteil's NeverEnding Legacy and click on the "Use Mods" button. There, paste in the following 2 lines:
- https://file.garden/ZmatEHzFI2_QBuAF/magixUtils.js
- https://file.garden/ZmatEHzFI2_QBuAF/magix.js
#### Upon loading it, you can now play the game! Congrats.
***PLEASE BE AWARE:*** The creator of this mod has personally stated in Discord messages that the Magix mod can be, well, modded by anyone who wishes. Note that the license may be invalid due to a lack of clarity. I AM NOT RESPONSIBLE IF THE PROJECT IS NOT PUBLIC-DOMAIN.

This mod provides a few important fixes that prevent the game from breaking. Minimal changes have been made to the contents of the mod. To compare, visit https://file.garden/Xbm-ilapeDSxWf1b/MagixOfficialR55B.js to find the original source.
# What does this fixed mod do?
Here are a few examples:
- Multiple game-breaking bugs are fixed (in particular, bookwriting no longer crashes your game after a bit)
- A variety of spelling and spacing issues are no longer there
- Guilds now work (partially)
- Prison traits obtained randomly (the "sharp edges" and "fragile bars" traits) now work properly
- Negative costs are hidden now
- May come with **new features** down the line!
