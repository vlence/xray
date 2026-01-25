class VideoRenderer {
    /**
     * @param {ArrayBuffer} buf
     * @param {string} mime
     * @param {any} opts
     */
    render(buf, mime, opts) {
        const video = document.createElement('video')
        const blob = new Blob([buf], { type: mime })
        video.src = URL.createObjectURL(blob)
        video.style.maxWidth = '480px'
        video.autoplay = false
        video.controls = true
        return video
    }
}

console.info('video renderer loaded')
