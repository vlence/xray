import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import Color from './color.mjs'

/**
 * The base media info atom, contained in the base media information
 * header atom ('gmhd'), defines the media’s control information,
 * including graphics mode and balance information.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/base_media_info_atom}
 */
export default class GminAtom extends FullAtom {

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

    /**
     * @type {number}
     */
    balance

    /**
     * This is a compatibility flag that allows QuickTime to distinguish
     * between movies created with QuickTime 1.0 and newer movies
     *
     * Always set to 1 unless you are creating a movie intended for
     * playback using version 1.0 of QuickTime.
     */
    noLeanAhead() {
        return (this.flags() & 1) != 0
    }
}

/**
 * Parses an gmin atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function gminAtomParser(reader, atomTemplate, scanner) {
    const atom = new GminAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()
    atom.graphicsMode = await reader.readInt16()
    atom.opcolor = await reader.readColor()
    atom.balance = await reader.readFixed16()

    await reader.skip(2) // reserved

    return atom
}
