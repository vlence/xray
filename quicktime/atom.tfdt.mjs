import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Tfdt atom
 *
 * @see {@link https://mpeggroup.github.io/FileFormatConformance/?query=%3D%22tfdt%22}
 */
export default class TfdtAtom extends FullAtom {
    /**
     * @type {number|bigint}
     */
    baseMediaDecodeTime
}

/**
 * Parses an tfdt atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function tfdtAtomParser(reader, atomTemplate, scanner) {
    const atom = new TfdtAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()

    if (atom.version() == 1) {
        atom.baseMediaDecodeTime = await reader.readBigUint64()
    }
    else {
        atom.baseMediaDecodeTime = await reader.readUint32()
    }

    return atom
}
