import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * The metadata item list atom holds a list of actual metadata values
 * that are present in the metadata atom. The metadata items are
 * formatted as a list of items. The metadata item list atom is of type
 * ‘ilst’ and contains a number of metadata items, each of which is an
 * atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/metadata_item_list_atom}
 */
export default class IlstAtom extends Atom {
}

/**
 * Parses an ilst atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function ilstAtomParser(reader, atomTemplate, scanner) {
    const atom = new IlstAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    let bytesRemaining = atom.getDataSize()
    const iter = scanner.withParent(atom)[Symbol.asyncIterator]()

    while (bytesRemaining > 0) {
        const listItemAtom = await iter.next().then(result => result.value)
        atom.children.push(listItemAtom)
        bytesRemaining -= listItemAtom.getSize()
    }

    return atom
}
