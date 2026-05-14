import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * The optional composition shift least greatest atom summarizes the
 * calculated minimum and maximum offsets between decode and composition
 * time, as well as the start and end times, for all samples. This allows
 * a reader to determine the minimum required time for decode to obtain
 * proper presentation order without needing to scan the sample table for
 * the range of offsets. The type of the composition shift least greatest
 * atom is ‘cslg’.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/composition_shift_least_greatest_atom}
 */
export default class CslgAtom extends FullAtom {
    /**
     * @type {number}
     */
    compositionOffsetToDisplayOffsetShift

    /**
     * @type {number}
     */
    leastDisplayOffset

    /**
     * @type {number}
     */
    greatestDisplayOffset

    /**
     * @type {number}
     */
    displayStartTime

    /**
     * @type {number}
     */
    displayEndTime
}

/**
 * Parses an cslg atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function cslgAtomParser(reader, atomTemplate, scanner) {
    const atom = new CslgAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent
    atom.versionAndFlags = await reader.readUint32()
    atom.compositionOffsetToDisplayOffsetShift = await reader.readUint32()
    atom.leastDisplayOffset = await reader.readUint32()
    atom.greatestDisplayOffset = await reader.readUint32()
    atom.displayStartTime = await reader.readInt32()
    atom.displayEndTime = await reader.readInt32()

    return atom
}
