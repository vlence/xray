import ByteReader from '../utils/bytereader.mjs'
import * as textDecoders from '../utils/textdecoder.mjs'
import AtomScanner from './atom.scanner.mjs'
import Atom from './atom.mjs'

const log = console

/**
 * The moov atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/movie_atom}
 */
export default class MoovAtom extends Atom {
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

    if (bytesRemaining > 0) {
        return atom
    }

    for await (const nextAtom of scanner) {
        bytesRemaining -= nextAtom.size

        if (bytesRemaining < 0) {
            throw new RangeError('moov: read more than ' + atom.getDataSize() + ' bytes')
        }

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
