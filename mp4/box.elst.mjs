import Atom, { FullAtom } from '../quicktime/atom.mjs'
import AtomScanner, { AtomByteReader } from '../quicktime/atom.scanner.mjs'

/**
 * An atom that maps from a time in a movie to a time in a media, and
 * ultimately to media data.
 *
 * You use the edit list atom to map from a time in a movie to a time in
 * a media, and ultimately to media data. This information is in the
 * form of entries in an edit list table.
 *
 * @see {@link https://mpeggroup.github.io/FileFormatConformance/?query=%3D%22elst%22}
 */
export default class ElstBox extends FullAtom {

    /** @type {EditListTableEntry[]} */
    entries = []

    /**
     * Returns true if the repeat edits flag is turned on.
     */
    repeatEdits() {
        return this.flags() == 1
    }
}

export class EditListTableEntry {
    /**
     * Specifies the duration of this edit segment in units of the
     * movie’s time scale.
     *
     * @type {number|BigInt}
     */
    trackDuration

    /**
     * The starting time within the media of this edit segment (in media
     * timescale units). If this field is set to –1, it is an empty edit.
     * The last edit in a track should never be an empty edit. Any
     * difference between the movie’s duration and the track’s duration is
     * expressed as an implicit empty edit.
     *
     * @type {number|BigInt}
     */
    mediaTime

    /**
     * Specifies the relative rate at which to play the media
     * corresponding to this edit segment. This rate value cannot be 0 or
     * negative.
     *
     * @type {number}
     */
    mediaRate
}

/**
 * Parses an elst atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function elstBoxParser(reader, atomTemplate, scanner) {
    const box = new ElstBox()
    box.size = atomTemplate.size
    box.type = atomTemplate.type
    box.typeBytes = atomTemplate.typeBytes
    box.extendedSize = atomTemplate.extendedSize
    box.parent = atomTemplate.parent

    box.versionAndFlags = await reader.readUint32()

    const entries = await reader.readUint32()
    const v1 = box.version() == 1

    for (let i = 0; i < entries; i++) {
        const entry = new EditListTableEntry()

        if (v1) {
            entry.trackDuration = await reader.readBigUint64()
            entry.mediaTime = await reader.readBigInt32()
        }
        else {
            entry.trackDuration = await reader.readUint32()
            entry.mediaTime = await reader.readInt32()
        }
        
        entry.mediaRate = await reader.readFixed32()

        box.entries.push(entry)
    }

    return box
}
