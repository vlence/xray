import ByteReader from '../utils/bytereader.mjs'
import AtomScanner from './atom.scanner.mjs'
import Atom from './atom.mjs'
import MvhdAtom from './atom.mvhd.mjs'
import TrakAtom from './atom.trak.mjs'

const log = console

/**
 * The moov atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/movie_atom}
 */
export default class MoovAtom extends Atom {
    /** @type {MvhdAtom} */
    mvhd

    /** @type {TrakAtom[]} */
    traks = []
}

/**
 * Parses a moov atom's data.
 *
 * @param {ByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function moovAtomParser(reader, atomTemplate, scanner) {
    const atom = new MoovAtom()

    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.extendedSize = atomTemplate.extendedSize

    let bytesRemaining = atom.size - 8

    if (bytesRemaining == 0) {
        return atom
    }

    for await (const nextAtom of scanner) {
        bytesRemaining -= nextAtom.size

        atom.children.push(nextAtom)

        if (nextAtom instanceof MvhdAtom) {
            atom.mvhd = nextAtom
        }
        else if (nextAtom instanceof TrakAtom) {
            atom.traks.push(nextAtom)
        }

        if (bytesRemaining < 0) {
            throw new RangeError(`moov: read more than ${atom.getDataSize()} bytes`)
        }

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
