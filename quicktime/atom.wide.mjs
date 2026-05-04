import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Designates reserved space.
 *
 * The wide atom consists only of a type and size field. This occupies
 * 8 bytes—enough space to add an extended size field to the header of
 * the atom that follows, without displacing the contents of that atom.
 * If an atom grows to exceed 2^32 bytes in size, and it is preceded by
 * a wide atom, you may create a new atom header containing an extended
 * size field by overwriting the existing atom header and the preceding
 * wide atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/wide_atom}
 */
export default class WideAtom extends Atom {
}

/**
 * Parses an wide atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function wideAtomParser(reader, atomTemplate, scanner) {
    const atom = new WideAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    return atom
}
