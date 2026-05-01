import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import Atom from './atom.mjs'
import Matrix from './matrix.mjs'
import MacintoshDate from './date.mjs'

const log = console

/**
 * The mvhd atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/movie_header_atom}
 */
export default class MvhdAtom extends Atom {
    /**
     * The version of this atom.
     *
     * @type {number}
     */
    version

    /**
     * Unused. Reserved for future use.
     *
     * @type {Uint8Array<ArrayBuffer>} */
    flags = new Uint8Array(3)

    /**
     * When this movie was created
     *
     * @type {Date}
     */
    creationTime

    /**
     * When this movie was last modified
     *
     * @type {Date}
     */
    modificationTime

    /**
     * The amount of time units that pass per second.
     *
     * @type {number}
     */
    timeScale

    /**
     * Derived from the movie's tracks; duration of the
     * longest track in the movie.
     *
     * To get the duration of this movie in seconds multiply
     * this value with `timeScale`.
     *
     * @type {number}
     */
    duration

    /**
     * 32-bit fixed point number that specifies the rate at which
     * to play this movie.
     *
     * A value of 1.0 indicates normal rate.
     *
     * @type {number}
     */
    preferredRate

    /**
     * 16-bit fixed point number that specifies preferred loudness
     * of sound.
     *
     * Value of 1.0 indicates full volume.
     *
     * @type {number}
     */
    preferredVolume

    /**
     * The matrix structure associated with this movie.
     *
     * @type {Matrix}
     */
    matrixStructure

    /**
     * The time value in the movie at which the 
     * preview begins.
     * 
     * @type {number}
     */
    previewTime

    /**
     * The duration of the movie preview in movie
     * time scale units.
     *
     * @type {number}
     */
    previewDuration

    /**
     * The time value of the time of the movie poster.
     *
     * @type {number}
     */
    posterTime

    /**
     * The time value of the time of the current selection.
     *
     * @type {number}
     */
    selectionTime

    /**
     * The duration of the current selection in movie
     * time scale units.
     *
     * @type {number}
     */
    selectionDuration

    /**
     * The time value for current time position within
     * the movie.
     *
     * @type {number}
     */
    currentTime

    /**
     * 32-bit number indicating the id of the next track added
     * to this movie
     *
     * @type {number}
     */
    nextTrackID
}

/**
 * Parses a mvhd atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function mvhdAtomParser(reader, atomTemplate, scanner) {
    const atom = new MvhdAtom()

    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    atom.version = await reader.readUint8()
    await reader.read(atom.flags)
    atom.creationTime = await reader.readMacintoshDate()
    atom.modificationTime = await reader.readMacintoshDate()
    atom.timeScale = await reader.readUint32()
    atom.duration = await reader.readUint32()
    atom.preferredRate = await reader.readFixed32()
    atom.preferredVolume = await reader.readFixed16()
    await reader.skip(10) // reserved
    atom.matrixStructure = await reader.readMatrix()
    atom.previewTime = await reader.readUint32()
    atom.previewDuration = await reader.readUint32()
    atom.posterTime = await reader.readUint32()
    atom.selectionTime = await reader.readUint32()
    atom.selectionDuration = await reader.readUint32()
    atom.currentTime = await reader.readUint32()
    atom.nextTrackID = await reader.readUint32()

    return atom
}
