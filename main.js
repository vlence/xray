document.addEventListener('DOMContentLoaded', main)

function main() {
    console.info('dom content loaded')

    /** @type {HTMLFormElement} */
    const urlform = document.querySelector('#urlform')

    /** @type {HTMLFormElement} */
    const fileform = document.querySelector('#fileform')

    urlform.url.value = window.location.toString()

    const binaryViewParent = document.querySelector('.views .binary')
    const previewViewParent = document.querySelector('.views .preview')

    const binaryRenderer = new BinaryRenderer()
    const previewRenderer = new PreviewRenderer()
    const textRenderer = new TextRenderer()
    const imgRenderer = new ImageRenderer()
    const hlsRenderer = new HlsRenderer()
    const videoRenderer = new VideoRenderer()
    const pdfRenderer = new PdfRenderer()
    const jpegRenderer = new JpegRenderer()
    const dashRenderer = new DashRenderer()

    previewRenderer.registerFallback(textRenderer)
    previewRenderer.register(textRenderer, 'text')
    previewRenderer.register(imgRenderer, 'image')
    previewRenderer.register(videoRenderer, 'video')
    previewRenderer.register(hlsRenderer, 'application/vnd.apple.mpegurl')
    previewRenderer.register(hlsRenderer, 'application/x-mpegurl')
    previewRenderer.register(pdfRenderer, 'application/pdf')
    previewRenderer.register(jpegRenderer, 'image/jpeg')
    previewRenderer.register(dashRenderer, 'application/dash+xml')

    urlform.onsubmit = async (ev) => {
        ev.preventDefault()
        console.info('url form submitted')

        const url = urlform.url.value

        console.info('Fetching', url)
        const response = await fetch(url)

        console.info('Fetched', url)
        const headers = response.headers
        const contentType = headers.get('content-type')

        // const bodyReader = response.body.getReader()

        // const pump = async () => {
        //     const { done, value } = await bodyReader.read()

        //     if (done) {
        //         console.debug('done')
        //         bodyReader.releaseLock()
        //     }

        //     if (!done) {
        //         console.debug('chunk', value)
        //         pump()
        //     }
        // }

        // pump()

        const buf = await response.arrayBuffer()
        const size = buf.byteLength
        let mime = 'text/plain'
        let name = ''
        
        if (contentType) {
            const semicolonpos = contentType.indexOf(';')
            const hasExtraInfo = semicolonpos != -1
            mime = hasExtraInfo ? contentType.substring(0, semicolonpos) : contentType
        }

        console.time('binary render')
        const newBinaryView = binaryRenderer.render(buf)
        console.timeEnd('binary render')

        newBinaryView.classList.add('view')
        binaryViewParent.querySelector('.view').replaceWith(newBinaryView)

        const preview = previewRenderer.render(buf, mime, { url })
        preview.classList.add('view')
        previewViewParent.querySelector('.view').replaceWith(preview)
    }

    fileform.onsubmit = async (ev) => {
        ev.preventDefault()

        /** @type {File} */
        const file = fileform.file.files[0]

        console.info('file uploaded', file.name)

        const buf = await file.arrayBuffer()
        const url = URL.createObjectURL(new Blob([buf], { type: file.type })) 
        const size = buf.byteLength
        const mime = file.type || 'text/plain'
        const name = file.name

        console.time('binary render')
        const newBinaryView = binaryRenderer.render(buf)
        console.timeEnd('binary render')

        newBinaryView.classList.add('view')
        binaryViewParent.querySelector('.view').replaceWith(newBinaryView)

        const preview = previewRenderer.render(buf, mime, { url })
        preview.classList.add('view')
        previewViewParent.querySelector('.view').replaceWith(preview)
    }
}
