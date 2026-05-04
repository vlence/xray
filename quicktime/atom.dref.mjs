import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/media_data_reference_atom}
 */
export default class DrefAtom extends FullAtom {
}

/**
 * Parses an dref atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function drefAtomParser(reader, atomTemplate, scanner) {
    const atom = new DrefAtom()

    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    atom.versionAndFlags = await reader.readUint32()

    const iter = scanner[Symbol.asyncIterator]()
    const entries = await reader.readInt32()

    for (let i = 0; i < entries; i++) {
        // TODO: the actual data references may not match
        // the spec
        const nextAtom = await iter.next().then(result => result.value)
        atom.children.push(nextAtom)
        nextAtom.parent = atom
    }

    return atom
}
