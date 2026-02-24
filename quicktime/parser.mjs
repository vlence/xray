import Atom from './atom.mjs'
import ByteReader from '../utils/bytereader.mjs'

const log = console

class Parser {

    /**
     * Parses the given stream as a QuickTime file.
     *
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>} stream The stream to parse.
     */
    async parse(stream) {
        /** @type {number} */
        let size
        /** @type {string} */
        let type

        const textDecoder = new TextDecoder('ascii')
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
            type = textDecoder.decode(chunk)

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
}

export default Parser
