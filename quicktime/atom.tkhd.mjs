import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import Atom from './atom.mjs'
import Matrix from './matrix.mjs'

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
    flags = new Uint8Array(3)

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
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function tkhdAtomParser(reader, atomTemplate, scanner) {
    const atom = new TkhdAtom()

    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.extendedSize = atomTemplate.extendedSize

    atom.version = await reader.readUint8()
    await reader.skip(3) // TODO: flags
    atom.creationTime = await reader.readMacintoshDate()
    atom.modificationTime = await reader.readMacintoshDate()
    atom.id = await reader.readUint32()
    await reader.skip(4) // reserved field
    atom.duration = await reader.readUint32()
    await reader.skip(8) // reserved field
    atom.layer = await reader.readUint16()
    atom.alternateGroup = await reader.readUint16()
    atom.volume = await reader.readFixed16()
    await reader.skip(2) // reserved field
    atom.matrix = await reader.readMatrix()
    atom.width = await reader.readFixed32()
    atom.height = await reader.readFixed32()

    return atom
}
