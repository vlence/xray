import ByteReader from "../utils/bytereader.mjs";
import Segment from "./segment.mjs";

const log = console

export const standaloneMarkers = [
    0xFF01,
    0xFFD0,
    0xFFD1,
    0xFFD2,
    0xFFD3,
    0xFFD4,
    0xFFD5,
    0xFFD6,
    0xFFD7,
    0xFFD8,
    0xFFD9,
]

export default class JPEGParser {
    /**
     * @type {ByteReader}
     */
    reader

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>}
     */
    init(stream) {
        this.reader = new ByteReader(stream)
    }

    async *[Symbol.asyncIterator]() {
        const reader = this.reader

        if (!reader) {
            throw new Error('byte reader not initialised')
        }

        while (!reader.done()) {
            const marker = await reader.readUint16()

            if (!(marker > 0xFF00 && marker < 0xFFFF)) {
                log.warn('invalid marker 0x'
                    + marker.toString(16).padStart(4, '0'))
                return
            }

            const segment = new Segment()
            segment.marker = marker

            if (!standaloneMarkers.includes(segment.marker)) {
                segment.size = await reader.readUint16() + 2
                segment.data = await reader.readBlob(segment.getDataSize())
            }

            yield segment
        }
    }
}
