import Renderer from './views/renderer.mjs'

const log = console

document.addEventListener('DOMContentLoaded', main)

async function main() {
    /** @type {HTMLFormElement} */
    const urlform = document.querySelector('#urlform')

    /** @type {HTMLFormElement} */
    const fileform = document.querySelector('#fileform')

    urlform.url.value = window.location.toString()

    const octetStreamHost = document.querySelector('.hosts .hex .host')
    const previewHost = document.querySelector('.hosts .preview .host')

    const app = new App(octetStreamHost, previewHost)

    await app.init()

    urlform.onsubmit = async (ev) => {
        ev.preventDefault()

        const url = urlform.url.value
        const response = await fetch(url)

        const headers = response.headers
        const contentType = headers.get('content-type')

        let mime = 'text/plain'

        if (contentType) {
            const semicolonpos = contentType.indexOf(';')
            const hasExtraInfo = semicolonpos != -1
            mime = hasExtraInfo ? contentType.substring(0, semicolonpos) : contentType
        }

        app.render(response.body, mime)
    }

    fileform.onsubmit = async (ev) => {
        ev.preventDefault()

        /** @type {File} */
        const file = fileform.file.files[0]
        const mime = file.type || 'text/plain'

        app.render(file, mime)
    }
}

class App {
    /** @type {HTMLElement} */
    #octetStreamHost

    /** @type {HTMLElement} */
    #previewHost

    /** @type {HTMLElement} */
    #currentPreviewNode

    /** @type {RendererRegistry} */
    #registry

    constructor(ohost, phost) {
        this.#octetStreamHost = ohost
        this.#previewHost = phost

        this.#registry = new RendererRegistry('./views')
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>|Blob} blobOrStream
     * @param {string} mime
     */
    async render(blobOrStream, mime) {
        if (typeof mime != 'string') {
            throw new TypeError('mime must be string')
        }

        const registry = this.#registry
        const [octetStream, noPreview, renderer] = await Promise.all([
            registry.get('application/octet-stream'),
            registry.get('nopreview'),
            registry.get(mime),
        ])

        let stream1, stream2

        if (blobOrStream instanceof Blob) {
            stream1 = stream2 = blobOrStream
        }
        else if (blobOrStream instanceof ReadableStream) {
            [stream1, stream2] = blobOrStream.tee()
        }
        else {
            throw new TypeError('blobOrStream must be ReadableStream or Blob')
        }

        octetStream.render(stream1)

        requestAnimationFrame(() => {
            /** @type {HTMLElement} */
            let node

            this.#currentPreviewNode.remove()

            if (!renderer) {
                node = noPreview.render(stream2)
            }
            else {
                node = renderer.render(stream2)
            }

            this.#currentPreviewNode = node
            this.#previewHost.appendChild(node)
        })
    }

    /**
     * Initialises the octet stream renderer and
     * no-preview renderer. This method MUST be
     * called before the first call to render().
     */
    async init() {
        const registry = this.#registry
        const [octetStream, noPreview] = await Promise.all([
            registry.get('application/octet-stream'),
            registry.get('nopreview'),
        ])

        this.#octetStreamHost.appendChild(octetStream.render())
        this.#currentPreviewNode = noPreview.render()
        this.#previewHost.appendChild(this.#currentPreviewNode)
    }
}

class RendererRegistry {
    /** @type {string} */
    basePath

    /** @type {{[key: string]: Renderer}} */
    renderers = {}

    constructor(basePath) {
        this.basePath = basePath
    }

    /**
     * @param {string} mime The MIME type that the renderer renders
     *
     * @returns {Promise<Renderer>}
     */
    async get(mime) {
        let renderer = this.renderers[mime]

        if (!renderer) {
            const modulePath = `${this.basePath}/${mime}.mjs`

            try {
                log.debug('loading renderer', modulePath)
                const module = await import(modulePath)
                log.debug('loaded renderer', mime, module)
                const RendererClass = module.default
                renderer = new RendererClass()
                this.renderers[mime] = renderer
            }
            catch (err) {
                log.warn('failed to load renderer', modulePath, err)
            }
        }

        return renderer
    }
}
