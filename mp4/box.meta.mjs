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
    const box = new MetaBox()
    box.size = atomTemplate.size
    box.type = atomTemplate.type
    box.typeBytes = atomTemplate.typeBytes
    box.extendedSize = atomTemplate.extendedSize
    box.parent = atomTemplate.parent

    box.versionAndFlags = await reader.readUint32()

    let bytesRemaining = box.getDataSize()

    const iter = scanner.withParent(box)[Symbol.asyncIterator]()

    while (bytesRemaining > 0) {
        const nextAtom = await iter.next().then(result => result.value)
        box.children.push(nextAtom)
        bytesRemaining -= nextAtom.getSize()
    }

    return box
}
