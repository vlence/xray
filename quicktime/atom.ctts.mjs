import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Video samples in encoded formats have a decode order and a
 * presentation order (also called composition order or display order).
 * The composition offset atom is used when there are out-of-order video
 * samples.
 *
 * * If the decode and presentation orders are the same, no composition
 * offset atom will be present. The time-to-sample atom provides both
 * the decode and presentation ordering of the video stream, and allows
 * calculation of the start and end times.
 *
 * * If video samples are stored out of presentation order, the
 * time-to-sample atom provides the decode order and the composition
 * offset atom provides the time of presentation for the decoded samples
 * expressed as a delta on a sample-by-sample basis.
 *
 * Note that decode time does not directly imply presentation time when
 * working with out of order video samples. The ordering is significant.
 *
 * The composition offset atom contains a sample-by-sample mapping of the
 * decode-to-presentation time. Each entry in the composition offset
 * table is a time delta from decode to presentation time:
 * CT(n) = DT(n) + CTTS(n) where CTTS(n) is the (uncompressed) table
 * entry for sample n DT is the decode time and CT is the composition (or
 * display) time. The delta expressed in the composition offset table can
 * be positive or negative.
 *
 * When the time-to-sample atom and the composition offset atom are
 * present, a reader parsing out-of-order video samples has all the
 * information necessary to calculate the start and end times, as well as
 * the minimum and maximum offsets between decode time and presentation
 * time. The sample tables are scanned to obtain these values.
 *
 * Note that at the last displayed frame, the decode duration is used as
 * presentation duration.
 *
 * The type of the composition offset atom is ‘ctts’.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/composition_offset_atom}
 */
export default class CttsAtom extends FullAtom {
    /**
     * @type {CompositionOffset[]}
     */
    compositionOffsets = []
}

export class CompositionOffset {
    /**
     * @type {number}
     */
    sampleCount

    /**
     * @type {number}
     */
    compositionOffset
}

/**
 * Parses an ctts atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function cttsAtomParser(reader, atomTemplate, scanner) {
    const atom = new CttsAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent
    atom.versionAndFlags = await reader.readUint32()

    const entries = await reader.readUint32()

    for (let i = 0; i < entries; i++) {
        const offset = new CompositionOffset()
        atom.compositionOffsets.push(offset)

        offset.sampleCount = await reader.readUint32()
        offset.compositionOffset = await reader.readInt32()
    }

    return atom
}
