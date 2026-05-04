import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * An atom that maps from a time in a movie to a time in a media, and
 * ultimately to media data.
 *
 * You use the edit list atom to map from a time in a movie to a time in
 * a media, and ultimately to media data. This information is in the
 * form of entries in an edit list table.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/edit_list_atom}
 */
export default class ElstAtom extends FullAtom {

    /** @type {EditListTableEntry[]} */
    entries = []
}

export class EditListTableEntry {
    /**
     * Specifies the duration of this edit segment in units of the
     * movie’s time scale.
     *
     * @type {number}
     */
    trackDuration

    /**
     * The starting time within the media of this edit segment (in media
     * timescale units). If this field is set to –1, it is an empty edit.
     * The last edit in a track should never be an empty edit. Any
     * difference between the movie’s duration and the track’s duration is
     * expressed as an implicit empty edit.
     *
     * @type {number}
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
export async function elstAtomParser(reader, atomTemplate, scanner) {
    const atom = new ElstAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()

    const entries = await reader.readUint32()

    for (let i = 0; i < entries; i++) {
        const entry = new EditListTableEntry()
        
        entry.trackDuration = await reader.readInt32()
        entry.mediaTime = await reader.readInt32()
        entry.mediaRate = await reader.readFixed32()

        atom.entries.push(entry)
    }

    return atom
}
