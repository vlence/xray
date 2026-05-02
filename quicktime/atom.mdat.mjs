import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import Atom from './atom.mjs'

/**
 * The mdat atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/movie_data_atom}
 */
export default class MdatAtom extends Atom {
}

/**
 * Parses a moov atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function mdatAtomParser(reader, atomTemplate, scanner) {
    const atom = new MdatAtom()

    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.data = await reader.readBlob(atom.getDataSize())

    return atom
}
