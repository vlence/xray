import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * The clef atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_clean_aperture_dimensions_atom}
 */
export default class ClefAtom extends FullAtom {

    /**
     * @type {number}
     */
    width

    /**
     * @type {number}
     */
    height
}

/**
 * Parses a clef atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function clefAtomParser(reader, atomTemplate, scanner) {
    const atom = new ClefAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()
    atom.width = await reader.readFixed32()
    atom.height = await reader.readFixed32()

    return atom
}
