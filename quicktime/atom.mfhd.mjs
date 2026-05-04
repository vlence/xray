import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Mfhd atom
 *
 * @see {@link https://mpeggroup.github.io/FileFormatConformance/?query=%3D%22mfhd%22}
 */
export default class MfhdAtom extends FullAtom {
    /**
     * @type {number}
     */
    sequenceNumber
}

/**
 * Parses an mfhd atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function mfhdAtomParser(reader, atomTemplate, scanner) {
    const atom = new MfhdAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()
    atom.sequenceNumber = await reader.readUint32()

    return atom
}
