import ByteReader from '../utils/bytereader.mjs'
import Atom from './atom.mjs'

/**
 * The mdat atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/file_type_compatibility_atom}
 */
export default class MdatAtom extends Atom {}

/**
 * @param {ByteReader} reader
 * @param {Atom} atomTemplate An atom with the size, type and extended size decoded
 */
export async function MdatAtomParser(reader, atomTemplate) {
    const atom = new MdatAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.extendedSize = atomTemplate.extendedSize

    if (atom.usesExtendedSize()) {
        await reader.skipBytes(atom.extendedSize-16n)
    }
    else {
        await reader.skipBytes(atom.size-8)
    }

    return atom
}
