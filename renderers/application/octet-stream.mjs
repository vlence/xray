/**
 * A BinaryRenderer renders raw binary data as 1s and 0s and
 * also as hex code. Additionally each byte is interpreted as
 * ASCII.
 */
export default class BinaryRenderer {
    #textDecoder = new TextDecoder('utf-8')

    /**
     * Renders the bytes of the data in textual form like so:
     *
     * 0000000A    0123 4567 89AB CDEF 0123 4567 89AB CDEF    Some Ascii Text
     * 
     * @param {ArrayBuffer} buf
     * @param {string} mime
     * @param {any} opts
     */
    render(buf, mime, opts) {
        const view = document.createElement('div')

        const totalBytes = buf.byteLength
        const bytesPerLine = 16
        const linesPerRender = 32
        const bytesPerCol = 2
        const hexGroups = bytesPerLine / bytesPerCol
        const hexGroupsTotalCharLength = (hexGroups * 4) + (hexGroups - 1)

        const r = offset => {
            console.debug({ offset })
            const frag = document.createDocumentFragment()

            for (let l = 0; l < linesPerRender && offset < totalBytes; l++) {
                while (offset < totalBytes) {
                    let asciiLength = bytesPerLine

                    if (offset + asciiLength > totalBytes) {
                        asciiLength = totalBytes - offset
                    }

                    const asciiView = new Uint8Array(buf, offset, asciiLength)

                    const pos = offset.toString(16).toUpperCase().padStart(8, '0')
                    let ascii = this.#textDecoder.decode(asciiView)
                    ascii = ascii.replace(/\n/g, '⏎')
                    ascii = ascii.replace(/\r/g, '␍')
                    ascii = ascii.replace(/\f/g, '␊')
                    ascii = ascii.replace(/\t/g, '␉')
                    ascii = ascii.replace(/ /g, '␠')

                    const bytesAsHex = []
                    for (let i = 0; i < asciiLength; i++) {
                        const left = asciiView.at(i++).toString(16).toUpperCase().padStart(2, '0')

                        if (i == asciiLength) {
                            bytesAsHex.push(left)
                            break
                        }

                        const right = asciiView.at(i).toString(16).toUpperCase().padStart(2, '0')
                        bytesAsHex.push(left+right)
                    }

                    const hex = bytesAsHex.join(' ').padEnd(hexGroupsTotalCharLength, ' ')

                    const pre = document.createElement('pre')
                    pre.innerText = `${pos}    ${hex}    ${ascii}`
                    frag.appendChild(pre)

                    offset += bytesPerLine
                }
            }

            view.appendChild(frag)

            if (offset < totalBytes) {
                requestAnimationFrame(() => r(offset))
            }
        }

        r(0)

        return view
    }
}
