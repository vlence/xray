import * as textDecoders from '../utils/textdecoder.mjs'

/**
 * A QuickTime atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/atoms}
 */
export default class Atom {
    /**
     * The size of this atom in bytes. Includes the
     * bytes used for the size and type fields. To
     * get size of data call getDataSize().
     *
     * If size is 1 see extendedSize for the size.
     */
    size = 0

    /**
     * The type of this atom. Contains the bytes that
     * make up the type field of the atom.
     *
     * To read get the type as a string call getTypeString().
     *
     * @type {Uint8Array<ArrayBuffer>}
     */
    type

    /**
     * The extended size of this atom. Set only when
     * size == 1.
     *
     * @type {bigint?}
     */
    extendedSize

    /**
     * This atom's parent atom.
     *
     * @type {Atom?}
     */
    parent = null

    /** 
     * This atom's children.
     *
     * @type {Atom[]}
     */
    children = []

    /**
     * Returns the type of this atom as an ascii
     * string. Note that not all atoms have a type
     * that can be decoded as an ascii string.
     */
    getTypeString() {
        return textDecoders.get('ascii').decode(this.type)
    }

    /**
     * Returns true if this atom uses extended size.
     */
    usesExtendedSize() {
        return this.size == 1
    }

    /**
     * Returns the number of bytes used
     * for this atom's data. If this atom
     * uses extended size then a bigint is
     * returned instead of a number.
     *
     * @returns {bigint|number}
     */
    getDataSize() {
        if (this.usesExtendedSize()) {
            return this.extendedSize - 16n
        }

        if (this.size == 0) {
            return 0
        }

        return this.size - 8
    }
}
