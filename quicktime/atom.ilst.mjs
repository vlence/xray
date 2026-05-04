import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import * as textDecoders from '../utils/textdecoder.mjs'

/**
 * The metadata item list atom holds a list of actual metadata values
 * that are present in the metadata atom. The metadata items are
 * formatted as a list of items. The metadata item list atom is of type
 * ‘ilst’ and contains a number of metadata items, each of which is an
 * atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/metadata_item_list_atom}
 */
export default class IlstAtom extends Atom {
}

export class UserDataAtom extends Atom { }

/**
 * Parses an ilst atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function ilstAtomParser(reader, atomTemplate, scanner) {
    const atom = new IlstAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    let bytesRemaining = atom.getDataSize()

    while (bytesRemaining > 0) {
        const userDataAtom = await parseUserDataAtom(reader, scanner)
        userDataAtom.parent = atom
        atom.children.push(userDataAtom)

        bytesRemaining -= userDataAtom.getSize()
    }

    return atom
}

/**
 * Parses an ilst atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {AtomScanner} scanner
 */
export async function parseUserDataAtom(reader, scanner) {
    const atom = new UserDataAtom()
    const ascii = textDecoders.get('ascii')

    atom.size = await reader.readUint32()
    await reader.read(atom.typeBytes)
    atom.type = ascii.decode(atom.typeBytes)

    let bytesRemaining = atom.getDataSize()

    for await (const nextAtom of scanner.withParent(atom)) {
        atom.children.push(nextAtom)
        bytesRemaining -= nextAtom.getSize()

        if (bytesRemaining == 0) {
            break
        }
    }

    return atom
}
