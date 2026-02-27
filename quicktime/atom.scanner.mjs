import Atom from './atom.mjs'
import ByteReader from '../utils/bytereader.mjs'

const log = console

/**
 * Scans for atoms from a readable stream.
 *
 * The scanner assumes that the stream is a valid QuickTime
 * file and parses it as such. It reads the next 4 bytes to
 * determine the size, then the next 4 bytes to determine
 * the type, and finally another 8 bytes to determine the
 * extended size if size is 1.
 *
 * This scanner itself doesn't know how to parse atom bodies,
 * only how to identify atoms' size and type. By default
 * it skips over the data of the atoms it is not able to
 * identify since it does not know how to interpret the
 * data.
 *
 * To provide parsers for specific atoms call defineParser().
 */
export default class AtomScanner {
    /**
     * @type {Map<number, AtomDecoder>}
     */
    #parsers = new Map()

    #textEncoder = new TextEncoder()

    /** @type {ByteReader} */
    #reader

    /**
     * @param {ReadableStream<Uint8Array<Array>>} stream
     */
    constructor(stream) {
        this.#reader = new ByteReader(stream)
    }

    /**
     * Define the parser for an atom type. The given
     * parser will be used to parse the data of the
     * atom.
     *
     * @param {string|number|Uint8Array<ArrayBuffer>} type
     * @param {AtomParser} parser
     */
    defineParser(type, parser) {
        if (typeof type == 'string') {
            type = this.#textEncoder.encode(type)
        }
        else if (typeof type == 'number') {
            const dv = new DataView(new ArrayBuffer(4))
            dv.setUint32(0, type)
            type = new Uint8Array(dv.buffer)
        }
        else if (!(type instanceof Uint8Array)) {
            throw new TypeError('type must be string, number, or Uint8Array')
        }

        this.#parsers.set(this.#typeToNumber(type), parser)
    }

    async *[Symbol.asyncIterator]() {
        const reader = this.#reader

        while (!reader.done()) {
            let atom = new Atom()
            let sizeBytes = await reader.readBytes(4)
            atom.size = new DataView(sizeBytes.buffer).getUint32()

            if (atom.size == 0) {
                // eof
                break
            }

            atom.type = await reader.readBytes(4)

            if (atom.usesExtendedSize()) {
                sizeBytes = await reader.readBytes(8)
                atom.extendedSize = new DataView(sizeBytes.buffer).getBigUint64()
            }

            let parse = this.#parsers.get(this.#typeToNumber(atom.type))

            if (parse) {
                log.info(`${atom.getTypeString()} [${atom.type.toString()}]: parsing ${atom.extendedSize || atom.size} bytes`)
                atom = await parse(reader, atom, this)
            }
            else {
                let skip = atom.size - 8

                if (atom.usesExtendedSize()) {
                    skip = atom.extendedSize - 16n
                }

                log.info(`${atom.getTypeString()} [${atom.type.toString()}]: no parser found; skipping ${skip} bytes`)
                await reader.skipBytes(skip)
            }

            yield atom
        }
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>} type
     */
    #validateType(type) {
        if (!(type instanceof Uint8Array)) {
            throw new TypeError('type must be Uint8Array')
        }

        if (type.byteLength != 4) {
            throw new RangeError('type must be exactly 4 bytes')
        }
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>} type
     */
    #typeToNumber(type) {
        this.#validateType(type)
        return new DataView(type.buffer).getUint32()
    }
}

/**
 * A function that can parse a specific atom's
 * data.
 *
 * The parser MUST consume all the bytes according
 * to the atom's size, even if it doesn't know how
 * to interpret the bytes.
 *
 * @callback AtomParser
 * @param {ByteReader} reader
 * @param {Atom} atom
 * @param {AtomScanner} scanner
 * @returns {Promise<T extends Atom>}
 */
