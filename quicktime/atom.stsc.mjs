import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * As samples are added to a media, they are collected into chunks that
 * allow optimized data access. A chunk contains one or more samples.
 * Chunks in a media may have different sizes, and the samples within a
 * chunk may have different sizes. The sample-to-chunk atom stores chunk
 * information for the samples in a media.
 *
 * Sample-to-chunk atoms have an atom type of 'stsc'. The sample-to-chunk
 * atom contains a table that maps samples to chunks in the media data
 * stream. By examining the sample-to-chunk atom, you can determine the
 * chunk that contains a specific sample.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/sample-to-chunk_atom}
 */
export default class StscAtom extends FullAtom {
    /**
     * @type {Chunk[]}
     */
    chunks = []
}

export class Chunk {
    /**
     * @type {number}
     */
    firstChunk

    /**
     * @type {number}
     */
    samplesPerChunk

    /**
     * @type {number}
     */
    sampleDescriptionID
}

/**
 * Parses an stsc atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function stscAtomParser(reader, atomTemplate, scanner) {
    const atom = new StscAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent
    atom.versionAndFlags = await reader.readUint32()

    const entries = await reader.readUint32()

    for (let i = 0; i < entries; i++) {
        const chunk = new Chunk()
        atom.chunks.push(chunk)

        chunk.firstChunk = await reader.readUint32()
        chunk.samplesPerChunk = await reader.readUint32()
        chunk.sampleDescriptionID = await reader.readUint32()
    }

    return atom
}
