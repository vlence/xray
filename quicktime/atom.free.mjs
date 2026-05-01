import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Designates unused space in the movie data file. Your app can safely
 * skip over these bytes or repurpose them.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/free_space_atom}
 */
export default class FreeAtom extends Atom {
}

/**
 * Parses an free atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function freeAtomParser(reader, atomTemplate, scanner) {
    const atom = new FreeAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    await reader.skip(atom.getDataSize())

    return atom
}
