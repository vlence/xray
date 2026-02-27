import Renderer from '../renderer.mjs'
import QuickTimeParser from '../../quicktime/parser.mjs'
import FtypAtom from '../../quicktime/atom.ftyp.mjs'
import streamToBlob from '../../utils/streamtoblob.mjs'

const log = console

export default class QuickTimeRenderer extends Renderer {
    /** @type {HTMLElement} */
    #container

    constructor() {
        super()

        const div = document.createElement('div')

        div.innerHTML = `<video style="width: 100%;" controls></video>`

        this.#container = div
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>|Blob} blobOrStream
     */
    render(blobOrStream) {
        if (blobOrStream instanceof Blob) {
            this.#renderBlob(blobOrStream)
        }
        else if (blobOrStream instanceof ReadableStream) {
            this.#renderStream(blobOrStream)
        }
        else {
            throw new TypeError('blobOrStream must be ReadableStream or Blob')
        }

        return this.#container
    }

    /**
     * @param {Blob} blob
     */
    async #renderBlob(blob) {
        return Promise.all([
            this.#loadAndPlayVideo(blob),
            this.#parse(blob.stream())
        ])
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>} stream
     */
    async #renderStream(stream) {
        const [stream1, stream2] = stream.tee()

        return Promise.all([
            streamToBlob(stream1).then(blob => this.#loadAndPlayVideo(blob)),
            this.#parse(stream2)
        ])
    }

    /**
     * @param {Blob} blob
     */
    async #loadAndPlayVideo(blob) {
        /** @type {HTMLVideoElement} */
        const video = this.#container.querySelector('video')

        const canPlay = function () {
            video.play()
            video.removeEventListener('canplay', canPlay)
        }

        video.addEventListener('canplay', canPlay)
        video.src = URL.createObjectURL(blob)
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>} stream
     */
    async #parse(stream) {
        const scanner = new QuickTimeParser(stream)
        const atoms = []

        for await (const atom of scanner) {
            log.debug(atom.getTypeString(), atom.extendedSize || atom.size)
            atoms.push(atom)
        }
    }

    unmount() {}
}
