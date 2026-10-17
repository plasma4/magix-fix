const loadTheme = async path =>
    (await import(path)).default

const merge = (base, theme) => {
    const result = {...base}

    for (const [key, value] of Object.entries(theme)) {
        if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            value.constructor === Object &&
            base[key]?.constructor === Object
        ) {
            result[key] = merge(
                base[key],
                value
            )
        } else {
            result[key] = value
        }
    }

    return result
}

const loadBuiltInTheme = async name => {
    const path = new URL(
        `./themes/${name.toLowerCase()}.css`,
        import.meta.url
    )

    return {
        theme: await loadTheme(
            `@painekillers/tree-builder-core/themes/${name.toLowerCase()}.js`
        ),
        css: path.href
    }
}

const defaultTheme =
    await loadBuiltInTheme("Default")

export class ThemeContainer {
    #themes = {
        Default: defaultTheme
    }

    async load(name, jsPath, cssPath) {
        if (
            jsPath === undefined &&
            cssPath === undefined
        ) {
            const builtIn =
                await loadBuiltInTheme(name)

            this.#themes[name] = {
                theme: merge(
                    defaultTheme.theme,
                    builtIn.theme
                ),
                css: builtIn.css
            }

            return
        }

        if (
            jsPath === undefined ||
            cssPath === undefined
        ) {
            console.warn(
                `Theme ${name} requires both a JS path and a CSS path`
            )

            return
        }

        this.#themes[name] = {
            theme: merge(
                defaultTheme.theme,
                await loadTheme(jsPath)
            ),
            css: cssPath
        }
    }

    get(name) {
        return this.#themes[name]
    }

    get themes() {
        return Object.fromEntries(
            Object.entries(this.#themes)
                .map(([name, value]) => [
                    name,
                    value.theme
                ])
        )
    }
}

export class ThemeApplier {
    #container
    #shadow

    #current

    #defaultCSS
    #css

    #subscription = []

    constructor(container, shadow) {
        this.#container = container
        this.#shadow = shadow

        const defaultTheme =
            this.#container.get("Default")

        this.#defaultCSS =
            document.createElement("link")

        this.#defaultCSS.rel = "stylesheet"
        this.#defaultCSS.href =
            defaultTheme.css

        this.#css =
            document.createElement("link")

        this.#css.rel = "stylesheet"
        this.#css.href =
            defaultTheme.css

        this.#shadow.append(
            this.#defaultCSS,
            this.#css
        )

        this.#current =
            defaultTheme.theme
    }

    async apply(name) {
        const theme =
            this.#container.get(name)

        if (!theme) {
            console.warn(
                `Could not find theme with name ${name}`
            )

            return
        }

        this.#current = theme.theme
        this.#css.href = theme.css

        for (const func of this.#subscription) {
            func()
        }
    }

    get current() {
        return this.#current
    }

    get container() {
        return this.#container
    }

    subscribe(func) {
        this.#subscription.push(func)
    }
}