import ClefAtom from './atom.clef.mjs'
import EnofAtom from './atom.enof.mjs'
import Atom from './atom.mjs'
import ProfAtom from './atom.prof.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * The tapt atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_aperture_mode_dimensions_atom}
 */
export default class TaptAtom extends Atom {
    /**
     * @type {ClefAtom}
     */
    clef

    /**
     * @type {ProfAtom}
     */
    prof

    /**
     * @type {EnofAtom}
     */
    enof
}

/**
 * Parses a tapt atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function taptAtomParser(reader, atomTemplate, scanner) {
    const atom = new TaptAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    let bytesRemaining = atom.getDataSize()

    for await (const nextAtom of scanner) {
        atom.children.push(nextAtom)
        nextAtom.parent = atom
        bytesRemaining -= nextAtom.getSize()

        if (nextAtom instanceof ClefAtom) {
            atom.clef = nextAtom
        }
        else if (nextAtom instanceof ProfAtom) {
            atom.prof = nextAtom
        }
        else if (nextAtom instanceof EnofAtom) {
            atom.enof = nextAtom
        }
        else {
            throw new Error(`unexpected atom ${nextAtom.getTypeString()} [${nextAtom.type.join(',')}]`)
        }

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
