/**
 * An ImageRenderer renders an image. You should use this as a fallback
 * if you don't have a more specialised renderer for your image type.
 */
class ImageRenderer {
    /** @type {WeakRef} */
    #imgRef

    constructor() {
        this.#imgRef = new WeakRef(document.createElement('img'))
    }

    /**
     * Returns an <img /> element. Re-uses the previous <img />
     * if it's still available otherwise creates a new one.
     *
     * @returns {HTMLImageElement}
     */
    #getImg() {
        let img = this.#imgRef.deref()

        if (!img) {
            img = document.createElement('img')
            this.#imgRef = new WeakRef(img)
        }

        return img
    }

    /**
     * @param {ArrayBuffer} buf
     * @param {string} mime
     * @param {any} opts
     */
    render(buf, mime, opts) {
        const img = this.#getImg()
        const blob = new Blob([buf], { type: mime })
        img.src = URL.createObjectURL(blob)
        img.style.maxWidth = '480px'
        return img
    }
}

console.info('image renderer loaded')
