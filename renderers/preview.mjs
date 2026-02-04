export default class PreviewRenderer {
    /** @type {{[mime: string]: Renderer}} */
    #renderers = {}

    #fallbackRenderer

    /**
     * @param {ArrayBuffer} buf
     * @param {string} mime
     * @param {any} opts
     *
     * @returns {HTMLElement?}
     */
    render(buf, mime, opts) {
        if (!buf) {
            console.warn('no buffer; cannot render')
            return
        }

        const noMime = !mime || typeof mime != 'string'
        
        if (noMime) {
            console.warn('no mime provided; cannot render')
            return
        }

        mime = mime.toLowerCase()

        const posSemi = mime.indexOf(';')
        const hasParam = posSemi != -1
        const mimeWithoutParam = hasParam ? mime.substring(0, posSemi) : mime
        const posSlash = mimeWithoutParam.indexOf('/')
        const hasSubtype = posSlash != -1
        const type = hasSubtype ? mimeWithoutParam.substring(0, posSlash) : mimeWithoutParam

        let renderer = this.#renderers[mimeWithoutParam] || this.#renderers[type]

        if (!renderer) {
            renderer = this.#fallbackRenderer
        }

        console.debug({renderer, mime, mimeWithoutParam, type})

        const node = renderer.render(buf, mime, opts)

        if (!(node instanceof HTMLElement)) {
            console.warn('renderer for ' + mime + 'did not return HTML element')
        }

        return node
    }

    /**
     * @param {any} renderer
     * @param {string} mime
     */
    register(renderer, mime) {
        const noRenderer = !renderer || typeof renderer.render != 'function'
        const noMime = !mime || typeof mime != 'string'
        
        if (noMime) {
            throw new Error('no mime provided')
        }

        if (noRenderer) {
            throw new Error('no renderer provided')
        }

        mime = mime.toLowerCase()

        const posSemi = mime.indexOf(';')
        const hasParam = posSemi != -1
        const mimeWithoutParam = hasParam ? mime.substring(0, posSemi) : mime
        const posSlash = mimeWithoutParam.indexOf('/')
        const hasSubtype = posSlash != -1
        const type = hasSubtype ? mimeWithoutParam.substring(0, posSlash) : mimeWithoutParam
        const subtype = hasSubtype ? mimeWithoutParam.substring(posSlash+1) : ''

        if (subtype) {
            console.debug('registering with subtype', {renderer, type, subtype})
            this.#renderers[`${type}/${subtype}`] = renderer
        }
        else {
            console.debug('registering without subtype', {renderer, type})
            this.#renderers[type] = renderer
        }
    }

    registerFallback(renderer) {
        const noRenderer = !renderer || typeof renderer.render != 'function'

        if (noRenderer) {
            return false
        }

        this.#fallbackRenderer = renderer

        return true
    }
}

/**
 * @typedef {Object} Renderer
 * @prop {Function} render
 */
