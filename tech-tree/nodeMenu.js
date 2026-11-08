
export default (() => {
    let elements;
    let onNodeClick = null;

    const createTitle = text => {
        const element = document.createElement("div");
        element.className = "title";
        element.textContent = text;
        return element;
    };

    const createSectionTitle = text => {
        const element = document.createElement("div");
        element.className = "node-menu-section-title";
        element.textContent = text;
        return element;
    };

    const createText = (className = "text") => {
        const element = document.createElement("div");

        if (className) {
            element.className = className;
        }

        return element;
    };

    const formatValue = value => {
        if (typeof value === "function") {
            return value.toString();
        }

        if (value !== null && typeof value === "object") {
            return JSON.stringify(
                value,
                (_, item) => typeof item === "function"
                    ? item.toString()
                    : item,
                2
            );
        }

        return String(value);
    };

    const formatFunctionString = str => {
        str = str.trim().replace(/^func\s*:\s*/, "");

        const lines = str.split("\n");
        const nonEmpty = lines.filter(line => line.trim());

        if (nonEmpty.length === 0) return "";

        const minIndent = Math.min(
            ...nonEmpty.map(line => line.match(/^\s*/)[0].length)
        );

        return lines
            .map(line => line.slice(minIndent))
            .join("\n")
            .trim();
    };

    const createEffect = effect => {
        const wrapper = createText("text node-menu-effect");

        const { type, ...properties } = effect;

        const typeText = createText("");
        typeText.textContent = `Type : ${type ?? ""}`;

        const separator = document.createElement("hr");
        separator.className = "node-menu-effect-separator";

        const valueText = createText(
            type === "function" ? "codebox" : ""
        );

        valueText.textContent = Object.entries(properties)
            .map(([key, value]) => `${key} : ${formatValue(value)}`)
            .join("\n");

        valueText.textContent = formatFunctionString(valueText.textContent);

        wrapper.append(typeText, separator, valueText);

        return wrapper;
    };

    const createCost = (key, value) => {
        const wrapper = createText("text node-menu-value");
        wrapper.textContent = `${key} : ${formatValue(value)}`;

        return wrapper;
    };

    const createNodeButton = node => {
        const button = document.createElement("button");
        const icon = new Image();

        button.type = "button";
        button.className = "node-menu-related-button";
        button.title = node.val?.full?.displayName
            ?? node.val?.full?.name
            ?? node.val?.full?.id
            ?? "";

        icon.className = "image node-menu-related-icon";
        icon.src = node.val?.icon?.src ?? "";
        icon.alt = button.title;

        button.appendChild(icon);

        button.addEventListener("click", () => {
            onNodeClick?.(node);
        });

        return button;
    };

    const createNodeSection = title => {
        const wrapper = createText("node-menu-related-section");
        const heading = createSectionTitle(title);
        const row = createText("node-menu-related-row");

        wrapper.append(heading, row);

        return { wrapper, row };
    };

    const updateNodeSection = (section, nodes) => {
        section.row.replaceChildren();

        if (Array.isArray(nodes)) {
            nodes.forEach(node => {
                if (!node) return;
                section.row.appendChild(createNodeButton(node));
            });
        }

        section.wrapper.hidden = section.row.children.length === 0;
    };

    const render = (node, container) => {
        if (!elements) {
            const icon = new Image();
            icon.className = "image node-menu-image";

            const id = createTitle("");
            const type = createTitle("");

            const descriptionTitle = createSectionTitle("Description");
            const description = createText("text node-menu-description");

            const costTitle = createSectionTitle("Cost");
            const cost = createText("node-menu-list");

            const effectsTitle = createSectionTitle("Effects");
            const effects = createText("node-menu-list");

            const requires = createNodeSection("Requires");
            const leadsTo = createNodeSection("LeadsTo");

            const raw = document.createElement("details");
            raw.className = "node-menu-raw";

            const rawSummary = document.createElement("summary");
            rawSummary.textContent = "Raw JSON";
            rawSummary.className = "title node-menu-raw-summary";

            const rawContent = createText("codebox node-menu-raw-content");

            raw.append(rawSummary, rawContent);

            elements = {
                icon,
                id,
                type,
                descriptionTitle,
                description,
                costTitle,
                cost,
                effectsTitle,
                effects,
                requires,
                leadsTo,
                raw,
                rawContent
            };
        }

        const {
            icon,
            id,
            type,
            descriptionTitle,
            description,
            costTitle,
            cost,
            effectsTitle,
            effects,
            requires,
            leadsTo,
            raw,
            rawContent
        } = elements;

        // Reattach all cached elements on every render.
        container.replaceChildren(
            icon,
            id,
            type,
            descriptionTitle,
            description,
            costTitle,
            cost,
            effectsTitle,
            effects,
            requires.wrapper,
            leadsTo.wrapper,
            raw
        );

        const full = node.val?.full ?? {};

        // Image
        const source = node.val?.icon?.src;

        icon.hidden = !source;

        if (source && icon.src !== source) {
            icon.src = source;
        }

        // ID and Type
        id.textContent = `ID : ${full.id ?? ""}`;
        type.textContent = `Type : ${full.type ?? ""}`;

        // Description
        description.textContent = full.desc ?? "";

        // Cost
        cost.replaceChildren();

        if (Array.isArray(full.cost)) {
            full.cost.forEach(entry => {
                if (entry === null || entry === undefined) return;

                if (typeof entry === "object") {
                    if (entry.amount === null || entry.amount === undefined) return;

                    cost.appendChild(
                        createCost(entry.name ?? "", entry.amount)
                    );
                } else {
                    cost.appendChild(createCost("", entry));
                }
            });
        } else if (
            full.cost !== null &&
            typeof full.cost === "object"
        ) {
            Object.entries(full.cost).forEach(([key, value]) => {
                if (value === null || value === undefined) return;
                cost.appendChild(createCost(key, value));
            });
        } else if (
            full.cost !== null &&
            full.cost !== undefined &&
            full.cost !== ""
        ) {
            cost.appendChild(createCost("Cost", full.cost));
        }

        const hasCost = cost.children.length > 0;
        costTitle.hidden = !hasCost;
        cost.hidden = !hasCost;

        // Effects
        effects.replaceChildren();

        if (Array.isArray(full.effects)) {
            full.effects.forEach(effect => {
                if (effect === null || effect === undefined) return;

                if (typeof effect === "object") {
                    effects.appendChild(createEffect(effect));
                } else {
                    const wrapper = createText("text");
                    wrapper.textContent = formatValue(effect);
                    effects.appendChild(wrapper);
                }
            });
        }

        const hasEffects = effects.children.length > 0;
        effectsTitle.hidden = !hasEffects;
        effects.hidden = !hasEffects;

        // Requires and LeadsTo
        updateNodeSection(requires, node.parents);
        updateNodeSection(leadsTo, node.children);

        // Raw JSON
        rawContent.textContent = JSON.stringify(
            full,
            (_, value) => typeof value === "function"
                ? value.toString()
                : value,
            2
        );
    };

    render.setOnNodeClick = fn => {
        onNodeClick = typeof fn === "function" ? fn : null;
    };

    return render;
})();
