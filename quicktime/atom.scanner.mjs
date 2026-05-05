import Atom from './atom.mjs'
import ByteReader from '../utils/bytereader.mjs'
import MacintoshDate from './date.mjs'
import Matrix from './matrix.mjs'
import * as textDecoders from '../utils/textdecoder.mjs'
import Color from './color.mjs'

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

    /** @type {AtomByteReader} */
    #reader

    /** @type {Atom?} */
    #parentAtom

    /**
     * @param {ReadableStream<Uint8Array<Array>>} stream
     */
    init(stream) {
        this.#reader = new AtomByteReader(stream)
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
        const ascii = textDecoders.get('ascii')

        while (!reader.done()) {
            const bytesReadBefore = reader.bytesRead()

            let atom = new Atom()
            atom.size = await reader.readUint32()

            if (atom.size == 0) {
                // eof
                break
            }

            await reader.read(atom.typeBytes)
            atom.type = ascii.decode(atom.typeBytes)

            if (atom.usesExtendedSize()) {
                atom.extendedSize = await reader.readBigUint64()
            }

            atom.parent = this.#parentAtom

            let parse = this.#parsers.get(this.#typeToNumber(atom.typeBytes))
            if (parse) {
                atom = await parse(reader, atom, this)
            }
            else {
                log.info(`${atom.type} [${atom.typeBytes}]: no parser found; skipping ${atom.getDataSize()} bytes`)
                atom.data = await reader.readBlob(atom.getDataSize())
            }
            const bytesReadAfter = reader.bytesRead()
            const bytesRead = bytesReadAfter - bytesReadBefore

            if (bytesRead < atom.getSize()) {
                log.warn(atom.type, bytesRead + '/' + atom.getSize(), 'bytes read')
                log.warn(atom.type, 'skipping', atom.getSize() - bytesRead, 'bytes')
                await reader.skip(atom.getSize() - bytesRead)
            }
            else if (bytesRead > atom.getSize()) {
                throw new Error(`${atom.type} ${bytesRead}/${atom.getSize()} bytes read`)
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

    /**
     * @param {Atom} atom
     */
    withParent(atom) {
        const clone = new AtomScanner()
        clone.#reader = this.#reader
        clone.#parsers = this.#parsers
        clone.#parentAtom = atom
        clone.#textEncoder = this.#textEncoder

        return clone
    }
}

export class AtomByteReader extends ByteReader {
    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>} stream
     */
    constructor(stream) {
        super(stream)
    }

    /**
     * @param {number|bigint} n
     */
    async readBlob(n) {
        let bytesRemaining = BigInt(n)

        const bufs = []

        const maxUint32 = 0xffffffff
        const maxUint32BigInt = BigInt(maxUint32)

        while (bytesRemaining > 0n) {
            if (bytesRemaining > maxUint32BigInt) {
                const buf = new Uint8Array(maxUint32)
                await this.read(buf)
                bufs.push(buf)
                bytesRemaining -= maxUint32BigInt
            }
            else {
                const buf = new Uint8Array(Number(bytesRemaining))
                await this.read(buf)
                bufs.push(buf)
                bytesRemaining = 0n
            }
        }

        return new Blob(bufs)
    }

    async readMacintoshDate(size = 4) {
        if (size === 4) {
            const d = await this.readUint32()
            return MacintoshDate.from(d)
        }
        else if (size === 8) {
            const d = await this.readBigUint64()
            return MacintoshDate.from(Number(d))
        }
        else {
            throw new RangeError('size must be 4 or 8; got ' + size)
        }
    }

    async readMatrix() {
        const matrix = new Matrix()

        matrix.a = await this.readFixed32()
        matrix.b = await this.readFixed32()
        matrix.u = await this.readFixed32(2)
        matrix.c = await this.readFixed32()
        matrix.d = await this.readFixed32()
        matrix.v = await this.readFixed32(2)
        matrix.x = await this.readFixed32()
        matrix.y = await this.readFixed32()
        matrix.w = await this.readFixed32(2)

        return matrix
    }

    async readColor() {
        const color = new Color()

        color.red = await this.readUint16()
        color.green = await this.readUint16()
        color.blue = await this.readUint16()

        return color
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
 * @param {AtomByteReader} reader
 * @param {Atom} atom
 * @param {AtomScanner} scanner
 * @returns {Promise<T extends Atom>}
 */
