import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * An atom that governs how the timecode text is displayed.
 *
 * The timecode media also requires a media information atom. This atom
 * contains information governing how the timecode text is displayed.
 * This media information atom is stored in a base media information
 * atom.
 *
 * The type of the timecode media information atom is 'tcmi'.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/timecode_media_information_atom}
 */
export default class TcmiAtom extends FullAtom {
    /**
     * @type {number}
     */
    textFont

    /**
     * @type {number}
     */
    textFace

    /**
     * @type {number}
     */
    textSize

    /**
     * @type {number}
     */
    textColor

    /**
     * @type {number}
     */
    backgroundColor

    /**
     * @type {string}
     */
    fontName

    textBold() {
        return (this.textFace & 0x0001) != 0
    }

    textItalic() {
        return (this.textFace & 0x0002) != 0
    }

    textUnderline() {
        return (this.textFace & 0x0004) != 0
    }

    textOutline() {
        return (this.textFace & 0x0008) != 0
    }

    textShadow() {
        return (this.textFace & 0x0010) != 0
    }

    textCondense() {
        return (this.textFace & 0x0020) != 0
    }

    textExtend() {
        return (this.textFace & 0x0040) != 0
    }
}

/**
 * Parses an tcmi atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function tcmiAtomParser(reader, atomTemplate, scanner) {
    const atom = new TcmiAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent
    atom.versionAndFlags = await reader.readUint32()

    let bytesRemaining = atom.getDataSize()

    atom.textFont = await reader.readUint16()
    bytesRemaining -= 2

    atom.textFace = await reader.readUint16()
    bytesRemaining -= 2

    atom.textSize = await reader.readUint16()
    bytesRemaining -= 2

    await reader.skip(2) // reserved
    bytesRemaining -= 2

    atom.textColor = await reader.readColor()
    bytesRemaining -= 6

    atom.backgroundColor = await reader.readColor()
    bytesRemaining -= 6

    const len = await reader.readUint8()
    bytesRemaining -= 1

    atom.fontName = await reader.readUtf8String(len)
    bytesRemaining -= len

    if (bytesRemaining > 0) {
        atom.data = await reader.readBlob(bytesRemaining)
    }

    return atom
}
