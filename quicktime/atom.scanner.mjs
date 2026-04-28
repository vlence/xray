import Atom from './atom.mjs'
import ByteReader from '../utils/bytereader.mjs'
import MacintoshDate from './date.mjs'
import Matrix from './matrix.mjs'

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

    /** @type {AtomByteReader?} */
    #atomReader

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
                let abr = this.#atomReader

                if (abr) {
                    abr = abr.child(atom.getDataSize())
                }
                else {
                    abr = new AtomByteReader(reader, atom.getDataSize())
                }

                atom = await parse(abr, atom, this)

                if (abr.bytesRemaining() != 0) {
                    throw new Error(abr.bytesRemaining() + ' bytes unread')
                }

                abr = abr.parentReader()
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

export class AtomByteReader {
    /** @type {ByteReader} */
    #byteReader

    /** @type {number|bigint} */
    #bytesRemaining

    /** @type {AtomByteReader?} */
    #parentReader

    /**
     * @param {ByteReader} reader
     * @param {number|bigint} size
     */
    constructor(reader, size) {
        this.#byteReader = reader
        this.#bytesRemaining = size
    }

    bytesRemaining() {
        return this.#bytesRemaining
    }

    parentReader() {
        return this.#parentReader
    }

    /**
     * @param {number|bigint} size
     */
    child(size) {
        this.#validateSize(size)

        if (!this.bytesAvailable(size)) {
            throw new RangeError(`attempting to read ${size} bytes but only ${this.#bytesRemaining} bytes available`)
        }

        const reader = new AtomByteReader(this.#byteReader, size)
        reader.#parentReader = this

        return reader
    }

    /**
     * Attempt to read n bytes and return it.
     *
     * @param {number} n
     *
     * @returns {Promise<Uint8Array<ArrayBuffer>>}
     */
    async read(n) {
        this.#validateSize(n)

        if (!this.bytesAvailable(n)) {
            throw new RangeError(`attempting to read ${n} bytes but only ${this.#bytesRemaining} bytes available`)
        }

        const buf = await this.#byteReader.readBytes(n)
        this.updateBytesRemaining(buf.byteLength)

        return buf
    }

    async readBytes(n) {
        return this.read(n)
    }

    /**
     * @param {number|bigint} n
     */
    async skipBytes(n) {
        await this.read(n)
    }

    async readInt8() {
        const arr = await this.readBytes(1)
        return new DataView(arr.buffer).getInt8()
    }

    async readInt16() {
        const arr = await this.readBytes(2)
        return new DataView(arr.buffer).getInt16()
    }

    async readInt32() {
        const arr = await this.readBytes(4)
        return new DataView(arr.buffer).getInt32()
    }

    async readBigInt64() {
        const arr = await this.readBytes(8)
        return new DataView(arr.buffer).getBigInt64()
    }

    async readUint8() {
        const arr = await this.readBytes(1)
        return new DataView(arr.buffer).getUint8()
    }

    async readUint16() {
        const arr = await this.readBytes(2)
        return new DataView(arr.buffer).getUint16()
    }

    async readUint32() {
        const arr = await this.readBytes(4)
        return new DataView(arr.buffer).getUint32()
    }

    async readBigUint64() {
        const arr = await this.readBytes(8)
        return new DataView(arr.buffer).getBigUint64()
    }

    async readFloat32() {
        const arr = await this.readBytes(4)
        return new DataView(arr.buffer).getFloat32()
    }

    async readFloat64() {
        const arr = await this.readBytes(8)
        return new DataView(arr.buffer).getFloat64()
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
                bufs.push(await this.read(maxUint32))
                bytesRemaining -= maxUint32BigInt
            }
            else {
                bufs.push(await this.read(Number(bytesRemaining)))
                bytesRemaining = 0n
            }
        }

        return new Blob(bufs)
    }

    async readMacintoshDate() {
        const arr = await this.read(4)
        return MacintoshDate.from(arr)
    }

    async readMatrix() {
        const arr = await this.read(36)
        return new Matrix(arr)
    }

    /**
     * @param {number|bigint} n
     */
    updateBytesRemaining(n) {
        if (typeof this.#bytesRemaining == 'bigint') {
            this.#bytesRemaining -= BigInt(n)
        }
        else if (typeof n == 'bigint') {
            this.#bytesRemaining -= Number(n)
        }
        else {
            this.#bytesRemaining -= n
        }

        if (this.#parentReader) {
            this.#parentReader.updateBytesRemaining(buf.byteLength)
        }
    }

    /**
     * @param {number|bigint} n
     */
    #validateSize(n) {
        if (typeof n != 'number') {
            throw new Error('n must be a number')
        }

        if (isNaN(n)) {
            throw new Error('n must not be NaN')
        }

        if (n < 0) {
            throw new RangeError('n must be a non-negative integer')
        }

        if (n >= 0x80_000_000) {
            throw new RangeError('n must be less than ' + 0x80_000_000.toString(10))
        }
    }

    /**
     * @param {number|bigint} n
     */
    bytesAvailable(n) {
        if (typeof this.#bytesRemaining == 'bigint') {
            return this.#bytesRemaining >= BigInt(n)
        }
        else if (typeof n == 'bigint') {
            return this.#bytesRemaining >= Number(n)
        }

        return this.#bytesRemaining >= n
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
