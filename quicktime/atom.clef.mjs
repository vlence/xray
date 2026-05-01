import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * The clef atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_clean_aperture_dimensions_atom}
 */
export default class ClefAtom extends Atom {
    /**
     * @type {number}
     */
    version

    /**
     */
    flags = new Uint8Array(3)

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

    atom.version = await reader.readUint8()
    await reader.read(atom.flags) // TODO
    atom.width = await reader.readFixed32()
    atom.height = await reader.readFixed32()

    return atom
}
