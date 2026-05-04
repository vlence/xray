import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/data_atom}
 */
export default class DataAtom extends Atom {
    /**
     * @type {number}
     */
    typeIndicator

    /**
     * @type {number}
     */
    localeIndicator
    
    /**
     * @type {Uint8Array<ArrayBuffer>}
     */
    value
}

/**
 * Parses an data atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function dataAtomParser(reader, atomTemplate, scanner) {
    const atom = new DataAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.typeIndicator = await reader.readUint32()
    atom.localeIndicator = await reader.readUint32()

    const bytesRemaining = atom.getDataSize() - 4 - 4
    atom.value = new Uint8Array(bytesRemaining)

    await reader.read(atom.value)

    return atom
}
