import CslgAtom from "../quicktime/atom.cslg.mjs";
import Atom from "../quicktime/atom.mjs";

export default class CslgBox extends CslgAtom {
    /**
     * @type {number|bigint}
     */
    compositionOffsetToDisplayOffsetShift

    /**
     * @type {number|bigint}
     */
    leastDisplayOffset

    /**
     * @type {number|bigint}
     */
    greatestDisplayOffset

    /**
     * @type {number|bigint}
     */
    displayStartTime

    /**
     * @type {number|bigint}
     */
    displayEndTime
}

/**
 * Parses an cslg box's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function cslgBoxParser(reader, atomTemplate, scanner) {
    const box = new CslgBox()
    box.size = atomTemplate.size
    box.type = atomTemplate.type
    box.typeBytes = atomTemplate.typeBytes
    box.extendedSize = atomTemplate.extendedSize
    box.parent = atomTemplate.parent
    box.versionAndFlags = await reader.readUint32()

    if (box.version() == 0) {
        box.compositionOffsetToDisplayOffsetShift = await reader.readUint32()
        box.leastDisplayOffset = await reader.readInt32()
        box.greatestDisplayOffset = await reader.readInt32()
        box.displayStartTime = await reader.readInt32()
        box.displayEndTime = await reader.readInt32()
    }
    else {
        box.compositionOffsetToDisplayOffsetShift = await reader.readUint64()
        box.leastDisplayOffset = await reader.readBigInt64()
        box.greatestDisplayOffset = await reader.reaBigInt64()
        box.displayStartTime = await reader.readBigInt64()
        box.displayEndTime = await reader.readBigInt64()
    }

    return box
}
