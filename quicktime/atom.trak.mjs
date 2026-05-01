import ClipAtom from "./atom.clip.mjs";
import EdtsAtom from "./atom.edts.mjs";
import MattAtom from "./atom.matt.mjs";
import Atom from "./atom.mjs";
import PrflAtom from "./atom.prfl.mjs";
import AtomScanner, { AtomByteReader } from "./atom.scanner.mjs";
import TaptAtom from "./atom.tapt.mjs";
import TkhdAtom from "./atom.tkhd.mjs";
import UdtaAtom from "./atom.udta.mjs";

const log = console

/**
 * The trak atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_atom}
 */
export default class TrakAtom extends Atom {
    /** @type {PrflAtom} */
    profile

    /**
     * Specifies that characteristics of this track.
     *
     * @type {TkhdAtom}
     */
    header

    /**
     * @type {ClipAtom}
     */
    clipping

    /**
     * @type {TaptAtom}
     */
    apertureModeDimensions

    /**
     * @type {}
     */
    matte

    /**
     * @type {}
     */
    edit

    /**
     *
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
     * @type {userData}
     */
    userData
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
            atom.profile = nextAtom
        }
        else if (nextAtom instanceof TkhdAtom) {
            atom.header = nextAtom
        }
        else if (nextAtom instanceof ClipAtom) {
            atom.clipping = nextAtom
        }
        else if (nextAtom instanceof TaptAtom) {
            atom.apertureModeDimensions = nextAtom
        }
        else if (nextAtom instanceof MattAtom) {
            atom.matte = nextAtom
        }
        else if (nextAtom instanceof EdtsAtom) {
            atom.edit = nextAtom
        }
        else if (nextAtom instanceof UdtaAtom) {
            atom.userData = nextAtom
        }
        else {
            log.warn('trak: unexpected atom ' + nextAtom.type)
        }

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
