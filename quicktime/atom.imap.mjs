import Atom from './atom.mjs'
import QTAtom from './atom.qt.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

const vide = new DataView(new TextEncoder().encode('vide').buffer).getInt32()

const log = console

/**
 * This atom contains one or more track input atoms. Note that the track
 * input map atom is a QT atom structure.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_input_map_atom}
 */
export default class ImapAtom extends Atom {
}

/**
 * Parses an imap atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function imapAtomParser(reader, atomTemplate, scanner) {
    const atom = new ImapAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    let bytesRemaining = atom.getDataSize()

    for await (const nextAtom of scanner.withParent(atom)) {
        atom.children.push(nextAtom)
        bytesRemaining -= nextAtom.getSize()

        if (!(nextAtom instanceof TrackInputAtom)) {
            log.warn('imap: unexpected child atom ' + nextAtom.type)
        }

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}

/**
 * Specifies how to use the input data.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_input_atom}
 */
export class TrackInputAtom extends QTAtom {
    /**
     * Specifies how to interpret track input data.
     *
     * @type {InputTypeAtom}
     */
    inputType

    /**
     * Identifies an object, such as a sprite within a sprite track, in a
     * track input atom.
     *
     * @type {ObjectIDAtom}
     */
    objectID
}

/**
 * Parses a track input atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function trackInputAtomParser(reader, atomTemplate, scanner) {
    const atom = new TrackInputAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.id = await reader.readInt32()
    await reader.skip(2)
    atom.childCount = await reader.readInt16()
    await reader.skip(4)

    let bytesRemaining = atom.getDataSize()

    for await (const nextAtom of scanner) {
        atom.children.push(nextAtom)
        bytesRemaining -= nextAtom.size()

        if (nextAtom instanceof InputTypeAtom) {
            atom.inputType = nextAtom
        }
        else if (nextAtom instanceof ObjectIDAtom) {
            atom.objectID = nextAtom
        }
        else {
            log.warn(' in: unexpected child atom ' + nextAtom.type)
        }

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}

export class InputTypeAtom extends Atom {
    /**
     * Specifies the type of data that is to be received from the
     * secondary data source.
     *
     * @type {number}
     */
    inputType

    /**
     * A 3 × 3 transformation matrix to transform the track’s location,
     * scaling, and so on.
     */
    isTrackModifierTypeMatrix() {
        return this.inputType == 1
    }

    /**
     * A QuickDraw clipping region to change the track’s shape.
     */
    isTrackModifierTypeClip() {
        return this.inputType == 2
    }

    /**
     * An 8.8 fixed-point value indicating the relative sound volume.
     * This is used for fading the volume.
     */
    isTrackModifierTypeVolume() {
        return this.inputType == 3
    }

    /**
     * A 16-bit integer indicating the sound balance level. This is used
     * for panning the sound location.
     */
    isTrackModifierTypeBalance() {
        return this.inputType == 4
    }

    /**
     * A graphics mode record (32-bit integer indicating graphics mode,
     * followed by an RGB color) to modify the track’s graphics mode for
     * visual fades.
     */
    isTrackModifierTypeGraphicsMode() {
        return this.inputType == 5
    }

    /**
     * A 3 × 3 transformation matrix to transform an object within the
     * track’s location, scaling, and so on.
     */
    isTrackModifierObjectMatrix() {
        return this.inputType == 6
    }

    /**
     * A graphics mode record (32-bit integer indicating graphics mode,
     * followed by an RGB color) to modify an object within the track’s
     * graphics mode for visual fades.
     */
    isTrackModifierObjectGraphicsMode() {
        return this.inputType == 7
    }

    /**
     * Compressed image data for an object within the track.
     */
    isTrackModifierTypeImage() {
        return this.inputType == vide
    }
}

/**
 * Parses an input type atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function inputTypeAtomParser(reader, atomTemplate, scanner) {
    const atom = new InputTypeAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.inputType = await reader.readInt32()

    return atom
}

export class ObjectIDAtom extends Atom {
    /**
     * ID of the object
     *
     * @type {number}
     */
    id
}

/**
 * Parses an input type atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function objectIDAtomParser(reader, atomTemplate, scanner) {
    const atom = new InputTypeAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.id = await reader.readInt32()

    return atom
}
