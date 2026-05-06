import { Key } from "../quicktime/atom.keys.mjs";
import Atom from "../quicktime/atom.mjs";
import AtomScanner, { AtomByteReader } from "../quicktime/atom.scanner.mjs";

export default class KeysBox extends Atom {
    /**
     * @type {Key[]}
     */
    keys = []

    /**
     * Returns the key at index `i`. The index is 1-based.
     *
     * @param {number} i 1-based index of the key.
     *
     * @returns {Key?}
     */
    keyAt(i) {
        if (typeof i != 'number') {
            return
        }

        if (isNaN(i)) {
            return
        }

        i = i-1

        if (i < 0) {
            return
        }

        if (i >= this.keys.length) {
            return
        }

        return this.keys[i]
    }
}

/**
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner 
 */
export async function keysBoxParser(reader, atomTemplate, scanner) {
    const box = new KeysBox()
    box.type = atomTemplate.type
    box.size = atomTemplate.size
    box.typeBytes = atomTemplate.typeBytes
    box.extendedSize = atomTemplate.extendedSize

    const entries = await reader.readUint32()

    let bytesRemaining = box.getDataSize() - 4

    for (let i = 0; i < entries && bytesRemaining > 0; i++) {
        const key = new Key()

        const keySize = await reader.readUint32()
        key.namespace = await reader.readUtf8String(4)
        key.value = await reader.readUtf8String(keySize - 8)

        box.keys.push(key)

        bytesRemaining -= keySize
    }

    return box
}
