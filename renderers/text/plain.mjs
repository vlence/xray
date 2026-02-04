export default class PlainTextRenderer {
    #textDecoder = new TextDecoder('utf-8')

    /**
     * @param {ArrayBuffer} buf
     * @param {string} mime
     * @param {any} opts
     */
    render(buf, mime, opts) {
        const pre = document.createElement('pre')
        let text = this.#textDecoder.decode(buf)

        try {
            text = JSON.stringify(JSON.parse(text), null, 4)
        }
        catch (e) {}

        pre.textContent = text

        return pre
    }
}
