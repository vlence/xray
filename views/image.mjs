import Renderer from "./renderer.mjs"
import streamToBlob from "../utils/streamtoblob.mjs"

/**
 * An ImageRenderer renders an image. You should use this as a fallback
 * if you don't have a more specialised renderer for your image type.
 */
export default class ImageRenderer extends Renderer {
    /**
     * @type {HTMLElement}
     */
    container

    /**
     * @type {HTMLImageElement}
     */
    imgElem

    constructor() {
        super()

        this.container = document.createElement('div')
    }

    /**
     * Reads the given stream and renders it. The returned
     * node is attached to the document.
     *
     * This function is called only when the document
     * needs to be updated with the renderer's UI. UI updates
     * as a result of user interaction with this renderer
     * is the renderer's responsibility.
     *
     * The same node can be returned multiple times.
     *
     * @abstract
     *
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>|Blob} blobOrStream
     *
     * @returns {Node}
     */
    render(blobOrStream) {
        if (blobOrStream instanceof ReadableStream) {
            streamToBlob(blobOrStream)
                .then(blob => this.renderImg(blob))
        }
        else {
            this.renderImg(blobOrStream)
        }

        return this.getContainer()
    }

    /**
     * @param {Blob} blob
     */
    renderImg(blob) {
        const img = this.getImg()
        const container = this.getContainer()

        img.remove()

        img.src = URL.createObjectURL(blob)

        container.appendChild(img)
    }

    unmount() {
        this.container = null
    }

    getContainer() {
        if (!this.container) {
            this.container = document.createElement('div')
        }

        return this.container
    }

    getImg() {
        if (!this.imgElem) {
            this.imgElem = document.createElement('img')
            this.imgElem.style.maxWidth = '800px'
        }
        
        return this.imgElem
    }
}
