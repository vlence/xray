import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import StsdAtom from './atom.stsd.mjs'

/**
 * The compressed matte atom. This atom specifies the image description
 * structure and the matte data associated with a particular matte atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/compressed_matte_atom}
 */
export default class KmatAtom extends Atom {
    version
    flags = new Uint8Array(8)

    /**
     * An image description structure associated with this matte data.
     * This should be interpreted as a video sample description.
     *
     * @type {StsdAtom}
     */
    matteImageDescription

    /**
     * The compressed matte data.
     *
     * @type {Blob}
     */
    matteData
}

/**
 * Parses an kmat atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function kmatAtomParser(reader, atomTemplate, scanner) {
    const atom = new KmatAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    atom.version = await reader.readUint8()
    await reader.read(atom.flags)

    let bytesRemaining = atom.getDataSize() - 1 - 3

    for await (const nextAtom of scanner) {
        bytesRemaining -= nextAtom.getSize()

        if (nextAtom instanceof StsdAtom) {
            atom.videoSampleDescription = nextAtom
        }
        else {
            throw new Error('unexpected atom ' + nextAtom.getTypeString())
        }
    }

    atom.matteData = await reader.readBlob(bytesRemaining)

    return atom
}
