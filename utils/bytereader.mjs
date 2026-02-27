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
     * Read len bytes and return them.
     *
     * @param {number} len The number of bytes to read
     *
     * @returns {Promise<Uint8Array<ArrayBuffer>>}
     */
    async readBytes(len) {
        if (typeof len != 'number' || isNaN(len) || len <= 0) {
            return new Uint8Array(0)
        }

        if (!this.#reader) {
            throw new TypeError('reader is undefined')
        }

        if (this.#done) {
            throw new Error('EOF')
        }

        // We may provision more bytes than we read
        // so we need to keep a track of the number
        // of bytes actually read so that we can
        // later trim out the excess bytes.
        // 
        // For example you may want to read 8 bytes
        // but there's only 3 bytes left. Since we
        // first create an array buffer of 8 bytes
        // we will return all of those 8 bytes. By
        // keeping track of how many bytes were
        // actually read we can return only the 3
        // bytes.
        let bytesRead = 0

        let idx = 0
        const view = new Uint8Array(new ArrayBuffer(len))

        while (len > 0 && !this.#done) {
            if (len < this.#chunk.byteLength) {
                view.set(this.#chunk.subarray(0, len), idx)
                this.#chunk = this.#chunk.subarray(len)
                bytesRead += len
                len = 0
            }
            else if (len == this.#chunk.byteLength) {
                view.set(this.#chunk, idx)

                const {done, value: chunk} = await this.#reader.read()
                this.#done = done
                this.#chunk = chunk
                bytesRead += len

                len = 0
            }
            else {
                view.set(this.#chunk, idx)
                len -= this.#chunk.byteLength
                idx += this.#chunk.byteLength
                bytesRead += this.#chunk.byteLength

                const {done, value: chunk} = await this.#reader.read()
                this.#done = done
                this.#chunk = chunk
            }
        }

        return view.subarray(0, bytesRead)
    }

    /**
     * Read len bytes and discard them.
     *
     * @param {number|bigint} len The number of bytes to skip.
     */
    async skipBytes(len) {
        const isNumber = typeof len == 'number'
        const isBigInt = typeof len == 'bigint'
        const negative = isNumber && len <= 0 || isBigInt && len <= 0n

        if (isNaN(len) || negative) {
            return
        }

        if (this.#done) {
            return
        }

        if (!this.#reader) {
            throw new TypeError('reader is undefined')
        }

        if (typeof len == 'number') {
            await this.#skipBytesNumber(len)
        }
        else {
            await this.#skipBytesBigInt(len)
        }
    }

    /**
     * Implementation of skipBytes where len is a number.
     *
     * @param {number} len
     */
    async #skipBytesNumber(len) {
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
    async #skipBytesBigInt(len) {
        const maxUint32 = 0xffffffff
        const maxUint32BigInt = BigInt(maxUint32)

        while (len > 0n && !this.#done) {
            if (len > maxUint32BigInt) {
                this.#skipBytesNumber(maxUint32)
                len -= maxUint32BigInt
            }
            else if (len == maxUint32BigInt) {
                this.#skipBytesNumber(maxUint32)
                len = 0n
            }
            else {
                this.#skipBytesNumber(Number(len))
                len = 0n
            }
        }
    }
}
