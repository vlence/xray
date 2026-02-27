import ByteReader from "../utils/bytereader.mjs";
import Atom from "./atom.mjs";
import AtomScanner from "./atom.scanner.mjs";

/**
 * The trak atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_atom}
 */
export default class TrakAtom extends Atom {}

/**
 * Parses a trak atom's data.
 *
 * @param {ByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function trackAtomParser(reader, atomTemplate, scanner) {
    const atom = new TrakAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.extendedSize = atomTemplate.extendedSize

    let bytesRemaining = atom.getDataSize()

    if (bytesRemaining == 0) {
        return atom
    }

    for await (const nextAtom of scanner) {
        atom.children.push(nextAtom)
        bytesRemaining -= nextAtom.size

        if (bytesRemaining == 0) {
            break
        }

        if (bytesRemaining < 0) {
            throw new RangeError(`trak: read more than ${atom.getDataSize()} bytes`)
        }
    }

    if (bytesRemaining > 0) {
        log.warn(`trak: ${bytesRemaining} bytes unread`)
        await reader.skipBytes(bytesRemaining)
    }

    return atom
}
