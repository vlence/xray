import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * An atom that stores the sound media’s control information, such as balance.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/sound_media_information_header_atom}
 */
export default class SmhdAtom extends FullAtom {
    /**
     * @type {number}
     */
    balance
}

/**
 * Parses an smhd atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function smhdAtomParser(reader, atomTemplate, scanner) {
    const atom = new SmhdAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent
    atom.versionAndFlags = await reader.readUint32()
    atom.balance = await reader.readFixed16()

    await reader.skip(2) // reserved

    return atom
}
