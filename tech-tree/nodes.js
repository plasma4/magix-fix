// This script makes our nodes and stuff

import { Node } from "@painekillers/tree-builder-core"

const c1 = window.magixData.civ1Object
const c2 = window.magixData.civ2Object

const spriteCache = new Map();
const iconCache = new Map();

const TILE_SIZE = 24;
const iconScale = 1;

function loadSpriteSheet(url) {
    if (spriteCache.has(url)) {
        return spriteCache.get(url);
    }

    const promise = new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load: ${url}`));
        img.src = url;
    });

    spriteCache.set(url, promise);

    promise.catch(() => {
        if (spriteCache.get(url) === promise) {
            spriteCache.delete(url);
        }
    });

    return promise;
}

async function getIcon(icon, civ2 = false) {
    const race = civ2 ? civ2Object : civ1Object;

    // Include race and icon data in the cache key.
    const cacheKey = JSON.stringify([civ2, icon]);

    if (iconCache.has(cacheKey)) {
        return iconCache.get(cacheKey);
    }

    const promise = (async () => {
        const size = TILE_SIZE * iconScale;
        const canvas = document.createElement("canvas");

        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");

        const layers = [];
        let i = 0;

        while (i < icon.length) {
            const x = icon[i++];
            const y = icon[i++];

            if (y === undefined) {
                throw new Error("Invalid icon data");
            }

            let url = "../img/iconSheet.png?v=1";

            if (typeof icon[i] === "string") {
                const sheetId = icon[i++];
                url = race.sheets[sheetId];

                if (!url) {
                    throw new Error(`Unknown spritesheet: ${sheetId}`);
                }

                if (url.startsWith("https://file.garden/")) {
                    url = url.replace(
                        /^https:\/\/file\.garden\/.+?\//,
                        "../Magix/"
                    );
                } else if (url.startsWith("Magix/")) {
                    url = "../" + url;
                }
            }

            const image = await loadSpriteSheet(url);

            layers.push({ image, x, y });
        }

        // CSS background layers are painted first-to-last,
        // with the first layer appearing on top.
        // Canvas draws later layers on top, so reverse the order.
        for (let j = layers.length - 1; j >= 0; j--) {
            const layer = layers[j];

            ctx.drawImage(
                layer.image,
                layer.x * TILE_SIZE,
                layer.y * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE,
                0,
                0,
                size,
                size
            );
        }

        // Convert the composited icon into one HTMLImageElement.
        const result = new Image();

        result.src = canvas.toDataURL();

        await new Promise((resolve, reject) => {
            result.onload = resolve;
            result.onerror = reject;
        });

        return result;
    })();

    iconCache.set(cacheKey, promise);

    try {
        return await promise;
    } catch (error) {
        iconCache.delete(cacheKey);
        throw error;
    }
}

async function parseArray(arr, useReq = false, civ = "civ1") {
    let result = [];

    for (const item of arr) {
        if (item.req == null) {
            console.log("Missing req:", item);
        }

        const node = new Node(
            item.name,
            useReq ? Object.keys(item.req ?? {}) : item.precededBy ?? [],
            [],
            {
                full: item,
                icon: await getIcon(item.icon, civ === "civ2")
            }
        );

        result.push(node);

        /*
        getIcon(item.icon, civ === "civ2").then(icon => {
            node.val.icon = icon;

            // Optional: notify your renderer that the icon is ready.
            // render();
        }).catch(error => {
            console.error(`Failed to load icon for ${item.name}:`, error);
        }); */
    } 

    return result;
}

export default async function getNodes(civ = "civ1", useReq = false) {
    let nodes = []
    
    if (civ === "civ1") {
        nodes = [...await parseArray(c1.techs, useReq, civ), ...await parseArray(c1.traits, useReq, civ)]
    } else if (civ === "civ2") {
        nodes = [...await parseArray(c2.techs, useReq, civ), ...await parseArray(c2.traits, useReq, civ)]
    }

    return nodes
}