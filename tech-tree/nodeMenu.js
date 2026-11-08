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
        element.textContent = text;
        element.style.fontSize = "1.2em";
        element.style.fontWeight = "bold";
        element.style.padding = "8px 0";
        element.style.color = "inherit";
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
        const wrapper = createText("text");

        const { type, ...properties } = effect;

        const typeText = createText("");
        typeText.textContent = `Type : ${type ?? ""}`;

        const separator = document.createElement("hr");
        separator.style.border = "none";
        separator.style.borderTop = "1px solid rgba(128,128,128,0.3)";
        separator.style.margin = "8px 0";

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
        const wrapper = createText("text");
        wrapper.style.whiteSpace = "pre-wrap";
        wrapper.style.overflowWrap = "anywhere";
        wrapper.textContent = `${key} : ${formatValue(value)}`;

        return wrapper;
    };

    const createNodeButton = node => {
        const button = document.createElement("button");
        const icon = new Image();

        button.type = "button";
        button.title = node.val?.full?.displayName
            ?? node.val?.full?.name
            ?? node.val?.full?.id
            ?? "";

        // Remove the browser's default button appearance.
        button.style.all = "unset";
        button.style.cursor = "pointer";
        button.style.flex = "0 0 auto";

        icon.className = "image";
        icon.src = node.val?.icon?.src ?? "";
        icon.alt = button.title;

        // Same image treatment as the main icon, but smaller.
        icon.style.display = "block";
        icon.style.width = "64px";
        icon.style.maxWidth = "100%";
        icon.style.height = "auto";
        icon.style.maxHeight = "none";
        icon.style.objectFit = "contain";
        icon.style.imageRendering = "pixelated";
        icon.style.setProperty("image-rendering", "crisp-edges");

        button.appendChild(icon);

        button.addEventListener("click", () => {
            onNodeClick?.(node);
        });

        return button;
    };

    const createNodeSection = (title, nodes) => {
        const wrapper = createText("");
        const heading = createSectionTitle(title);

        const row = createText("");
        row.style.display = "flex";
        row.style.flexDirection = "row";
        row.style.flexWrap = "nowrap";
        row.style.alignItems = "center";
        row.style.gap = "8px";
        row.style.overflowX = "auto";
        row.style.overflowY = "hidden";
        row.style.width = "100%";
        row.style.paddingBottom = "8px";
        row.style.boxSizing = "border-box";

        if (Array.isArray(nodes)) {
            nodes.forEach(node => {
                if (!node) return;
                row.appendChild(createNodeButton(node));
            });
        }

        wrapper.append(heading, row);
        wrapper.hidden = row.children.length === 0;

        return wrapper;
    };

    const render = (node, container) => {
        if (!elements) {
            const icon = new Image();

            icon.className = "image";
            icon.style.display = "block";
            icon.style.width = "200px";
            icon.style.maxWidth = "100%";
            icon.style.height = "auto";
            icon.style.maxHeight = "none";
            icon.style.objectFit = "contain";
            icon.style.imageRendering = "pixelated";
            icon.style.setProperty("image-rendering", "crisp-edges");
            icon.style.margin = "0 0 16px 0";

            const id = createTitle("");
            const type = createTitle("");

            const descriptionTitle = createSectionTitle("Description");
            const description = createText("text");
            description.style.whiteSpace = "pre-wrap";
            description.style.overflowWrap = "anywhere";

            const costTitle = createSectionTitle("Cost");
            const cost = createText("");
            cost.style.display = "flex";
            cost.style.flexDirection = "column";
            cost.style.gap = "8px";

            const effectsTitle = createSectionTitle("Effects");
            const effects = createText("");
            effects.style.display = "flex";
            effects.style.flexDirection = "column";
            effects.style.gap = "8px";

            const raw = document.createElement("details");
            raw.style.marginTop = "14px";

            const rawSummary = document.createElement("summary");
            rawSummary.textContent = "Raw JSON";
            rawSummary.className = "title";
            rawSummary.style.cursor = "pointer";

            const rawContent = createText("codebox");
            rawContent.style.marginTop = "8px";

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
            raw,
            rawContent
        } = elements;

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
        const requires = createNodeSection("Requires", node.parents);
        const leadsTo = createNodeSection("LeadsTo", node.children);

        // Raw JSON
        rawContent.textContent = JSON.stringify(
            full,
            (_, value) => typeof value === "function"
                ? value.toString()
                : value,
            2
        );

        // Update container
        if (id.parentElement !== container) {
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
                requires,
                leadsTo,
                raw
            );
        } else {
            // Keep the navigation sections current when rendering another node.
            const existingRequires = container.children[9];
            const existingLeadsTo = container.children[10];

            existingRequires.replaceWith(requires);
            existingLeadsTo.replaceWith(leadsTo);
        }
    };

    render.setOnNodeClick = fn => {
        onNodeClick = typeof fn === "function" ? fn : null;
    };

    return render;
})();
