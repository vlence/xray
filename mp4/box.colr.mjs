import ColrAtom from "../quicktime/atom.colr.mjs";
import Atom from "../quicktime/atom.mjs";
import AtomScanner, { AtomByteReader } from "../quicktime/atom.scanner.mjs";

export default class ColrBox extends ColrAtom {
    /**
     * @type {boolean?}
     */
    fullRange

    isFullRange() {
        return this.fullRange
    }
}

/**
 * Parses an colr atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function colrBoxParser(reader, atomTemplate, scanner) {
    const atom = new ColrBox()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.colorParameterType = await reader.readUtf8String(4)

    if (atom.colorParameterType == 'nclc' || atom.colorParameterType == 'nclx') {
        atom.primariesIndex = await reader.readUint16()
        atom.transferFunctionIndex = await reader.readUint16()
        atom.matrixIndex = await reader.readUint16()
    }
    else {
        atom.data = await reader.readBlob(atom.getDataSize() - 4)
    }

    if (atom.colorParameterType == 'nclx') {
        const flags = await reader.readUint8()
        const fullRangeFlag = (flags & 0x80) >> 7
        
        atom.fullRange = fullRangeFlag != 0
    }

    return atom
}
