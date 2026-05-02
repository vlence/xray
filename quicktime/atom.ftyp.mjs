import * as textDecoders from '../utils/textdecoder.mjs'
import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * The ftyp atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/file_type_compatibility_atom}
 */
export default class FtypAtom extends Atom {
    /** @type {string} */
    majorBrand

    /** @type {string} */
    minorBrand

    /** @type {string[]} */
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

    atom.majorBrand = await reader.readUtf8String(4)
    atom.minorBrand = await reader.readUtf8String(4)

    let bytesRemaining = atom.getDataSize() - 8

    while (bytesRemaining > 0) {
        atom.compatibleBrands.push(await reader.readUtf8String(4))
        bytesRemaining -= 4
    }

    return atom
}
