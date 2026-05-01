import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import Atom from './atom.mjs'
import MvhdAtom from './atom.mvhd.mjs'
import TrakAtom from './atom.trak.mjs'
import ClipAtom from './atom.clip.mjs'

const log = console

/**
 * The moov atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/movie_atom}
 */
export default class MoovAtom extends Atom {
    /** @type {MvhdAtom} */
    mvhd

    /** @type {ClipAtom} */
    clip

    /** @type {TrakAtom[]} */
    traks = []
}

/**
 * Parses a moov atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function moovAtomParser(reader, atomTemplate, scanner) {
    const atom = new MoovAtom()

    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    let bytesRemaining = atom.getDataSize()

    for await (const nextAtom of scanner) {
        bytesRemaining -= nextAtom.getSize()

        atom.children.push(nextAtom)

        if (nextAtom instanceof MvhdAtom) {
            atom.mvhd = nextAtom
        }
        else if (nextAtom instanceof TrakAtom) {
            atom.traks.push(nextAtom)
        }
        else if (nextAtom instanceof ClipAtom) {
            atom.clip = nextAtom
        }

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
