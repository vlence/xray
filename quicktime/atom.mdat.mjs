import ByteReader from '../utils/bytereader.mjs'
import AtomScanner from './atom.scanner.mjs'
import Atom from './atom.mjs'

/**
 * The mdat atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/movie_data_atom}
 */
export default class MdatAtom extends Atom {
    /** @type {Blob} */
    movieMediaData
}

/**
 * Parses a moov atom's data.
 *
 * @param {ByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function mdatAtomParser(reader, atomTemplate, scanner) {
    const atom = new MdatAtom()

    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.extendedSize = atomTemplate.extendedSize

    let bytesRemaining = atom.getDataSize()
    /** @type {Uint8Array<ArrayBuffer>[]} */
    const bufs = []

    if (!atom.usesExtendedSize()) {
        bufs.push(await reader.readBytes(bytesRemaining))
        bytesRemaining = 0n
    }

    const maxUint32 = 0xffffffff
    const maxUint32BigInt = BigInt(maxUint32)

    while (bytesRemaining > 0n) {
        if (bytesRemaining > maxUint32BigInt) {
            bufs.push(await reader.readBytes(maxUint32))
            bytesRemaining -= maxUint32BigInt
        }
        else {
            bufs.push(await reader.readBytes(Number(bytesRemaining)))
            bytesRemaining = 0n
        }
    }

    atom.movieMediaData = new Blob(bufs)

    return atom
}
