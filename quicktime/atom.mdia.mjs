import ElngAtom from './atom.elng.mjs'
import HdlrAtom from './atom.hdlr.mjs'
import MdhdAtom from './atom.mdhd.mjs'
import MinfAtom from './atom.minf.mjs'
import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import UdtaAtom from './atom.udta.mjs'

const log = console

/**
 * The media atom has an atom type of 'mdia'. It must contain a media
 * header atom ('mdhd'), and it can contain a handler reference ('hdlr')
 * atom, media information ('minf') atom, and user data ('udta') atom.
 *
 * Do not confuse the media atom ('mdia') with the media data atom
 * ('mdat'). The media atom contains only references to media data; the
 * media data atom contains the actual media samples.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/media_atom}
 */
export default class MdiaAtom extends Atom {
    /**
     * @type {MdhdAtom}
     */
    header

    /**
     * @type {ElngAtom}
     */
    extendedLanguageTag

    /**
     * @type {HdlrAtom}
     */
    handler

    /**
     * @type {MinfAtom}
     */
    mediaInformation

    /**
     * @type {UdtaAtom}
     */
    userData
}

/**
 * Parses an mdia atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function mdiaAtomParser(reader, atomTemplate, scanner) {
    const atom = new MdiaAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    let bytesRemaining = atom.getDataSize()

    for await (const nextAtom of scanner) {
        atom.children.push(nextAtom)
        nextAtom.parent = atom
        bytesRemaining -= nextAtom.getSize()

        if (nextAtom instanceof UdtaAtom) {
            atom.userData = nextAtom
        }
        else if (nextAtom instanceof MdhdAtom) {
            atom.header = nextAtom
        }
        else if (nextAtom instanceof ElngAtom) {
            atom.extendedLanguageTag = nextAtom
        }
        else if (nextAtom instanceof HdlrAtom) {
            atom.handler = nextAtom
        }
        else if (nextAtom instanceof MinfAtom) {
            atom.mediaInformation = nextAtom
        }
        else {
            log.warn('mdia: unexpected child atom ' + nextAtom.type)
        }

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
