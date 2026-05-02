import KmatAtom from './atom.kmat.mjs'
import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

const log = console

/**
 * The track matte atom. This atom is used to visually blend the
 * track's image when it is displayed.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_matte_atom}
 */
export default class MattAtom extends Atom {
    /**
     * Specifies the image description structure and the matte data
     * associated with a particular matte atom.
     *
     * @type {KmatAtom}
     */
    kmat
}

/**
 * Parses an matt atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function mattAtomParser(reader, atomTemplate, scanner) {
    const atom = new MattAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    const iter = scanner[Symbol.asyncIterator]()
    const nextAtom = await iter.next().then(result => result.value)

    atom.children.push(nextAtom)
    nextAtom.parent = atom

    if (nextAtom instanceof KmatAtom) {
        atom.kmat = nextAtom
    }
    else {
        log.warn('matt: unexpected atom ' + nextAtom.getTypeString())
    }

    return atom
}
