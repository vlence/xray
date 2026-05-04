import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * The media header atom specifies the characteristics of a media,
 * including time scale and duration. The media header atom has an atom
 * type of 'mdhd'.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/media_header_atom}
 */
export default class MdhdAtom extends FullAtom {

    /**
     * @type {Date}
     */
    creationTime

    /**
     * @type {Date}
     */
    modificationTime

    /**
     * @type {number}
     */
    timeScale

    /**
     * @type {number}
     */
    duration

    /**
     * @type {}
     */
    language

    /**
     * @type {number}
     */
    quality
}

/**
 * Parses an mdhd atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function mdhdAtomParser(reader, atomTemplate, scanner) {
    const atom = new MdhdAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()
    atom.creationTime = await reader.readMacintoshDate()
    atom.modificationTime = await reader.readMacintoshDate()
    atom.timeScale = await reader.readInt32()
    atom.duration = await reader.readInt32()
    atom.language = await reader.readUint16()
    atom.quality = await reader.readInt16()

    return atom
}
