import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Moof atom
 *
 * @see {@link https://mpeggroup.github.io/FileFormatConformance/?query=%3D%22moof%22}
 */
export default class MoofAtom extends Atom {
}

/**
 * Parses an moof atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function moofAtomParser(reader, atomTemplate, scanner) {
    const atom = new MoofAtom()
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
