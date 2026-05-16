import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import * as textDecoders from '../utils/textdecoder.mjs'

export const videoSampleTypes = [
    'cvid', // Cinepak
    'jpeg', // JPEG
    'smc ', // Graphics
    'rle ', // Animation
    'rpza', // Apple video
    'kpcd', // Kodak Photo CD
    'png ', // Portable Network Graphics
    'mjpa', // Motion-JPEG (format A)
    'mjpb', // Motion-JPEG (format B)
    'SVQ1', // Sorenson video, version 1
    'SVQ3', // Sorenson video 3
    'mp4v', // MPEG-4 video
    'avc1', // H.264 video
    'dvc ', // NTSC DV-25 video
    'dvcp', // PAL DV-25 video
    'gif ', // CompuServe Graphics Interchange Format
    'h263', // H.263 video
    'tiff', // Tagged Image File Format
    'raw ', // Uncompressed RGB
    '2vuY', // Uncompressed Y´CbCr, 8-bit-per-component 4:2:2
    'yuv2', // Uncompressed Y´CbCr, 8-bit-per-component 4:2:2
    'v308', // Uncompressed Y´CbCr, 8-bit-per-component 4:4:4
    'v408', // Uncompressed Y´CbCr, 8-bit-per-component 4:4:4:4
    'v216', // Uncompressed Y´CbCr, 10, 12, 14, or 16-bit-per-component 4:2:2
    'v410', // Uncompressed Y´CbCr, 10-bit-per-component 4:4:4
    'v210', // Uncompressed Y´CbCr, 10-bit-per-component 4:2:2]
]

export const timecodeSampleTypes = [
    'tmcd',
]

export const soundSampleTypes = [
    '\x00\x00\x00\x00',
    'NONE',
    'raw ',
    'twos',
    'sowt',
    'MAC3',
    'MAC6',
    'ima4',
    'fl32',
    'fl64',
    'in24',
    'ulaw',
    'alaw',
    '\x6D\x73\x00\x02',
    '\x6D\x73\x00\x11',
    'dvca',
    'QDMC',
    'QDM2',
    'Qclp',
    '\x6D\x73\x00\x55',
    '.mp3',
    'mp4a',
    'ac-3',
]

const ascii = textDecoders.get('ascii')

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
export default class StsdAtom extends FullAtom { }

export class SampleDescriptionAtom extends Atom {
    /**
     * @type {number}
     */
    dataReferenceIndex

    getDataSize() {
        const reservedSpace = 6
        const dataReferenceIndexSize = 2

        return super.getDataSize() - reservedSpace - dataReferenceIndexSize
    }
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

    let bytesRemaining = atom.getDataSize()

    const entries = await reader.readUint32()
    bytesRemaining -= 4

    for (let i = 0; i < entries && bytesRemaining > 0; i++) {
        let desc = new SampleDescriptionAtom()

        desc.size = await reader.readUint32()
        await reader.read(desc.typeBytes)
        desc.type = ascii.decode(desc.typeBytes)
        desc.parent = atom

        await reader.skip(6) // reserved
        desc.dataReferenceIndex = await reader.readInt16()

        if (videoSampleTypes.includes(desc.type)) {
            desc = await parseVideoSampleDescription(reader, desc, scanner)
        }
        else if (timecodeSampleTypes.includes(desc.type)) {
            desc = await parseTimecodeSampleDescription(reader, desc, scanner)
        }
        else if (soundSampleTypes.includes(desc.type)) {
            desc = await parseSoundSampleDescription(reader, desc, scanner)
        }
        else {
            desc.data = await reader.readBlob(desc.getDataSize())
        }

        atom.children.push(desc)

        bytesRemaining -= desc.getSize()
    }

    return atom
}

export class VideoSampleDescription extends SampleDescriptionAtom {
    /**
     * @type {number}
     */
    version

    /**
     * @type {number}
     */
    revisionLevel

    /**
     * @type {number}
     */
    vendor

    /**
     * @type {number}
     */
    temporalQuality

    /**
     * @type {number}
     */
    spatialQuality

    /**
     * @type {number}
     */
    width

    /**
     * @type {number}
     */
    height

    /**
     * @type {number}
     */
    horizontalResolution

    /**
     * @type {number}
     */
    verticalResolution

    /**
     * @type {number}
     */
    dataSize

    /**
     * @type {number}
     */
    frameCount

    /**
     * @type {string}
     */
    compressorName
    compressorNameBytes = new Uint8Array(32)

    /**
     * @type {number}
     */
    depth

    /**
     * @type {number}
     */
    colorTableID
}

/**
 * Parses an stsd atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {SampleDescriptionAtom} desc
 * @param {AtomScanner} scanner
 */
export async function parseVideoSampleDescription(reader, desc, scanner) {
    const atom = new VideoSampleDescription()
    atom.size = desc.size
    atom.type = desc.type
    atom.parent = desc.parent
    atom.typeBytes = desc.typeBytes
    atom.extendedSize = desc.extendedSize
    atom.dataReferenceIndex = desc.dataReferenceIndex

    let bytesRemaining = atom.getDataSize()

    atom.version = await reader.readInt16()
    bytesRemaining -= 2

    atom.revisionLevel = await reader.readInt16()
    bytesRemaining -= 2

    atom.vendor = await reader.readUtf8String(4)
    bytesRemaining -= 4

    atom.temporalQuality = await reader.readInt32()
    bytesRemaining -= 4

    atom.spatialQuality = await reader.readInt32()
    bytesRemaining -= 4

    atom.width = await reader.readInt16()
    bytesRemaining -= 2

    atom.height = await reader.readInt16()
    bytesRemaining -= 2

    atom.horizontalResolution = await reader.readFixed32()
    bytesRemaining -= 4

    atom.verticalResolution = await reader.readFixed32()
    bytesRemaining -= 4

    atom.dataSize = await reader.readInt32()
    bytesRemaining -= 4

    atom.frameCount = await reader.readInt16()
    bytesRemaining -= 2

    await reader.read(atom.compressorNameBytes)
    const compressorNameLength = atom.compressorNameBytes[0]
    atom.compressorName = ascii.decode(atom.compressorNameBytes.subarray(1, 1 + compressorNameLength))
    bytesRemaining -= 32

    atom.depth = await reader.readInt16()
    bytesRemaining -= 2

    atom.colorTableID = await reader.readInt16()
    bytesRemaining -= 2

    if (bytesRemaining > 0) {
        for await (const nextAtom of scanner.withParent(atom)) {
            atom.children.push(nextAtom)
            bytesRemaining -= nextAtom.getSize()

            if (bytesRemaining > 0) {
                continue
            }
            else {
                break
            }
        }
    }

    return atom
}

export class SoundSampleDescription extends SampleDescriptionAtom {
    /**
     * @type {number}
     */
    version

    /**
     * @type {number}
     */
    revisionLevel

    /**
     * @type {number}
     */
    vendor
}

/**
 * Parses an stsd atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {SampleDescriptionAtom} desc
 * @param {AtomScanner} scanner
 */
export async function parseSoundSampleDescription(reader, desc, scanner) {
    let atom = new SoundSampleDescription()
    atom.size = desc.size
    atom.type = desc.type
    atom.parent = desc.parent
    atom.typeBytes = desc.typeBytes
    atom.extendedSize = desc.extendedSize
    atom.dataReferenceIndex = desc.dataReferenceIndex

    let bytesRemaining = atom.getDataSize()

    atom.version = await reader.readUint16()
    bytesRemaining -= 2

    atom.revisionLevel = await reader.readUint16()
    bytesRemaining -= 2

    atom.vendor = await reader.readUint32()
    bytesRemaining -= 4

    if (atom.version == 2) {
        atom = await parseV2SoundSampleDescription(reader, atom, scanner)
    }
    else {
        atom.data = await reader.readBlob(bytesRemaining)
    }

    return atom
}

export class V0SoundSampleDescription extends SoundSampleDescription {
    numberOfChannels
    sampleSize
    compressionID
    packetSize
    sampleRate
}

export class V2SoundSampleDescription extends SoundSampleDescription {
    /**
     * @type {number}
     */
    always3

    /**
     * @type {number}
     */
    always16

    /**
     * @type {number}
     */
    alwaysMinus2

    /**
     * @type {number}
     */
    always0

    /**
     * @type {number}
     */
    always65536

    /**
     * @type {number}
     */
    sizeOfStructOnly

    /**
     * @type {number}
     */
    numAudioChannels

    /**
     * @type {number}
     */
    always7F000000

    /**
     * @type {number}
     */
    constBitsPerChannel

    /**
     * @type {number}
     */
    formatSpecificFlags

    /**
     * @type {number}
     */
    constBytesPerAudioPacket

    /**
     * @type {number}
     */
    constLPCMFramesPerAudioPacket
}

/**
 * Parses an stsd atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {SoundSampleDescription} desc
 * @param {AtomScanner} scanner
 */
export async function parseV2SoundSampleDescription(reader, desc, scanner) {
    const atom = new V2SoundSampleDescription()
    atom.size = desc.size
    atom.type = desc.type
    atom.parent = desc.parent
    atom.typeBytes = desc.typeBytes
    atom.extendedSize = desc.extendedSize
    atom.dataReferenceIndex = desc.dataReferenceIndex

    let bytesRemaining = atom.getDataSize()

    atom.version = desc.version
    bytesRemaining -= 2

    atom.revisionLevel = desc.revisionLevel
    bytesRemaining -= 2

    atom.vendor = desc.vendor
    bytesRemaining -= 4

    atom.always3 = await reader.readInt16()
    bytesRemaining -= 2

    atom.always16 = await reader.readInt16()
    bytesRemaining -= 2

    atom.alwaysMinus2 = await reader.readInt16()
    bytesRemaining -= 2

    atom.always0 = await reader.readInt16()
    bytesRemaining -= 2

    atom.always65536 = await reader.readInt32()
    bytesRemaining -= 4

    atom.sizeOfStructOnly = await reader.readUint32()
    bytesRemaining -= 4

    atom.numAudioChannels = await reader.readUint32()
    bytesRemaining -= 4

    await reader.skip(8)
    bytesRemaining -= 8

    atom.always7F000000 = await reader.readInt32()
    bytesRemaining -= 4

    atom.constBitsPerChannel = await reader.readUint32()
    bytesRemaining -= 4

    atom.formatSpecificFlags = await reader.readUint32()
    bytesRemaining -= 4

    atom.constBytesPerAudioPacket = await reader.readUint32()
    bytesRemaining -= 4

    atom.constLPCMFramesPerAudioPacket = await reader.readUint32()
    bytesRemaining -= 4

    if (bytesRemaining > 0) {
        // atom.data = await reader.readBlob(bytesRemaining)
        for await (const nextAtom of scanner.withParent(atom)) {
            atom.children.push(nextAtom)
            bytesRemaining -= nextAtom.getSize()

            if (bytesRemaining == 0) {
                break
            }
        }
    }
    
    return atom
}

export class TimecodeSampleDescription extends SampleDescriptionAtom {
    /**
     * @type {number}
     */
    flags

    /**
     * @type {number}
     */
    timeScale

    /**
     * @type {number}
     */
    frameDuration

    /**
     * @type {number}
     */
    numberOfFrames
}

/**
 * Parses an stsd atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {SampleDescriptionAtom} desc
 * @param {AtomScanner} scanner
 */
export async function parseTimecodeSampleDescription(reader, desc, scanner) {
    const atom = new TimecodeSampleDescription()
    atom.size = desc.size
    atom.type = desc.type
    atom.parent = desc.parent
    atom.typeBytes = desc.typeBytes
    atom.extendedSize = desc.extendedSize
    atom.dataReferenceIndex = desc.dataReferenceIndex

    let bytesRemaining = atom.getDataSize()

    await reader.skip(4) // reserved
    bytesRemaining -= 4

    atom.flags = await reader.readUint32()
    bytesRemaining -= 4

    atom.timeScale = await reader.readUint32()
    bytesRemaining -= 4

    atom.frameDuration = await reader.readUint32()
    bytesRemaining -= 4

    atom.numberOfFrames = await reader.readUint8()
    bytesRemaining -= 1

    await reader.skip(1) // reserved
    bytesRemaining -= 1

    if (bytesRemaining > 0) {
        for await (const nextAtom of scanner.withParent(atom)) {
            atom.children.push(nextAtom)
            bytesRemaining -= nextAtom.getSize()

            if (bytesRemaining == 0) {
                break
            }
        }
    }

    return atom
}
