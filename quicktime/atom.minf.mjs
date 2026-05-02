import HdlrAtom from './atom.hdlr.mjs'
import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

const log = console

/**
 * Media information atoms (defined by the 'minf' atom type) store
 * handler-specific information for a track’s media data. The media
 * handler uses this information to map from media time to media data and
 * to process the media data.
 *
 * These atoms contain information that is specific to the type of data
 * defined by the media. Further, the format and content of media
 * information atoms are dictated by the media handler that is
 * responsible for interpreting the media data stream. Another media
 * handler would not know how to interpret this information.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/media_information_atoms}
 */
export default class MinfAtom extends Atom {
    videoMediaInformationHeader

    /**
     * @type {HdlrAtom}
     */
    handler
    dataInformation
    sampleTable
}

/**
 * Parses an minf atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function minfAtomParser(reader, atomTemplate, scanner) {
    const atom = new MinfAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    let bytesRemaining = atom.getDataSize()

    for await (const nextAtom of scanner) {
        atom.children.push(nextAtom)
        nextAtom.parent = atom
        bytesRemaining -= nextAtom.getSize()

        if (nextAtom instanceof HdlrAtom) {
            atom.handler = nextAtom
        }
        else {
            log.warn('minf: unexpected child atom ' + nextAtom.type)
        }

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
