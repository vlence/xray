import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Container for metadata.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/metadata_atoms_and_types}
 */
export default class MetaAtom extends FullAtom {
}

/**
 * Parses an meta atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function metaAtomParser(reader, atomTemplate, scanner) {
    const atom = new MetaAtom()
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
