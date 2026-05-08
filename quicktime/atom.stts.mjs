import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Time-to-sample atoms store duration information for a media’s samples,
 * providing a mapping from a time in a media to the corresponding data
 * sample. The time-to-sample atom has an atom type of 'stts'.
 *
 * You can determine the appropriate sample for any time in a media by
 * examining the time-to-sample atom table, which is contained in the
 * time-to-sample atom.
 *
 * The atom contains a compact version of a table that allows indexing
 * from time to sample number. Other tables provide sample sizes and
 * pointers from the sample number. Each entry in the table gives the
 * number of consecutive samples with the same time delta, and the delta
 * of those samples. By adding the deltas, a complete time-to-sample map
 * can be built.
 *
 * The atom contains time deltas: DT(n+1) = DT(n) + STTS(n) where STTS(n)
 * is the (uncompressed) table entry for sample n and DT is the display
 * time for sample (n). The sample entries are ordered by time stamps;
 * therefore, the deltas are all nonnegative. The DT axis has a zero
 * origin; DT(i) = SUM (for j=0 to i-1 of delta(j)), and the sum of all
 * deltas gives the length of the media in the track (not mapped to the
 * overall time scale, and not considering any edit list). The edit list
 * atom provides the initial DT value if it is nonempty (nonzero).
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/time-to-sample_atom}
 */
export default class SttsAtom extends FullAtom {
    /**
     * The duration of each sample.
     *
     * @type {number[]}
     */
    durations = []
}

/**
 * Parses an stts atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function sttsAtomParser(reader, atomTemplate, scanner) {
    const atom = new SttsAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()
    
    const entries = await reader.readUint32()

    for (let i = 0; i < entries; i++) {
        const count = await reader.readUint32()
        const duration = await reader.readUint32()

        for (let j = 0; j < count; j++) {
            atom.durations.push(duration)
        }
    }

    return atom
}
