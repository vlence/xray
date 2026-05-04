import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import Color from './color.mjs'

/**
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/video_media_information_header_atom}
 */
export default class VmhdAtom extends FullAtom {

    /**
     * Specifies the transfer mode.
     *
     * The transfer mode specifies which Boolean operation QuickDraw
     * performs when drawing or transferring an image from one location
     * to another.
     *
     * @type {number}
     */
    graphicsMode

    /**
     * @type {Color}
     */
    opcolor
}

/**
 * Parses an vmhd atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function vmhdAtomParser(reader, atomTemplate, scanner) {
    const atom = new VmhdAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()
    atom.graphicsMode = await reader.readInt16()
    atom.opcolor = await reader.readColor()

    return atom
}
