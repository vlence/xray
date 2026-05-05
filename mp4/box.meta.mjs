import Atom, { FullAtom } from '../quicktime/atom.mjs'
import AtomScanner, { AtomByteReader } from '../quicktime/atom.scanner.mjs'

/**
 * Container for metadata.
 *
 * @see {@link https://mpeggroup.github.io/FileFormatConformance/?query=%3D%22meta%22}
 */
export default class MetaBox extends FullAtom {
}

/**
 * Parses an meta atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function metaBoxParser(reader, atomTemplate, scanner) {
    const atom = new MetaBox()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()

    let bytesRemaining = atom.getDataSize()

    const iter = scanner.withParent(atom)[Symbol.asyncIterator]()

    while (bytesRemaining > 0) {
        const nextAtom = await iter.next().then(result => result.value)
        atom.children.push(nextAtom)
        bytesRemaining -= nextAtom.getSize()
    }

    return atom
}
