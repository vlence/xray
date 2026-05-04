import CrgnAtom from './atom.crgn.mjs'
import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

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
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function clipAtomParser(reader, atomTemplate, scanner) {
    const atom = new ClipAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    let bytesRemaining = atom.getDataSize()

    for await (const nextAtom of scanner.withParent(atom)) {
        atom.children.push(nextAtom)
        bytesRemaining -= nextAtom.getSize()

        if (nextAtom instanceof CrgnAtom) {
            atom.crgn = nextAtom
        }
        else {
            log.warn('clip: unexpected child atom', nextAtom)
        }

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
