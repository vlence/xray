/**
 * @typedef {Object} JpegSegment
 * @prop {number} offset The position of this segment in the image.
 * @prop {string} desc The description of this segment.
 * @prop {string} symbol The symbol of this segment.
 * @prop {string} markerBytesHex The first two bytes of this segment as a hex string.
 * @prop {boolean} hasData `true` if this segment has a payload.
 * @prop {Uint8Array} buf Contains all bytes of this segment.
 * @prop {Uint8Array?} data This segment's data.
 */

/**
 * An ImageRenderer renders an image. You should use this as a fallback
 * if you don't have a more specialised renderer for your image type.
 */
class JpegRenderer {
    /** @type {WeakRef} */
    #imgRef

    #textDecoder = new TextDecoder('utf-8')

    #symbols = {
        0x01: 'TEM',
        0xC0: 'SOF0',
        0xC1: 'SOF1',
        0xC2: 'SOF2',
        0xC3: 'SOF3',
        0xC4: 'DHT',
        0xC5: 'SOF5',
        0xC6: 'SOF6',
        0xC7: 'SOF7',
        0xC8: 'JPG',
        0xC9: 'SOF9',
        0xCA: 'SOF10',
        0xCB: 'SOF11',
        0xCC: 'DAC',
        0xCD: 'SOF13',
        0xCE: 'SOF14',
        0xCF: 'SOF15',
        0xD0: 'RST0',
        0xD1: 'RST1',
        0xD2: 'RST2',
        0xD3: 'RST3',
        0xD4: 'RST4',
        0xD5: 'RST5',
        0xD6: 'RST6',
        0xD7: 'RST7',
        0xD8: 'SOI',
        0xD9: 'EOI',
        0xDA: 'SOS',
        0xDB: 'DQT',
        0xDC: 'DNL',
        0xDD: 'DRI',
        0xDE: 'DHP',
        0xDF: 'EXP',
        0xE0: 'APP0',
        0xE1: 'APP1',
        0xE2: 'APP2',
        0xE3: 'APP3',
        0xE4: 'APP4',
        0xE5: 'APP5',
        0xE6: 'APP6',
        0xE7: 'APP7',
        0xE8: 'APP8',
        0xE9: 'APP9',
        0xEA: 'APP10',
        0xEB: 'APP11',
        0xEC: 'APP12',
        0xED: 'APP13',
        0xEE: 'APP14',
        0xEF: 'APP15',
        0xF0: 'JPG0',
        0xF1: 'JPG1',
        0xF2: 'JPG2',
        0xF3: 'JPG3',
        0xF4: 'JPG4',
        0xF5: 'JPG5',
        0xF6: 'JPG6',
        0xF7: 'JPG7',
        0xF8: 'JPG8',
        0xF9: 'JPG9',
        0xFA: 'JPG10',
        0xFB: 'JPG11',
        0xFC: 'JPG12',
        0xFD: 'JPG13',
        0xFE: 'COM',
    }

    #descs = {
        0x01: 'For temporary private use in arithmetic coding',
        0xC0: 'Baseline DCT',
        0xC1: 'Extended sequential DCT',
        0xC2: 'Progressive DCT',
        0xC3: 'Lossless (sequential)',
        0xC4: 'Define Huffman table(s)',
        0xC5: 'Differential sequential DCT',
        0xC6: 'Differential progressive DCT',
        0xC7: 'Differential lossless (sequential)',
        0xC8: 'Reserved for JPEG extensions',
        0xC9: 'Extended sequential DCT',
        0xCA: 'Progressive DCT',
        0xCB: 'Lossless (sequential)',
        0xCC: 'Define arithmetic coding conditioning(s)',
        0xCD: 'Differential sequential DCT',
        0xCE: 'Differential progressive DCT',
        0xCF: 'Differential lossless (sequential)',
        0xD0: 'Restart with modulo 8 count “m”',
        0xD1: 'Restart with modulo 8 count “m”',
        0xD2: 'Restart with modulo 8 count “m”',
        0xD3: 'Restart with modulo 8 count “m”',
        0xD4: 'Restart with modulo 8 count “m”',
        0xD5: 'Restart with modulo 8 count “m”',
        0xD6: 'Restart with modulo 8 count “m”',
        0xD7: 'Restart with modulo 8 count “m”',
        0xD8: 'Start of image',
        0xD9: 'End of image',
        0xDA: 'Start of scan',
        0xDB: 'Define quantization table(s)',
        0xDC: 'Define number of lines',
        0xDD: 'Define restart interval',
        0xDE: 'Define hierarchical progression',
        0xDF: 'Expand reference component(s)',
        0xE0: 'Reserved for application segments',
        0xE1: 'Reserved for application segments',
        0xE2: 'Reserved for application segments',
        0xE3: 'Reserved for application segments',
        0xE4: 'Reserved for application segments',
        0xE5: 'Reserved for application segments',
        0xE6: 'Reserved for application segments',
        0xE7: 'Reserved for application segments',
        0xE8: 'Reserved for application segments',
        0xE9: 'Reserved for application segments',
        0xEA: 'Reserved for application segments',
        0xEB: 'Reserved for application segments',
        0xEC: 'Reserved for application segments',
        0xED: 'Reserved for application segments',
        0xEE: 'Reserved for application segments',
        0xEF: 'Reserved for application segments',
        0xF0: 'Reserved for JPEG extensions',
        0xF1: 'Reserved for JPEG extensions',
        0xF2: 'Reserved for JPEG extensions',
        0xF3: 'Reserved for JPEG extensions',
        0xF4: 'Reserved for JPEG extensions',
        0xF5: 'Reserved for JPEG extensions',
        0xF6: 'Reserved for JPEG extensions',
        0xF7: 'Reserved for JPEG extensions',
        0xF8: 'Reserved for JPEG extensions',
        0xF9: 'Reserved for JPEG extensions',
        0xFA: 'Reserved for JPEG extensions',
        0xFB: 'Reserved for JPEG extensions',
        0xFC: 'Reserved for JPEG extensions',
        0xFD: 'Reserved for JPEG extensions',
        0xFE: 'Comment',
    }

    constructor() {
        this.#imgRef = new WeakRef(document.createElement('img'))
    }

    /**
     * Returns an <img /> element. Re-uses the previous <img />
     * if it's still available otherwise creates a new one.
     *
     * @returns {HTMLImageElement}
     */
    #getImg() {
        let img = this.#imgRef.deref()

        if (!img) {
            img = document.createElement('img')
            this.#imgRef = new WeakRef(img)
        }

        return img
    }

    /**
     * @param {ArrayBuffer} buf
     * @param {string} mime
     * @param {any} opts
     */
    render(buf, mime, opts) {
        const div = document.createElement('div')
        const img = document.createElement('img')
        const blob = new Blob([buf], { type: mime })
        
        img.src = URL.createObjectURL(blob)
        img.style.maxWidth = '480px'

        const segments = this.#segments(new Uint8Array(buf))
        const table = document.createElement('table')
        const tbody = document.createElement('tbody')
        
        table.innerHTML = `<thead>
    <tr>
        <th>Offset</th>
        <th>Marker</th>
        <th>Symbol</th>
        <th>Description</th>
        <th>Size (in bytes)</th>
        <th>Data Size (in bytes)</th>
        <th>Data</th>
    </tr>
</thead>`

        for (const segment of segments) {
            const tr = document.createElement('tr')
            const td = document.createElement('td')
            const pre = document.createElement('pre')
            
            const markerByte = segment.buf.at(1)

            tr.innerHTML = `<td>${segment.offset.toString(16).toUpperCase().padStart(8, '0')}</td>
<td>0xFF${markerByte.toString(16).toUpperCase().padStart(2, '0')}</td>
<td>${segment.symbol}</td>
<td>${segment.desc}</td>
<td>${segment.buf.byteLength}</td>
<td>${segment.data?.byteLength || 0}</td>`

            const isApp = segment.symbol.startsWith('APP')
            const isComment = segment.symbol.startsWith('COM')
            const payloadIsText = isApp || isComment
            
            if (payloadIsText) {
                pre.textContent = this.#textDecoder.decode(segment.data)
                td.appendChild(pre)
                tr.appendChild(td)
            }

            tbody.appendChild(tr)
        }

        table.appendChild(tbody)

        div.appendChild(img)
        div.appendChild(table)

        return div
    }

    /**
     * @param {Uint8Array} buf
     */
    #segments(buf) {
        const noBuffer = !buf || !(buf instanceof Uint8Array)

        if (noBuffer) {
            throw new Error('cannot extract segments; no buffer')
        }

        /** @type {JpegSegment[]} */
        const segments = []

        let nextMarker = 0

        while (nextMarker < buf.byteLength) {
            const m1 = buf.at(nextMarker)   // first marker byte
            const m2 = buf.at(nextMarker+1) // second marker byte

            const notMarker = m1 != 0xFF
            const skipMarker = m2 == 0x00 || m2 == 0xFF

            if (notMarker) {
                nextMarker++
                continue
            }

            if (skipMarker) {
                nextMarker += 2
                continue
            }

            /** @type {JpegSegment} */
            const segment = {
                offset: nextMarker,
                desc: this.#descs[m2] || 'Reserved',
                symbol: this.#symbols[m2] || 'RES',
            }

            nextMarker += 2 // jump to data size bytes

            const s1 = buf.at(nextMarker)   // data size byte 1
            const s2 = buf.at(nextMarker+1) // data size byte 2

            segment.hasData = s1 !== 0xFF && s1 !== undefined && s2 !== undefined

            if (!segment.hasData) {
                segment.buf = new Uint8Array(buf.buffer, segment.offset, 2)
                segments.push(segment)
                continue
            }

            const dataOffset = nextMarker + 2 // data starts after 2 bytes
            const segmentSize = 256 * s1 + s2
            const dataSize = segmentSize - 2

            segment.data = new Uint8Array(buf.buffer, dataOffset, dataSize)
            segment.buf = new Uint8Array(buf.buffer, segment.offset, segmentSize + 2)

            nextMarker += dataSize

            segments.push(segment)
        }

        return segments
    }
}

console.info('jpeg renderer loaded')
