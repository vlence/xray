import ClipAtom from "./atom.clip.mjs";
import Atom from "./atom.mjs";
import AtomScanner, { AtomByteReader } from "./atom.scanner.mjs";
import TkhdAtom from "./atom.tkhd.mjs";

/**
 * The trak atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_atom}
 */
export default class TrakAtom extends Atom {
    /**
     * Specifies that characteristics of this track.
     *
     * @type {TkhdAtom}
     */
    tkhd

    /**
     * @type {ClipAtom}
     */
    clip
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
    atom.extendedSize = atomTemplate.extendedSize

    for await (const nextAtom of scanner) {
        atom.children.push(nextAtom)
        reader.updateBytesRemaining(nextAtom.size)

        if (nextAtom instanceof TkhdAtom) {
            atom.tkhd = nextAtom
        }
        else if (nextAtom instanceof ClipAtom) {
            atom.clip = nextAtom
        }

        if (reader.bytesRemaining() == 0) {
            break
        }
    }

    return atom
}
