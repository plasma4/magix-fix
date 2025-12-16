# Setting up the Magix fixer
Magix is a gigantic content mod developed by @pelletsstarPL for NeverEnding Legacy, a game made by Orteil (open [here](https://orteil.dashnet.org/legacy/)). The original mod creator developed most of the mod but unfortunately stopped working on the project a while back due to IRL stuff. You can follow the instructions below on how to fix Magix; to locally download Magix and mess around with it, read the bottom section.

<sup>Devs and curious individuals, please take a peek at `DOCS.md` for a better understanding of how NeverEnding Legacy actually works.</sup>
## IF YOU ALREADY HAVE MAGIX INSTALLED (if you don't, look at the section below)
Paste in the following script into the console:
```js
javascript:localStorage.setItem("legacySave-alpha",btoa(encodeURIComponent(decodeURIComponent(atob(localStorage.getItem("legacySave-alpha"))).replace("Xbm-ilapeDSxWf1b/MagixOfficialR55B.js","ZmatEHzFI2_QBuAF/magix.js").replace("Xbm-ilapeDSxWf1b/MagixUtilsR55B.js","ZmatEHzFI2_QBuAF/magixUtils.js")))),location.reload()
```
It's that easy! If you can't open the console for some reason, you can try selecting all the code above and dragging it to your bookmarks bar. Then, go to the tab with NeverEnding Legacy open and click on the bookmark. After that, the bookmark isn't needed anymore and can be removed.
## IF YOU ARE STARTING AS A NEW PLAYER
### To set up this mod, go to Orteil's NeverEnding Legacy and click on the "Use Mods" button. There, paste in the following 2 lines:
- https://file.garden/ZmatEHzFI2_QBuAF/magixUtils.js
- https://file.garden/ZmatEHzFI2_QBuAF/magix.js

Upon loading it, you should be able to play the game!
##
***PLEASE BE AWARE:*** The creator of this mod has personally stated in Discord messages that the Magix mod can be modded by anyone who wishes, despite the comments in magix.us. This mod has an unclear license, however; therefore, I AM NOT RESPONSIBLE IF THE PROJECT IS NOT PUBLIC-DOMAIN.

<sup>This mod provides a few important fixes that prevent the game from breaking. Non-minimal changes have been made to the contents of the mod. To compare, visit https://file.garden/Xbm-ilapeDSxWf1b/MagixOfficialR55B.js to find the original source of magix.js and https://file.garden/Xbm-ilapeDSxWf1b/MagixUtilsR55B.js for magixUtils.js.</sup>
## What does this fixed mod do?
Here are a few examples:
- Multiple game-breaking bugs are **fixed** now (in particular, bookwriting will no longer cause problems)
- Thousands of spelling and text issues corrected or improved
- Some alternative techs can now be obtained simultaneously
- Various traits have been fixed
- A few new unique trials implemented
- Dozens of techs and mechanics have been added (including a new way to get sand)
- Negative costs are hidden now
- May come with **new features** down the line!
## How would you go about adding other mods along with Magix?
It's simple! You can learn how to add other mods that work with Magix and find a list of a few of them [over here](https://github.com/plasma4/magix-extras/blob/master/README.md).

---
How do you use Magix offline?
If you wish, you can locally download a version of Magix that automatically updates. You can download the .zip file [here](https://github.com/plasma4/magix-fix/archive/refs/heads/main.zip). Open the index.html file to begin playing! (It is advised to extract the .zip file so that everything works properly.)

This offline version of Magix...
- Allows you to import Magix saves and use Magix with just one click (well, maybe not *one* but close enough)
- Automatically updates to the newest version of fixed Magix when online and uses that when offline
- Has the ability to locally mess around with Magix
- Has ALL sprites and files needed for both the base game and Magix pre-downloaded
- Some options for when you exit the page, such as autosaving or confirming if you want to leave or not

<sup>Note: if you wish to view data about the Magix mod (such as icons, names, and functions), you can use the magix-wiki.html file or view [the online version](https://plasma4.github.io/magix-fix/magix-wiki.html). You are even able to **create** your own mods from there, so check it out!</sup>

## Known issues
- Territory tab doesn't render on game load if saved with that tab open
- Moving the territory map isn't supported on touchscreen and behaves really weirdly at lower resolutions (due to game size scaling)
- Two trials still not implemented yet
- Second race's theme acts weird and doesn't immediately update

## Information for devs
Check `localDevelopment.js` to mess with some settings, and `DOCS.md` for lots more context on how the game works and how to develop a basic mod yourself (hopefully to avoid dev headaches).

---
<sup>Be aware that the file version uses raw.githubusercontent.com links for uncached XML request purposes whenever the user has an internet connection instead. The link will automatically fix itself when importing or exporting, and this shouldn't be something you need to worry about. If you are a programmer and want to use the magix.js and magixUtils.js files in the code, set `offlineMode` to `true` in `localDevelopment.js`.</sup>
### Alternate links for Magix
Want a few other links for loading Magix? Try some of these:
```
https://cdn.jsdelivr.net/gh/plasma4/magix-fix@main/magixUtils.js
https://cdn.jsdelivr.net/gh/plasma4/magix-fix@main/magix.js
```
```
https://plasma4.github.io/magix-fix/magixUtils.js
https://plasma4.github.io/magix-fix/magix.js
```
```
https://rawcdn.githack.com/plasma4/magix-fix/main/magixUtils.js
https://rawcdn.githack.com/plasma4/magix-fix/main/magix.js
```