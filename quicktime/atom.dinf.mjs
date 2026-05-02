import DrefAtom from './atom.dref.mjs'
import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

const log = console

/**
 * The handler reference atom contains information specifying the data
 * handler component that provides access to the media data. The data
 * handler component uses the data information atom to interpret the
 * media’s data. Data information atoms have an atom type value of
 * 'dinf'.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/video_media_information_atom/data_information_atom}
 */
export default class DinfAtom extends Atom {
    /**
     * Contains tabular data that instructs the data handler component
     * how to access the media’s data.
     *
     * @type {DrefAtom}
     */
    dataReference
}

/**
 * Parses an dinf atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function dinfAtomParser(reader, atomTemplate, scanner) {
    const atom = new DinfAtom()

    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    const iter = scanner[Symbol.asyncIterator]()
    const nextAtom = await iter.next().then(result => result.value)

    atom.children.push(nextAtom)
    nextAtom.parent = atom

    if (nextAtom instanceof DrefAtom) {
        atom.dataReference = nextAtom
    }
    else {
        log.warn('dinf: unexpected child atom ' + nextAtom.type)
    }

    return atom
}
