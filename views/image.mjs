import Renderer from "./renderer.mjs"
import streamToBlob from "../utils/streamtoblob.mjs"

/**
 * Renders an image in a <img>
 */
export default class ImageView extends Renderer {
    /**
     * @type {HTMLElement}
     */
    imgContainer

    /**
     * @type {HTMLImageElement}
     */
    imgElem

    constructor() {
        super()

        this.imgContainer = document.createElement('div')
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
        this.renderImg(blobOrStream)

        return this.getImgContainer()
    }

    /**
     * @param {Blob|ReadableStream<Uint8Array<ArrayBuffer>>} blobOrStream
     */
    async renderImg(blobOrStream) {
        let blob = blobOrStream

        if (blob instanceof ReadableStream) {
            blob = await streamToBlob(blob)
        }

        const img = this.getImg()
        const container = this.getImgContainer()

        img.remove()

        img.src = URL.createObjectURL(blob)

        container.appendChild(img)
    }

    unmount() {
        this.imgContainer = null
    }

    getImgContainer() {
        if (!this.imgContainer) {
            this.imgContainer = document.createElement('div')
        }

        return this.imgContainer
    }

    getImg() {
        if (!this.imgElem) {
            this.imgElem = document.createElement('img')
            this.imgElem.style.maxWidth = '800px'
        }
        
        return this.imgElem
    }
}
