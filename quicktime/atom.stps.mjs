import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Since such samples are not full sync samples, don’t list them in the
 * sync sample atom.
 *
 * The type of the partial sync sample atom is ‘stps’.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/partial_sync_sample_atom}
 */
export default class StpsAtom extends Atom {
}

/**
 * Parses an stps atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function stpsAtomParser(reader, atomTemplate, scanner) {
    const atom = new StpsAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    return atom
}

