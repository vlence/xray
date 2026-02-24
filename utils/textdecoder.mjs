/** @type {{[label: string]: TextDecoder}} */
const decoders = {}

/**
 * Returns a text decoder for the given encoding.
 *
 * The decoders are reused.
 *
 * @param {string} label The character encoding to use while decoding.
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/TextDecoder}
 *
 * @returns {TextDecoder}
 */
export function get(label) {
    let decoder = decoders[label]

    if (!decoder) {
        decoder = new TextDecoder(label)
        decoders[label] = decoder
    }

    return decoder
}

