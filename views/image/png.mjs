import PNGChunk from "../../png/chunk.mjs";
import PNGParser from "../../png/parser.mjs";
import BinaryRenderer from "../application/octet-stream.mjs";
import ImageView from "../image.mjs";

export default class PNGView extends ImageView {
    /**
     * @type {HTMLElement?}
     */
    chunksContainer

    constructor() {
        super()
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>|Blob} blobOrStream
     */
    render(blobOrStream) {
        const imgp = this.renderImg(blobOrStream)

        this.renderChunks(blobOrStream)

        imgp.then(async () => {
            const container = this.getChunksContainer()

            this.getImgContainer().appendChild(container)
        })

        return this.getImgContainer()
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>|Blob} blobOrStream
     */
    async renderChunks(blobOrStream) {
        let stream = blobOrStream

        if (stream instanceof Blob) {
            stream = blobOrStream.stream()
        }

        this.chunksContainer = null
        const container = this.getChunksContainer()
        const parser = new PNGParser()

        parser.init(stream)

        requestAnimationFrame(() => {
            this.getImgContainer().appendChild(container)
        })

        for await (const chunk of parser) {
            if (chunk.data) {
                this.renderChunkAsDetails(chunk)
            }
            else {
                this.renderChunkAsDiv(chunk)
            }
        }
    }

    /**
     * @param {PNGChunk} chunk
     */
    renderChunkAsDetails(chunk) {
        const container = this.getChunksContainer()
        const detailsElem = document.createElement('details')

        detailsElem.innerHTML = `<summary>${chunk.type}, ${chunk.length} bytes</summary>`

        const hexView = new BinaryRenderer()
        const hexContainer = hexView.render(chunk.data)
        detailsElem.appendChild(hexContainer)

        requestAnimationFrame(() => container.appendChild(detailsElem))
    }

    /**
     * @param {PNGChunk} chunk
     */
    renderChunkAsDiv(chunk) {
        const container = this.getChunksContainer()
        const div = document.createElement('div')

        div.innerText = `${chunk.type}`

        requestAnimationFrame(() => container.appendChild(div))
    }

    /**
     * @returns {HTMLElement}
     */
    getChunksContainer() {
        if (!this.chunksContainer) {
            this.chunksContainer = document.createElement('div')
        }

        return this.chunksContainer
    }

    unmount() {
        if (!this.chunksContainer) {
            this.chunksContainer.remove()
        }

        this.chunksContainer = null

        super.unmount()
    }
}
