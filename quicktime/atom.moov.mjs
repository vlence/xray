import ByteReader from '../utils/bytereader.mjs'
import * as textDecoders from '../utils/textdecoder.mjs'
import AtomScanner from './atom.scanner.mjs'
import Atom from './atom.mjs'

const log = console

/**
 * The moov atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/file_type_compatibility_atom}
 */
export default class MoovAtom extends Atom {
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
 * Parses an ftyp atom using the given byte reader.
 *
 * @param {ByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function MoovAtomParser(reader, atomTemplate, scanner) {
    const atom = new MoovAtom()

    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.extendedSize = atomTemplate.extendedSize

    let bytesRemaining = atom.size - 8

    if (bytesRemaining > 0) {
        return atom
    }

    for await (const nextAtom of scanner) {
        bytesRemaining -= nextAtom.size

        if (bytesRemaining < 0) {
            throw new RangeError('moov: read more than ' + atom.getDataSize() + ' bytes')
        }

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
