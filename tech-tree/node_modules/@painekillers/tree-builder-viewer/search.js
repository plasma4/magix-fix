/**
 * @typedef {Object} SearchEntry
 * @property {string} name
 * @property {*} value
 */

export default class SearchIndex {

    /**
     * @param {SearchEntry[]} entries
     */

    constructor(entries) {
        this.entries = entries
    }

    add(entry) {
        this.entries.push(entry)
    }

    #jaroWinkler(a, b) {
        if(a === b) return 1

        if(!a.length || !b.length) return 0

        const distance = Math.floor(Math.max(a.length, b.length) / 2) - 1

        const aMatches = new Array(a.length).fill(false)
        const bMatches = new Array(b.length).fill(false)

        let matches = 0

        for(let i = 0; i < a.length; i++) {
            const start = Math.max(0, i - distance)
            const end = Math.min(i + distance + 1, b.length)

            for(let j = start; j < end; j++) {
                if(bMatches[j] || a[i] !== b[j]) continue

                aMatches[i] = true
                bMatches[j] = true
                matches++

                break
            }
        }

        if(matches === 0) return 0

        let k = 0
        let transpositions = 0

        for(let i = 0; i < a.length; i++) {
            if(!aMatches[i]) continue

            while(!bMatches[k]) {
                k++
            }

            if(a[i] !== b[k]) {
                transpositions++
            }

            k++
        }

        const jaro =
            (
                matches / a.length +
                matches / b.length +
                (matches - transpositions / 2) / matches
            ) / 3

        const prefixLength = Math.min(4, a.length, b.length)

        let prefix = 0

        while(prefix < prefixLength && a[prefix] === b[prefix]) {
            prefix++
        }

        return jaro + prefix * 0.1 * (1 - jaro)
    }

    #score(entry, query) {
        const a = query.toLowerCase()
        const b = entry.name.toLowerCase()

        if (a === b) return 1

        let score = this.#jaroWinkler(a, b)

        if (b.startsWith(a)) {
            score += 0.15
        }

        if (b.length < a.length) {
            const difference = a.length - b.length
            score -= difference * 0.03
        }

        return Math.max(0, Math.min(score, 0.99))
    }

    search(query, limit = 10, minScore = 0.5) {
        const results = []

        for (const entry of this.entries) {
            const score = this.#score(entry, query)

            if (score < minScore) continue

            results.push({ entry, score })
        }

        results.sort((a, b) => b.score - a.score)

        return results.slice(0, limit)
    }
}