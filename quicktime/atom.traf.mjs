import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Traf atom
 *
 * @see {@link https://mpeggroup.github.io/FileFormatConformance/?query=%3D%22traf%22}
 */
export default class TrafAtom extends Atom {
}

/**
 * Parses an traf atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function trafAtomParser(reader, atomTemplate, scanner) {
    const atom = new TrafAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    let bytesRemaining = atom.getDataSize()
    const iter = scanner.withParent(atom)[Symbol.asyncIterator]()

    while (bytesRemaining > 0) {
        const nextAtom = await iter.next().then(result => result.value)
        atom.children.push(nextAtom)
        bytesRemaining -= nextAtom.getSize()
    }

    return atom
}
