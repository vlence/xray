import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Tfhd atom
 *
 * @see {@link https://mpeggroup.github.io/FileFormatConformance/?query=%3D%22tfhd%22}
 */
export default class TfhdAtom extends FullAtom {
    /**
     * Track ID.
     *
     * @type {number}
     */
    id

    /**
     * @type {bigint?}
     */
    baseDataOffset

    /**
     * @type {number?}
     */
    sampleDescriptionIndex

    /**
     * @type {number?}
     */
    defaultSampleDuration

    /**
     * @type {number?}
     */
    defaultSampleSize

    /**
     * @type {number?}
     */
    defaultSampleFlags

    baseDataOffsetPresent() {
        return (this.flags() & 0x000001) != 0
    }

    sampleDescriptionIndexPresent() {
        return (this.flags() & 0x000002) != 0
    }

    defaultSampleDurationPresent() {
        return (this.flags() & 0x000008) != 0
    }

    defaultSampleSizePresent() {
        return (this.flags() & 0x000010) != 0
    }

    defaultSampleFlagsPresent() {
        return (this.flags() & 0x000020) != 0
    }

    durationIsEmpty() {
        return (this.flags() & 0x010000) != 0
    }

    defaultBaseIsMoof() {
        return (this.flags() & 0x020000) != 0
    }
}

/**
 * Parses an tfhd atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function tfhdAtomParser(reader, atomTemplate, scanner) {
    const atom = new TfhdAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()

    let bytesRemaining = atom.getDataSize()

    atom.id = await reader.readUint32()
    bytesRemaining -= 4

    if (atom.baseDataOffsetPresent()) {
        atom.baseDataOffset = await reader.readBigUint64()
        bytesRemaining -= 8
    }

    if (atom.sampleDescriptionIndexPresent()) {
        atom.sampleDescriptionIndex = await reader.readUint32()
        bytesRemaining -= 4
    }

    if (atom.defaultSampleDurationPresent()) {
        atom.defaultSampleDuration = await reader.readUint32()
        bytesRemaining -= 4
    }

    if (atom.defaultSampleSizePresent()) {
        atom.defaultSampleSize = await reader.readUint32()
        bytesRemaining -= 4
    }

    if (atom.defaultSampleFlagsPresent()) {
        atom.defaultSampleFlags = await reader.readUint32()
        bytesRemaining -= 4
    }

    if (bytesRemaining > 0) {
        atom.data = await reader.readBlob(bytesRemaining)
    }

    return atom
}
