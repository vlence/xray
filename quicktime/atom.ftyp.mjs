import * as textDecoders from '../utils/textdecoder.mjs'
import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * The ftyp atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/file_type_compatibility_atom}
 */
export default class FtypAtom extends Atom {
    /** @type {Uint8Array<ArrayBuffer>} */
    majorBrand = new Uint8Array(4)

    /** @type {Uint8Array<ArrayBuffer>} */
    minorBrand = new Uint8Array(4)

    /** @type {Uint8Array<ArrayBuffer>[]?} */
    compatibleBrands = []

    getMajorBrandString() {
        return textDecoders.get('ascii').decode(this.majorBrand)
    }

    getMinorBrandString() {
        return textDecoders.get('ascii').decode(this.minorBrand)
    }

    getCompatibleBrandStrings() {
        const decoder = textDecoders.get('ascii')
        return this.compatibleBrands.map(
            bytes => decoder.decode(bytes)
        )
    }
}

/**
 * Parses an ftyp atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function ftypAtomParser(reader, atomTemplate, scanner) {
    const atom = new FtypAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    await reader.read(atom.majorBrand)
    await reader.read(atom.minorBrand)

    let bytesRemaining = atom.getDataSize() - 8

    while (bytesRemaining > 0) {
        const brand = new Uint8Array(4)
        atom.compatibleBrands.push(brand)
        await reader.read(brand)
        bytesRemaining -= 4
    }

    return atom
}
