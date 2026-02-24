class PdfRenderer {
    /**
     * @param {ArrayBuffer} buf
     * @param {string} mime
     * @param {any} opts
     */
    render(buf, mime, opts) {
        const embed = document.createElement('embed')
        const blob = new Blob([buf], { type: mime })
        embed.src = URL.createObjectURL(blob)
        embed.type = mime
        return embed
    }
}

console.info('pdf renderer loaded')
