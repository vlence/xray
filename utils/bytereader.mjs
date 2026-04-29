const log = console

/**
 * Reader that can read or skip bytes from 
 * a ReadableStream.
 */
export default class ByteReader {
    /** @type {boolean} */
    #done

    /** @type {Uint8Array<ArrayBuffer>} */
    #chunk

    /** @type {ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>} */
    #reader

    // The buffers for reading 1 byte, 2 bytes, 4 bytes and 8 bytes.
    // You might be tempted to use the same buffer, say of size 8,
    // for all your reading purposes but don't do it.
    #bytes1 = new Uint8Array(1)
    #bytes2 = new Uint8Array(2)
    #bytes4 = new Uint8Array(4)
    #bytes8 = new Uint8Array(8)

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>} stream
     */
    constructor(stream) {
        this.#reader = stream.getReader()
        this.#done = false
        this.#chunk = new Uint8Array(0)
    }

    /**
     * Returns true if this reader has
     * finished reading everything.
     * 
     * @returns {boolean}
     */
    done() {
        return this.#done
    }

    /**
     * Reads up to `buf.byteLength` bytes into `buf` and
     * returns the number of bytes read.
     *
     * @param {Uint8Array<ArrayBuffer>} buf
     *
     * @returns {Promise<number>}
     */
    async read(buf) {
        if (!(buf instanceof Uint8Array)) {
            throw new TypeError('buf must be Uint8Array')
        }

        if (!this.#reader) {
            throw new TypeError('buf is undefined')
        }

        if (this.#done) {
            throw new Error('EOF')
        }

        if (!buf) {
            return 0
        }

        if (buf.byteLength == 0) {
            return 0
        }

        // We may provision more bytes than we read
        // so we need to keep a track of the number
        // of bytes actually read so that we can
        // later trim out the excess bytes.
        // 
        // For example you may want to read 8 bytes
        // but there's only 3 bytes left. By
        // keeping track of how many bytes were
        // actually read we can return only the 3
        // bytes.
        let bytesRead = 0

        let idx = 0
        let n = buf.byteLength

        while (n > 0 && !this.#done) {
            if (n < this.#chunk.byteLength) {
                buf.set(this.#chunk.subarray(0, n), idx)
                bytesRead += n

                this.#chunk = this.#chunk.subarray(n)

                n = 0
            }
            else if (n == this.#chunk.byteLength) {
                buf.set(this.#chunk, idx)
                bytesRead += n

                const {done, value: chunk} = await this.#reader.read()
                this.#done = done
                this.#chunk = chunk

                n = 0
            }
            else {
                buf.set(this.#chunk, idx)
                n -= this.#chunk.byteLength
                idx += this.#chunk.byteLength
                bytesRead += this.#chunk.byteLength

                const {done, value: chunk} = await this.#reader.read()
                this.#done = done
                this.#chunk = chunk
            }
        }

        return bytesRead
    }

    async readInt8() {
        const dataview = new DataView(this.#bytes1.buffer)

        const n = await this.read(this.#bytes1)

        if (n != 1) {
            throw new Error('read ' + n + ' bytes instead of 1')
        }

        return dataview.getInt8()
    }

    async readInt16() {
        const dataview = new DataView(this.#bytes2.buffer)

        const n = await this.read(this.#bytes2)

        if (n != 2) {
            throw new Error('read ' + n + ' bytes instead of 2')
        }

        return dataview.getInt16()
    }

    async readInt32() {
        const dataview = new DataView(this.#bytes4.buffer)

        const n = await this.read(this.#bytes4)

        if (n != 4) {
            throw new Error('read ' + n + ' bytes instead of 4')
        }

        return dataview.getInt32()
    }

    async readBigInt64() {
        const dataview = new DataView(this.#bytes8.buffer)

        const n = await this.read(this.#bytes8)

        if (n != 8) {
            throw new Error('read ' + n + ' bytes instead of 8')
        }

        return dataview.getBigInt64()
    }

    async readUint8() {
        const dataview = new DataView(this.#bytes1.buffer)

        const n = await this.read(this.#bytes1)

        if (n != 1) {
            throw new Error('read ' + n + ' bytes instead of 1')
        }

        return dataview.getUint8()
    }

    async readUint16() {
        const dataview = new DataView(this.#bytes2.buffer)

        const n = await this.read(this.#bytes2)

        if (n != 2) {
            throw new Error('read ' + n + ' bytes instead of 2')
        }

        return dataview.getUint16()
    }

    async readUint32() {
        const dataview = new DataView(this.#bytes4.buffer)

        const n = await this.read(this.#bytes4)

        if (n != 4) {
            throw new Error('read ' + n + ' bytes instead of 4')
        }

        return dataview.getUint32()
    }

    async readBigUint64() {
        const dataview = new DataView(this.#bytes8.buffer)

        const n = await this.read(this.#bytes8)

        if (n != 8) {
            throw new Error('read ' + n + ' bytes instead of 8')
        }

        return dataview.getBigUint64()
    }

    async readFloat32() {
        const dataview = new DataView(this.#bytes4.buffer)

        const n = await this.read(this.#bytes4)

        if (n != 4) {
            throw new Error('read ' + n + ' bytes instead of 4')
        }

        return dataview.getFloat32()
    }

    async readFloat64() {
        const dataview = new DataView(this.#bytes8.buffer)

        const n = await this.read(this.#bytes8)

        if (n != 8) {
            throw new Error('read ' + n + ' bytes instead of 8')
        }

        return dataview.getFloat64()
    }

    /**
     * @param {number} ibits Number of bits used for the integer part
     */
    async readFixed16(ibits = 8) {
        if (typeof ibits != 'number') {
            throw new TypeError('ibits must be a number')
        }

        if (isNaN(ibits)) {
            throw new Error('ibits must not be NaN')
        }

        if (ibits < 0) {
            throw new Error('ibits must be non-negative')
        }

        if (ibits >= 16) {
            throw new RangeError('ibits must be less than 16')
        }

        const fbits = 16 - ibits
        const signBit = 1 << 15
        const umask = signBit - 1
        const scalingFactor = 2 ** fbits

        const i16 = await this.readUint16()
        const sign = i16 & signBit
        const u16 = i16 & umask

        let value = u16 / scalingFactor

        if (sign != 0) {
            value *= -1
        }

        return value
    }

    /**
     * @param {number} ibits Number of bits used for the integer part
     */
    async readFixed32(ibits = 16) {
        if (typeof ibits != 'number') {
            throw new TypeError('ibits must be a number')
        }

        if (isNaN(ibits)) {
            throw new Error('ibits must not be NaN')
        }

        if (ibits < 0) {
            throw new Error('ibits must be non-negative')
        }

        if (ibits >= 32) {
            throw new RangeError('ibits must be less than 16')
        }

        const fbits = 32 - ibits
        const signBit = 1 << 31
        const umask = signBit - 1
        const scalingFactor = 2 ** fbits

        const i32 = await this.readUint32()
        const sign = i32 & signBit
        const u32 = i32 & umask

        let value = u32 / scalingFactor

        if (sign != 0) {
            value *= -1
        }

        return value
    }

    /**
     * Read `n` bytes and discard them. The logic is essentially
     * the same as `read()` but internally the bytes being read
     * are not stored so we're saving on some memory allocation.
     *
     * @param {number|bigint} n The number of bytes to skip.
     */
    async skip(n) {
        const isNumber = typeof n == 'number'
        const isBigInt = typeof n == 'bigint'
        const negative = (isNumber && n <= 0) || (isBigInt && n <= 0n)

        if (isNaN(n) || negative) {
            return
        }

        if (this.#done) {
            return
        }

        if (!this.#reader) {
            throw new TypeError('reader is undefined')
        }

        if (typeof n == 'number') {
            await this.#skipNumberN(n)
        }
        else {
            await this.#skipBigIntN(n)
        }
    }

    /**
     * Implementation of skipBytes where len is a number.
     *
     * @param {number} len
     */
    async #skipNumberN(len) {
        while (len > 0 && !this.#done) {
            if (len < this.#chunk.byteLength) {
                this.#chunk = this.#chunk.subarray(len)
                len = 0
            }
            else if (len == this.#chunk.byteLength) {
                const {done, value: chunk} = await this.#reader.read()
                this.#done = done
                this.#chunk = chunk
                len = 0
            }
            else {
                len -= this.#chunk.byteLength

                const {done, value: chunk} = await this.#reader.read()
                this.#done = done
                this.#chunk = chunk
            }
        }
    }

    /**
     * Implementation of skipBytes where len is a bigint.
     *
     * @param {bigint} len
     */
    async #skipBigIntN(len) {
        const maxUint32 = 0xffffffff
        const maxUint32BigInt = BigInt(maxUint32)

        while (len > 0n && !this.#done) {
            if (len > maxUint32BigInt) {
                this.#skipNumberN(maxUint32)
                len -= maxUint32BigInt
            }
            else if (len == maxUint32BigInt) {
                this.#skipNumberN(maxUint32)
                len = 0n
            }
            else {
                this.#skipNumberN(Number(len))
                len = 0n
            }
        }
    }
}
