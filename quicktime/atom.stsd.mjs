import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import * as textDecoders from '../utils/textdecoder.mjs'

/**
 * The sample description atom. Stores information that allows you to 
 * decode samples in the media.
 *
 * The data stored in the sample description varies, depending on the
 * media type. For example, in the case of video media, the sample
 * descriptions are image description structures.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/sample_description_atom}
 */
export default class StsdAtom extends FullAtom {

    /** @type {SampleDescription[]} */
    table = []
}

export class SampleDescription {
    /** @type {string} */
    dataFormat

    dataFormatBytes = new Uint8Array(4)

    /** @type {number} */
    dataReferenceIndex

    /** @type {Blob?} */
    data
}

/**
 * Parses an stsd atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function stsdAtomParser(reader, atomTemplate, scanner) {
    const atom = new StsdAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()

    const entries = await reader.readUint32()
    const ascii = textDecoders.get('ascii')

    for (let i = 0; i < entries; i++) {
        const sampleDesc = new SampleDescription()
        const sampleSize = await reader.readUint32()
        let bytesRemaining = sampleSize - 4

        await reader.read(sampleDesc.dataFormatBytes)
        sampleDesc.dataFormat = ascii.decode(sampleDesc.dataFormatBytes)
        bytesRemaining -= 4

        await reader.skip(6) // reserved
        bytesRemaining -= 6

        sampleDesc.dataReferenceIndex = await reader.readUint16()
        bytesRemaining -= 2

        if (bytesRemaining > 0) {
            sampleDesc.data = await reader.readBlob(bytesRemaining)
        }

        atom.table.push(sampleDesc)
    }

    return atom
}
