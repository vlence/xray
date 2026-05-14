import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/chunk_offset_atom}
 */
export default class Co64Atom extends FullAtom {
    /**
     * @type {bigint}
     */
    offsets = []
}

/**
 * Parses an co64 atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function co64AtomParser(reader, atomTemplate, scanner) {
    const atom = new Co64Atom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent
    atom.versionAndFlags = await reader.readUint32()

    const entries = await reader.readUint32()

    for (let i = 0; i < entries; i++) {
        atom.offsets.push(await reader.readBigUint64())
    }

    return atom
}
