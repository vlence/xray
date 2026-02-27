import ByteReader from '../utils/bytereader.mjs'
import AtomScanner from './atom.scanner.mjs'
import Atom from './atom.mjs'

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
    flags

    creationTime

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
     * @type {number}
     */
    duration

    /**
     * Specifies the rate at which to play this movie.
     *
     * A value of 1.0 indicates normal rate.
     *
     * @type {number}
     */
    preferredRate

    /**
     * Preferred loudness of sound.
     *
     * Value of 1.0 indicates full volume.
     *
     * @type {number}
     */
    preferredVolume

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

    nextTrackID
}

/**
 * Parses a mvhd atom's data.
 *
 * @param {ByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function mvhdAtomParser(reader, atomTemplate, scanner) {
    const atom = new MvhdAtom()

    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.extendedSize = atomTemplate.extendedSize

    let bytesRemaining = atom.getDataSize()

    atom.version = await reader.readBytes(1).then(arr => arr[0])
    bytesRemaining -= 1

    atom.flags = await reader.readBytes(3)
    bytesRemaining -= 3

    // TODO
    atom.creationTime = await reader.readBytes(4)
        .then(arr => new Date(Date.UTC(new DataView(arr.buffer).getUint32() * 1000)))
    bytesRemaining -= 4

    // TODO
    atom.modificationTime = await reader.readBytes(4)
        .then(arr => new Date(Date.UTC(new DataView(arr.buffer).getUint32() * 1000)))
    bytesRemaining -= 4

    atom.timeScale = await reader.readBytes(4).then(arr => new DataView(arr.buffer).getUint32())
    bytesRemaining -= 4

    atom.duration = await reader.readBytes(4).then(arr => new DataView(arr.buffer).getUint32())
    bytesRemaining -= 4

    atom.preferredRate = await reader.readBytes(4).then(arr => new DataView(arr.buffer).getFloat32())
    bytesRemaining -= 4

    // TODO
    atom.preferredVolume = await reader.readBytes(2)
    bytesRemaining -= 2

    // TODO
    atom.matrixStructure = await reader.readBytes(36)
    bytesRemaining -= 36

    atom.previewTime = await reader.readBytes(4).then(arr => new DataView(arr.buffer).getUint32())
    bytesRemaining -= 4

    atom.previewDuration = await reader.readBytes(4).then(arr => new DataView(arr.buffer).getUint32())
    bytesRemaining -= 4

    atom.posterTime = await reader.readBytes(4).then(arr => new DataView(arr.buffer).getUint32())
    bytesRemaining -= 4

    atom.selectionTime = await reader.readBytes(4).then(arr => new DataView(arr.buffer).getUint32())
    bytesRemaining -= 4

    atom.selectionDuration = await reader.readBytes(4).then(arr => new DataView(arr.buffer).getUint32())
    bytesRemaining -= 4

    atom.currentTime = await reader.readBytes(4).then(arr => new DataView(arr.buffer).getUint32())
    bytesRemaining -= 4

    atom.nextTrackID = await reader.readBytes(4).then(arr => new DataView(arr.buffer).getUint32())
    bytesRemaining -= 4

    if (bytesRemaining > 0) {
        log.warn('mvhd:', bytesRemaining, 'bytes remaining')
        await reader.skipBytes(bytesRemaining)
    }

    return atom
}
