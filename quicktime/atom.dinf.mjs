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
    atom.parent = atomTemplate.parent

    let bytesRemaining = atom.getDataSize()

    for await (const nextAtom of scanner.withParent(atom)) {
        atom.children.push(nextAtom)
        bytesRemaining -= nextAtom.getSize()

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
