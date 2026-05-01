import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import * as textDecoders from '../utils/textdecoder.mjs'

/**
 * An atom that defines relationships between tracks.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_reference_atom}
 */
export default class TrefAtom extends Atom {
}

export class TrackReferenceTypeAtom {
    /** @type {number} */
    size

    /** @type {string} */
    type

    typeBytes = new Uint8Array(4)

    /** @type {number[]} */
    tracks = []
}

/**
 * Parses an tref atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function trefAtomParser(reader, atomTemplate, scanner) {
    const atom = new TrefAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    const ascii = textDecoders.get('ascii')
    const trackSize = 4

    let bytesRemaining = atom.getDataSize()

    while (bytesRemaining > 0) {
        const ref = new TrackReferenceTypeAtom()

        ref.size = await reader.readUint32()
        bytesRemaining -= 4

        await reader.read(ref.typeBytes)
        ref.type = ascii.decode(ref.typeBytes)
        bytesRemaining -= 4

        const dataSize = ref.size - 8
        const tracks = dataSize / trackSize

        for (let i = 0; i < tracks; i++) {
            ref.tracks.push(await reader.readUint32())
        }
    }

    return atom
}
