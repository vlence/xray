import ClipAtom from "./atom.clip.mjs";
import EdtsAtom from "./atom.edts.mjs";
import LoadAtom from "./atom.load.mjs";
import MattAtom from "./atom.matt.mjs";
import MdiaAtom from "./atom.mdia.mjs";
import Atom from "./atom.mjs";
import PrflAtom from "./atom.prfl.mjs";
import AtomScanner, { AtomByteReader } from "./atom.scanner.mjs";
import TaptAtom from "./atom.tapt.mjs";
import TkhdAtom from "./atom.tkhd.mjs";
import TrefAtom from "./atom.tref.mjs";
import TxasAtom from "./atom.txas.mjs";
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
     * @type {MattAtom}
     */
    matte

    /**
     * @type {EdtsAtom}
     */
    edit

    /**
     * Relationships between this track and other tracks.
     *
     * @type {TrefAtom}
     */
    relationships

    /**
     * If this atom is present then this track should be excluded from
     * automatic selection.
     *
     * @type {TxasAtom?}
     */
    excludeFromAutomaticSelection

    /**
     * Settings that define how this track should be preloaded
     * and played.
     *
     * @type {LoadAtom}
     */
    loadSettings

    /**
     * Defines how data being sent to this track from its nonprimary
     * sources is to be interpreted.
     *
     * @type {}
     */
    inputMap

    /**
     * Describes and defines this track’s media type and sample data.
     *
     * @type {}
     */
    media

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
        else if (nextAtom instanceof TrefAtom) {
            atom.relationships = nextAtom
        }
        else if (nextAtom instanceof TxasAtom) {
            atom.excludeFromAutomaticSelection = nextAtom
        }
        else if (nextAtom instanceof LoadAtom) {
            atom.loadSettings = nextAtom
        }
        else if (nextAtom instanceof MdiaAtom) {
            atom.media = nextAtom
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
