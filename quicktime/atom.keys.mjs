import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * The metadata item keys atom holds a list of the metadata keys that may
 * be present in the metadata atom. This list is indexed starting with 1;
 * 0 is a reserved index value. The metadata item keys atom is a full
 * atom with an atom type of ‘keys’.
 *
 * Note that:
 *
 * * Indexes into the metadata item keys atom are 1-based.
 * * Zero (0) is reserved and never used as an index.
 * * The structure of key_value depends upon the key namespace.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/metadata_item_keys_atom}
 */
export default class KeysAtom extends FullAtom {
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

export class Key {
    /**
     * @type {string}
     */
    namespace

    /**
     * @type {string}
     */
    value
}

/**
 * Parses an keys atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function keysAtomParser(reader, atomTemplate, scanner) {
    const atom = new KeysAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()
    const entries = await reader.readUint32()

    let bytesRemaining = atom.getDataSize() - 4

    for (let i = 0; i < entries && bytesRemaining > 0; i++) {
        const key = new Key()

        const keySize = await reader.readUint32()
        key.namespace = await reader.readUtf8String(4)
        key.value = await reader.readUtf8String(keySize - 8)

        atom.keys.push(key)

        bytesRemaining -= keySize
    }

    return atom
}
