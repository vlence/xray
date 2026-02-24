import Renderer from '../renderer.mjs'
import ByteReader from '../../utils/bytereader.mjs'
import * as textDecoders from '../../utils/textdecoder.mjs'

const log = console

export default class MP4Renderer extends Renderer {
    /** @type {HTMLElement} */
    #container

    constructor() {
        super()

        this.#container = document.createElement('div')
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>} stream
     */
    render(stream) {
        this.#parse(stream)
        return this.#container
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>} stream
     */
    async #parse(stream) {
        /** @type {number} */
        let size
        /** @type {string} */
        let type

        const ascii = textDecoders.get('ascii')
        let chunk

        const reader = new ByteReader(stream)

        while (!reader.done()) {
            chunk = await reader.readBytes(4)
            size = new DataView(chunk.buffer).getUint32()

            if (size == 0) {
                log.info('done')
                break
            }

            chunk = await reader.readBytes(4)
            type = ascii.decode(chunk)

            if (size == 1) {
                chunk = await reader.readBytes(8)
                let bigSize = new DataView(chunk.buffer).getBigUint64()
                const maxUint32 = 0xffffffff
                const maxUint32BigInt = BigInt(maxUint32)

                log.info(type, bigSize, 'bytes')

                bigSize = bigSize - 16n

                while (bigSize > 0n) {
                    if (bigSize > maxUint32BigInt) {
                        await reader.skipBytes(maxUint32)
                        bigSize -= maxUint32BigInt
                    }
                    else {
                        await reader.skipBytes(Number(bigSize))
                        bigSize = 0n
                    }
                }

                continue
            }

            log.info(type, size, 'bytes')

            await reader.skipBytes(size - 8)
        }
    }

    unmount() {}
}
