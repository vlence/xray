import * as textDecoders from '../utils/textdecoder.mjs'
import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

const months = [
    undefined,
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]

const brandStringBuffer = new DataView(new ArrayBuffer(4))

/**
 * @param {number} brand
 */
export function brandString(brand) {
    brandStringBuffer.setUint32(0, brand)
    
    const ascii = textDecoders.get('ascii').decode(brandStringBuffer)
    const hex = '0x' + brand.toString(16).padStart(8, '0')

    return `${ascii} [${hex}]`
}

/**
 * The ftyp atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/file_type_compatibility_atom}
 */
export default class FtypAtom extends Atom {
    /** @type {number} */
    majorBrand

    /** @type {number} */
    minorVersion

    /** @type {number[]} */
    compatibleBrands = []

    getMajorBrandString() {
        return brandString(this.majorBrand)
    }

    getMinorVersionString() {
        const year = (this.minorVersion & 0xFFFF0000) >> 16
        const month = (this.minorVersion & 0xFF00) >> 8
        return `${months[month]} ${year.toString(16)} [0x${this.minorVersion.toString(16).padStart(8, '0')}]`
    }

    getCompatibleBrandsString() {
        return this.compatibleBrands.filter(brand => brand != 0)
            .map(brandString)
            .join(', ')
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

    atom.majorBrand = await reader.readUint32()
    atom.minorVersion = await reader.readUint32()

    let bytesRemaining = atom.getDataSize() - 4 - 4

    while (bytesRemaining > 0) {
        atom.compatibleBrands.push(await reader.readUint32())
        bytesRemaining -= 4
    }

    return atom
}
