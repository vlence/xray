import { NByteReader } from '../utils/bytereader.mjs'
import * as textDecoders from '../utils/textdecoder.mjs'
import Atom from './atom.mjs'
import AtomScanner from './atom.scanner.mjs'

/**
 * The ftyp atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/file_type_compatibility_atom}
 */
export default class FtypAtom extends Atom {
    /** @type {Uint8Array<ArrayBuffer>} */
    majorBrand

    /** @type {Uint8Array<ArrayBuffer>?} */
    minorBrand

    /** @type {Uint8Array<ArrayBuffer>[]?} */
    compatibleBrands = []

    getMajorBrandString() {
        if (this.majorBrand) {
            return textDecoders.get('ascii').decode(this.majorBrand)
        }
    }

    getMinorBrandString() {
        if (this.minorBrand) {
            return textDecoders.get('ascii').decode(this.minorBrand)
        }
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
 * @param {NByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function ftypAtomParser(reader, atomTemplate, scanner) {
    const atom = new FtypAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.extendedSize = atomTemplate.extendedSize

    atom.majorBrand = await reader.readBytes(4)
    atom.minorBrand = await reader.readBytes(4)

    while (reader.bytesRemaining() > 0) {
        atom.compatibleBrands.push(await reader.readBytes(4))
    }

    return atom
}
