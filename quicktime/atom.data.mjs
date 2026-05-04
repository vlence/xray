import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import * as Types from './types.mjs'
import * as textDecoders from '../utils/textdecoder.mjs'

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

    isString() {
        return Types.isUTF8(this.typeIndicator)
            || Types.isUTF16(this.typeIndicator)
            || Types.isSJIS(this.typeIndicator)
    }

    getStringValue() {
        if (Types.isUTF8(this.typeIndicator)) {
            return textDecoders.get('utf8').decode(this.value)
        }
        else if (Types.isUTF16(this.typeIndicator)) {
            return textDecoders.get('utf16-be').decode(this.value)
        }
        else if (Types.isSJIS(this.typeIndicator)) {
            return textDecoders.get('sjis').decode(this.value)
        }
    }
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
