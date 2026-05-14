import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * In a media that contains compressed data, key frames define starting
 * points for portions of a temporally compressed sequence. The key frame
 * is self-contained — that is, it is independent of preceding frames.
 * Subsequent frames may depend on the key frame.
 *
 * The sync sample atom provides a compact marking of the random access
 * points within a stream. The table is arranged in strictly increasing
 * order of sample number. If this table is not present, every sample is
 * implicitly a random access point.
 *
 * Sync sample atoms have an atom type of 'stss'. The sync sample atom
 * contains a table of sample numbers. Each entry in the table identifies
 * a sample that is a key frame for the media. If no sync sample atom
 * exists, then all the samples are key frames.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/sync_sample_atom}
 */
export default class StssAtom extends FullAtom {
    /**
     * @type {number[]}
     */
    samples = []
}

/**
 * Parses an stss atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function stssAtomParser(reader, atomTemplate, scanner) {
    const atom = new StssAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent
    atom.versionAndFlags = await reader.readUint32()

    const entries = await reader.readUint32()

    for (let i = 0; i < entries; i++) {
        atom.samples.push(await reader.readUint32())
    }

    return atom
}

