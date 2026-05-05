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
    const atom = new MvhdBox()

    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()
    const version = atom.version()
    const v0 = version == 0

    atom.creationTime = v0 ? await reader.readMacintoshDate() : await reader.readMacintoshDate(8)
    atom.modificationTime = v0 ? await reader.readMacintoshDate() : await reader.readMacintoshDate(8)
    atom.timeScale = await reader.readUint32()
    atom.duration = v0 ? await reader.readUint32() : await reader.readBigUint64()
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
