import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import Atom from './atom.mjs'
import MvhdAtom from './atom.mvhd.mjs'
import TrakAtom from './atom.trak.mjs'
import ClipAtom from './atom.clip.mjs'
import UdtaAtom from './atom.udta.mjs'

const log = console

/**
 * Defines a movie.
 *
 * You use movie atoms to specify the information that defines a movie —
 * that is, the information that allows your application to interpret the
 * sample data that is stored elsewhere. The movie atom usually contains
 * a movie header atom, which defines the time scale and duration
 * information for the entire movie, as well as its display
 * characteristics. Existing movies may contain a movie profile atom,
 * which summarizes the main features of the movie, such as the necessary
 * codecs and maximum bit rate. In addition, the movie atom contains a
 * track atom for each track in the movie.
 *
 * The movie atom has an atom type of 'moov'. It contains other types of
 * atoms, including at least one of three possible atoms—the movie header
 * atom ('mvhd'), the compressed movie atom ('cmov'), or a reference
 * movie atom ('rmra'). An uncompressed movie atom can contain both a
 * movie header atom and a reference movie atom, but it must contain at
 * least one of the two. It can also contain several other atoms, such as
 * a clipping atom ('clip'), one or more track atoms ('trak'), a color
 * table atom ('ctab'), and a user data atom ('udta').
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/movie_atom}
 */
export default class MoovAtom extends Atom {
    /** @type {MvhdAtom} */
    header

    /** @type {ClipAtom} */
    clipping

    /** @type {TrakAtom[]} */
    tracks = []

    /** @type {UdtaAtom} */
    userData
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
    atom.parent = atomTemplate.parent

    let bytesRemaining = atom.getDataSize()

    for await (const nextAtom of scanner.withParent(atom)) {
        atom.children.push(nextAtom)
        bytesRemaining -= nextAtom.getSize()

        if (nextAtom instanceof MvhdAtom) {
            atom.header = nextAtom
        }
        else if (nextAtom instanceof TrakAtom) {
            atom.tracks.push(nextAtom)
        }
        else if (nextAtom instanceof ClipAtom) {
            atom.clipping = nextAtom
        }
        else if (nextAtom instanceof UdtaAtom) {
            atom.userData = nextAtom
        }
        else {
            log.warn('moov: unexpected atom ' + nextAtom.type)
        }

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
