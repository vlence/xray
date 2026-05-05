import AtomScanner, { AtomByteReader } from '../quicktime/atom.scanner.mjs'
import Atom from '../quicktime/atom.mjs'
import MvhdAtom from '../quicktime/atom.mvhd.mjs'

const log = console

/**
 * The mvhd atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/movie_header_atom}
 */
export default class MvhdBox extends MvhdAtom {

    /**
     * Derived from the movie's tracks; duration of the
     * longest track in the movie.
     *
     * To get the duration of this movie in seconds multiply
     * this value with `timeScale`.
     *
     * @type {number|bigint}
     */
    duration
}

/**
 * Parses a mvhd atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function mvhdBoxParser(reader, atomTemplate, scanner) {
    const box = new MvhdBox()

    box.size = atomTemplate.size
    box.type = atomTemplate.type
    box.typeBytes = atomTemplate.typeBytes
    box.extendedSize = atomTemplate.extendedSize
    box.parent = atomTemplate.parent

    box.versionAndFlags = await reader.readUint32()
    const version = box.version()
    const v0 = version == 0

    box.creationTime = v0 ? await reader.readMacintoshDate() : await reader.readMacintoshDate(8)
    box.modificationTime = v0 ? await reader.readMacintoshDate() : await reader.readMacintoshDate(8)
    box.timeScale = await reader.readUint32()
    box.duration = v0 ? await reader.readUint32() : await reader.readBigUint64()
    box.preferredRate = await reader.readFixed32()
    box.preferredVolume = await reader.readFixed16()
    await reader.skip(10) // reserved
    box.matrixStructure = await reader.readMatrix()
    box.previewTime = await reader.readUint32()
    box.previewDuration = await reader.readUint32()
    box.posterTime = await reader.readUint32()
    box.selectionTime = await reader.readUint32()
    box.selectionDuration = await reader.readUint32()
    box.currentTime = await reader.readUint32()
    box.nextTrackID = await reader.readUint32()

    return box
}
