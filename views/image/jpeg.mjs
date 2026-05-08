import JPEGParser from "../../jpeg/parser.mjs";
import streamToBlob from "../../utils/streamtoblob.mjs";
import BinaryRenderer from "../application/octet-stream.mjs";
import ImageView from "../image.mjs";

export default class JPEGView extends ImageView {
    /**
     * @type {HTMLElement?}
     */
    segmentsContainer

    constructor() {
        super()
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>|Blob} blobOrStream
     */
    render(blobOrStream) {
        const imgp = this.renderImg(blobOrStream)

        this.renderSegments(blobOrStream)

        imgp.then(async () => {
            const container = this.getSegmentsContainer()

            this.getImgContainer().appendChild(container)
        })

        return this.getImgContainer()
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>|Blob} blobOrStream
     */
    async renderSegments(blobOrStream) {
        let stream = blobOrStream

        if (stream instanceof Blob) {
            stream = blobOrStream.stream()
        }

        this.segmentsContainer = null
        const container = this.getSegmentsContainer()
        const parser = new JPEGParser()

        parser.init(stream)

        requestAnimationFrame(() => {
            this.getImgContainer().appendChild(container)
        })

        for await (const segment of parser) {
            const detailsElem = document.createElement('details')
            const hexView = new BinaryRenderer()

            detailsElem.innerHTML = `
                <summary>
                ${segment.getMarkerSymbol()}
                0x${segment.marker.toString(16).padStart(4, '0')},
                ${segment.getSize()} bytes
                </summary>
            `

            if (segment.data) {
                const hexContainer = hexView.render(segment.data)
                detailsElem.appendChild(hexContainer)
            }

            requestAnimationFrame(() => container.appendChild(detailsElem))
        }
    }

    /**
     * @returns {HTMLElement}
     */
    getSegmentsContainer() {
        if (!this.segmentsContainer) {
            this.segmentsContainer = document.createElement('div')
        }

        return this.segmentsContainer
    }

    unmount() {
        if (!this.segmentsContainer) {
            this.segmentsContainer.remove()
        }

        this.segmentsContainer = null
        
        super.unmount()
    }
}
