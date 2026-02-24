class DashRenderer {
    #textDecoder = new TextDecoder('utf-8')

    /**
     * @param {ArrayBuffer} buf
     * @param {string} mime
     * @param {any} opts
     */
    render(buf, mime, opts) {
        const div = document.createElement('div')
        const pre = document.createElement('pre')
        const video = document.createElement('video')
        const dashSupported = video.canPlayType(mime)

        if (dashSupported) {
            video.src = opts.url
            video.controls = true
            video.autoplay = false
            video.style.maxWidth = '480px'
            video.style.maxHeight = '480px'
            div.appendChild(video)
        }

        pre.textContent = this.#textDecoder.decode(buf)

        div.appendChild(pre)

        return div
    }
}

console.info('dash renderer loaded')
