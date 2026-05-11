import ByteReader from "../utils/bytereader.mjs";
import PNGChunk from "./chunk.mjs";

const log = console

export const PNG_SIGNATURE = 0x89504E470D0A1A0An

export default class PNGParser {
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

        const sig = await reader.readBigUint64()

        if (sig != PNG_SIGNATURE) {
            log.warn('not a PNG file; expected', PNG_SIGNATURE.toString(16).padStart(16, '0'), 'but got', sig.toString(16).padStart(16, '0'))
            return
        } 

        while (!reader.done()) {
            const chunk = new PNGChunk()

            chunk.length = await reader.readUint32()
            chunk.type = await reader.readUtf8String(4)

            if (chunk.length > 0) {
                chunk.data = await reader.readBlob(chunk.length)
            }

            chunk.crc = await reader.readUint32()

            yield chunk
        }
    }
}
