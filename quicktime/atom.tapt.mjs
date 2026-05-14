import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * The tapt atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_aperture_mode_dimensions_atom}
 */
export default class TaptAtom extends Atom {
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
    atom.parent = atomTemplate.parent

    let bytesRemaining = atom.getDataSize()

    for await (const nextAtom of scanner.withParent(atom)) {
        atom.children.push(nextAtom)
        bytesRemaining -= nextAtom.getSize()

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
