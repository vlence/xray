import ByteReader from '../utils/bytereader.mjs'
import AtomScanner from './atom.scanner.mjs'
import Atom from './atom.mjs'
import Matrix from './matrix.mjs'
import MacintoshDate from './date.mjs'

const log = console

/**
 * The tkhd atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_header_atom}
 */
export default class TkhdAtom extends Atom {
    /**
     * @type {number}
     */
    version

    /**
     * @type {number}
     */
    flags

    /**
     *  @type {Date}
     */
    creationTime

    /**
     *  @type {Date}
     */
    modificationTime

    /**
     * Track id.
     *
     * @type {number}
     */
    id

    /**
     * @type {number}
     */
    duration

    /**
     * The layer that this track is in.
     *
     * Tracks overlay each other.
     *
     * @type {number}
     */
    layer

    /**
     * Identifies a collection of movie tracks that contain
     * alternate data for one another.
     *
     * @type {number}
     */
    alternateGroup

    /**
     * 16-bit fixed point value indicating how loud to
     * play this track's sound.
     *
     * 1.0 indicates normal volume
     *
     * @type {number}
     */
    volume

    /**
     * @type {Matrix}
     */
    matrix

    /**
     * 32-bit fixed point number indicating width in pixels.
     *
     * @type {number}
     */
    width

    /**
     * 32-bit fixed point number indicating height in pixels.
     *
     * @type {number}
     */
    height
}

/**
 * Parses a tkhd atom's data.
 *
 * @param {ByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function tkhdAtomParser(reader, atomTemplate, scanner) {
    const atom = new TkhdAtom()

    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.extendedSize = atomTemplate.extendedSize

    atom.version = await reader.readBytes(1).then(arr => arr.buffer[0])

    atom.flags = await reader.readBytes(3) // TODO

    atom.creationTime = await reader.readBytes(4).then(arr => MacintoshDate.from(arr))

    atom.modificationTime = await reader.readBytes(4).then(arr => MacintoshDate.from(arr))

    atom.id = await reader.readBytes(4).then(arr => new DataView(arr.buffer).getUint32())

    await reader.skipBytes(4) // reserved field

    atom.duration = await reader.readBytes(4).then(arr => new DataView(arr.buffer).getUint32())

    await reader.skipBytes(8) // reserved field

    atom.layer = await reader.readBytes(2).then(arr => new DataView(arr.buffer).getUint16())

    atom.alternateGroup = await reader.readBytes(2).then(arr => new DataView(arr.buffer).getUint16())

    atom.volume = await reader.readBytes(2).then(arr => new DataView(arr.buffer).getUint16())

    await reader.skipBytes(2) // reserved field

    atom.matrix = await reader.readBytes(36).then(arr => new Matrix(arr))

    atom.width = await reader.readBytes(4).then(arr => new DataView(arr.buffer).getUint32())

    atom.height = await reader.readBytes(4).then(arr => new DataView(arr.buffer).getUint32())

    return atom
}
