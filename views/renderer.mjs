export default class Renderer {
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
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>} stream
     *
     * @returns {Node}
     */
    render(stream) {
    }

    /**
     * Signals to this renderer that it will be unmounted.
     *
     * The node returned by `render()` is removed from the
     * document after `unmount()` is called.
     */
    unmount() {
    }
}
