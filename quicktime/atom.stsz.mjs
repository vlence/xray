import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Sample size atoms have an atom type of 'stsz'.
 *
 * The sample size atom contains the sample count and a table giving the
 * size of each sample. This allows the media data itself to be unframed.
 * The total number of samples in the media is always indicated in the
 * sample count. If the default size is indicated, then no table follows.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/sample_size_atom}
 */
export default class StszAtom extends FullAtom {
    /**
     * @type {number}
     */
    sampleSize

    /**
     * @type {number[]}
     */
    sizes = []
}

/**
 * Parses an stsz atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function stszAtomParser(reader, atomTemplate, scanner) {
    const atom = new StszAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent
    atom.versionAndFlags = await reader.readUint32()
    atom.sampleSize = await reader.readUint32()

    const entries = await reader.readUint32()

    if (atom.sampleSize == 0) {
        for (let i = 0; i < entries; i++) {
            atom.sizes.push(await reader.readUint32())
        }
    }

    return atom
}
