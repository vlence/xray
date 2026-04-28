import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * The clipping region atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/clipping_region_atom}
 */
export default class CrgnAtom extends Atom {
    /**
     * Region size part of a QuickDraw region.
     *
     * 2-byte unsigned integer.
     *
     * @type {number}
     */
    regionSize

    /**
     * Region boundary box part of a QuickDraw region.
     *
     * 8-byte unsigned integer.
     *
     * @type {bigint}
     */
    regionBoundaryBox

    /**
     * Region data part of a QuickDraw region.
     *
     * @type {Uint8Array<ArrayBuffer>}
     */
    regionData
}

/**
 * Parses an crgn atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function crgnAtomParser(reader, atomTemplate, scanner) {
    const atom = new CrgnAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.extendedSize = atomTemplate.extendedSize

    atom.regionSize = await reader.readUint16()
    atom.regionBoundaryBox = await reader.readBigUint64()
    atom.regionData = await reader.read(reader.bytesRemaining())

    return atom
}
