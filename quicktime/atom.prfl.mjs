import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * The prfl atom. This atom is deprecated.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/movie_profile_atom}
 *
 * @deprecated
 */
export default class PrflAtom extends Atom {
    /**
     * Reserved. Always set to 0.
     *
     * @type {number}
     */
    reserved = 0

    /**
     * 32-bit field defining if the feature is brand-specific or
     * universal
     *
     * @type {Uint8Array<ArrayBuffer>}
     */
    partId

    /**
     * The feature code.
     *
     * @type {number}
     */
    featureCode

    /**
     * The value related to the feature.
     *
     * @type {Uint8Array<ArrayBuffer>}
     */
    value
}

/**
 * Parses an ftyp atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function prflAtomParser(reader, atomTemplate, scanner) {
    const atom = new PrflAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    await reader.read(4) // reserved field
    atom.partId = await reader.read(4)
    atom.featureCode = await reader.readUint32()
    atom.value = await reader.read(4)

    return atom
}
