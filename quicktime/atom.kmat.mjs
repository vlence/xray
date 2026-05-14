import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

const log = console

/**
 * The compressed matte atom. This atom specifies the image description
 * structure and the matte data associated with a particular matte atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/compressed_matte_atom}
 */
export default class KmatAtom extends FullAtom {

    /**
     * The compressed matte data.
     *
     * @type {Blob}
     */
    matteData
}

/**
 * Parses an kmat atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function kmatAtomParser(reader, atomTemplate, scanner) {
    const atom = new KmatAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()

    let bytesRemaining = atom.getDataSize()

    const iter = scanner.withParent(atom)[Symbol.asyncIterator]()
    const nextAtom = await iter.next().then(result => result.value)

    atom.children.push(nextAtom)
    bytesRemaining -= nextAtom.getSize()

    atom.matteData = await reader.readBlob(bytesRemaining)

    return atom
}
