import ByteReader from '../utils/bytereader.mjs'
import CrgnAtom from './atom.crgn.mjs'
import Atom from './atom.mjs'
import AtomScanner from './atom.scanner.mjs'

/**
 * The clip atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/clipping_atom}
 */
export default class ClipAtom extends Atom {
    /**
     * @type {CrgnAtom}
     */
    crgn
}

/**
 * Parses a clip atom's data.
 *
 * @param {ByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function clipAtomParser(reader, atomTemplate, scanner) {
    const atom = new ClipAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.extendedSize = atomTemplate.extendedSize

    for (const nextAtom of scanner) {
        atom.children.push(nextAtom)

        if (nextAtom instanceof CrgnAtom) {
            atom.crgn = nextAtom
        }
        else {
            log.warn('clip: unexpected child atom', nextAtom)
        }
    }

    return atom
}
