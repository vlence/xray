import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/sample_dependency_flags_atom}
 */
export default class SdtpAtom extends FullAtom {
    /** @type {SampleFlags[]} */
    sampleFlags = []
}

export class SampleFlags {
    earlierDisplayTimeAllowed = false
    sampleDoesNotDependOnOthers = false
    sampleDependsOnOthers = false
    noOtherSampleDependsOnThisSample = false
    otherSamplesDependOnThisSample = false
    thereIsNoRedundantCodingInThisSample = false
    thereIsRedundantCodingInThisSample = false
}

/**
 * Parses an sdtp atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function sdtpAtomParser(reader, atomTemplate, scanner) {
    const atom = new SdtpAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()

    const flagsBytes = new Uint8Array(atom.getDataSize())
    await reader.read(flagsBytes)

    for (const flagsByte of flagsBytes) {
        const flags = new SampleFlags()

        flags.earlierDisplayTimeAllowed = (flagsByte & 64) != 0
        flags.sampleDoesNotDependOnOthers = (flagsByte & 32) != 0
        flags.sampleDependsOnOthers = (flagsByte & 16) != 0
        flags.noOtherSampleDependsOnThisSample = (flagsByte & 8) != 0
        flags.otherSamplesDependOnThisSample = (flagsByte & 4) != 0
        flags.thereIsNoRedundantCodingInThisSample = (flagsByte & 2) != 0
        flags.thereIsRedundantCodingInThisSample = (flagsByte & 1) != 0

        atom.sampleFlags.push(flags)
    }

    return atom
}
