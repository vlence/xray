/**
 * Reader to read a stream in bytes.
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
     * @param {number} len The number of bytes to skip.
     */
    async skipBytes(len) {
        if (typeof len != 'number' || isNaN(len) || len <= 0) {
            return
        }

        if (this.#done) {
            return
        }

        if (!this.#reader) {
            throw new TypeError('reader is undefined')
        }

        while (len > 0 && !this.#done) {
            if (len < this.#chunk.byteLength) {
                this.#chunk = this.#chunk.slice(len)
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
}
