import Renderer from './renderer.mjs'

/**
 * Renderer that renders the text "No preview available".
 *
 * Meant to be used as a default renderer when the app
 * first loads and if no other renderer is available.
 */
export default class NoPreviewRenderer extends Renderer {
    /** @type {HTMLElement} */
    #node
    
    constructor() {
        super()

        const div = document.createElement('div')
        div.textContent = 'No preview available'
        this.#node = div
    }

    render() {
        return this.#node
    }
}
