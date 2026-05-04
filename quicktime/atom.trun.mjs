import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Trun atom
 *
 * @see {@link https://mpeggroup.github.io/FileFormatConformance/?query=%3D%22trun%22}
 */
export default class TrunAtom extends FullAtom {
    /**
     * @type {number?}
     */
    dataOffset

    /**
     * @type {number?}
     */
    firstSampleFlags

    /**
     * @type {TrunSample[]}
     */
    samples = []

    dataOffsetPresent() {
        return (this.flags() & 0x000001) != 0
    }

    firstSampleFlagsPresent() {
        return (this.flags() & 0x000004) != 0
    }

    sampleDurationPresent() {
        return (this.flags() & 0x000100) != 0
    }

    sampleSizePresent() {
        return (this.flags() & 0x000200) != 0
    }

    sampleFlagsPresent() {
        return (this.flags() & 0x000400) != 0
    }

    sampleCompositionTimeOffsetsPresent() {
        return (this.flags() & 0x000800) != 0
    }
}

export class TrunSample {
    /**
     * @type {number?}
     */
    duration

    /**
     * @type {number?}
     */
    size

    /**
     * @type {number?}
     */
    flags

    /**
     * @type {number?}
     */
    compositionTimeOffset
}

/**
 * Parses an trun atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function trunAtomParser(reader, atomTemplate, scanner) {
    const atom = new TrunAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()
    const samples = await reader.readUint32()

    if (atom.dataOffsetPresent()) {
        atom.dataOffset = await reader.readInt32()
    }

    atom.firstSampleFlags = await reader.readUint32()

    for (let i = 0; i < samples; i++) {
        const sample = new TrunSample()
        atom.samples.push(sample)

        if (atom.sampleDurationPresent()) {
            sample.duration = await reader.readUint32()
        }

        if (atom.sampleSizePresent()) {
            sample.size = await reader.readUint32()
        }

        if (atom.sampleFlagsPresent()) {
            sample.flags = await reader.readUint32()
        }

        if (atom.sampleCompositionTimeOffsetsPresent()) {
            if (atom.version == 0) {
                sample.compositionTimeOffset = await reader.readUint32()
            }
            else {
                sample.compositionTimeOffset = await reader.readInt32()
            }
        }
    }

    return atom
}
