/**
 * A QuickTime atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/atoms}
 */
export default class Atom {
    /** @type {number|bigint} The size of this atom */
    size

    /** @type {string} The type of this atom */
    type

    /**
     * @param {string} type
     * @param {number|bigint} size
     */
    constructor(type, size) {
        this.type = type
        this.size = size
    }

    parse() {}
}

export class FtypAtom extends Atom {
    /** @type {string} */
    majorBrand

    /** @type {string?} */
    minorBrand

    /** @type {string[]|null} */
    compatibleBrands
    
    constructor(size) {
        super('ftyp', size)
    }

    parse() {}
}
