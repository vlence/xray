import ClipAtom from "./atom.clip.mjs";
import MattAtom from "./atom.matt.mjs";
import Atom from "./atom.mjs";
import PrflAtom from "./atom.prfl.mjs";
import AtomScanner, { AtomByteReader } from "./atom.scanner.mjs";
import TaptAtom from "./atom.tapt.mjs";
import TkhdAtom from "./atom.tkhd.mjs";

/**
 * The trak atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_atom}
 */
export default class TrakAtom extends Atom {
    /** @type {PrflAtom} */
    prfl

    /**
     * Specifies that characteristics of this track.
     *
     * @type {TkhdAtom}
     */
    tkhd

    /**
     * @type {ClipAtom}
     */
    clip

    /**
     * @type {TaptAtom}
     */
    tapt

    /**
     * @type {}
     */
    matt

    /**
     * @type {}
     */
    edts

    /**
     * @type {}
     */
    tref

    /**
     * @type {}
     */
    txas

    /**
     * @type {}
     */
    load

    /**
     * @type {}
     */
    imap

    /**
     * @type {}
     */
    mdia

    /**
     * @type {}
     */
    udta
}

/**
 * Parses a trak atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function trakAtomParser(reader, atomTemplate, scanner) {
    const atom = new TrakAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    let bytesRemaining = atom.getDataSize()

    for await (const nextAtom of scanner) {
        atom.children.push(nextAtom)
        bytesRemaining -= nextAtom.getSize()

        if (nextAtom instanceof PrflAtom) {
            atom.prfl = nextAtom
        }
        else if (nextAtom instanceof TkhdAtom) {
            atom.tkhd = nextAtom
        }
        else if (nextAtom instanceof ClipAtom) {
            atom.clip = nextAtom
        }
        else if (nextAtom instanceof TaptAtom) {
            atom.tapt = nextAtom
        }
        else if (nextAtom instanceof MattAtom) {
            atom.matt = nextAtom
        }
        else {}

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
