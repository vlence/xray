/**
 * Take the given stream and turn it into a Blob.
 *
 * @param {ReadableStream<Uint8Array<ArrayBuffer>>} stream
 *
 * @returns {Promise<Blob>}
 */
export default async function streamToBlob(stream) {
    if (!(stream instanceof ReadableStream)) {
        throw new TypeError('stream must be ReadableStream')
    }

    /** @type {Uint8Array<ArrayBuffer>[]} */
    const buffers = []
    const reader = stream.getReader()

    let done = false
    while (!done) {
        const r = await reader.read()
        done = r.done

        if (!done) {
            buffers.push(r.value)
        }
    }

    return new Blob(buffers)
}
