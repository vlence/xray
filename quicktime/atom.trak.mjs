import Atom from "./atom.mjs";
import AtomScanner, { AtomByteReader } from "./atom.scanner.mjs";

const log = console

/**
 * The trak atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_atom}
 */
export default class TrakAtom extends Atom {
}

/**
 * Parses a trak atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function trakAtomParser(reader, atomTemplate, scanner) {
    const atom = new TrakAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

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
