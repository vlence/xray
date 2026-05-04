import ElstAtom from './atom.elst.mjs'
import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

const log = console

/**
 * Defines the portions of the media that are to be used to build up a
 * track for a movie. The edits themselves are contained in an edit list
 * table, which consists of time offset and duration values for each
 * segment.
 *
 * In the absence of an edit list, the presentation of a track starts
 * immediately. An empty edit is used to offset the start time of a
 * track.
 *
 * If the edit atom or the edit list atom is missing, you can assume
 * that the entire media is used by the track.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/edit_atom}
 */
export default class EdtsAtom extends Atom {
    /**
     * An atom that maps from a time in a movie to a time in a media,
     * and ultimately to media data.
     *
     * @type {ElstAtom}
     */
    editList
}

/**
 * Parses an edts atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function edtsAtomParser(reader, atomTemplate, scanner) {
    const atom = new EdtsAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    let bytesRemaining = atom.getDataSize()

    for await (const nextAtom of scanner.withParent(atom)) {
        atom.children.push(nextAtom)
        bytesRemaining -= nextAtom.getSize()

        if (nextAtom instanceof ElstAtom) {
            atom.editList = nextAtom
            break
        }
        else {
            log.warn('edts: unexpected atom ' + nextAtom.type)
        }

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
