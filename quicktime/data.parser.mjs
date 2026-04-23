import ByteReader from '../utils/bytereader.mjs'
import Atom from './atom.mjs'
import AtomScanner from './atom.scanner.mjs'

export default class AtomDataParser {
    bytesRemaining

    reader

    scanner

    /**
     * Parses a clip atom's data.
     *
     * @param {ByteReader} reader
     * @param {Atom} atom
     * @param {AtomScanner} scanner
     */
    constructor(reader, atom, scanner) {
        this.bytesRemaining = atom.getDataSize()
    }
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
