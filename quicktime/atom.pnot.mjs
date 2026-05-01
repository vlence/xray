import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import MacintoshDate from './date.mjs'
import * as textDecoders from '../utils/textdecoder.mjs'

/**
 * The preview atom. Contains information that allows you to find the
 * preview image associated with a QuickTime movie.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/preview_atom}
 */
export default class PnotAtom extends Atom {
    /** 
     * When the preview was last updated.
     *
     * @type {Date}
     */ 
    modificationDate

    /**
     * 16-bit integer. Always 0.
     */
    version = 0

    /**
     * Indicates the type of atom that contains the preview data.
     *
     * Typically set to `'PICT'` to indicate a QuickDraw picture.
     *
     * @type {string}
     */
    atomType
    
    /**
     * The bytes that make up the `atomType` field.
     */
    atomTypeBytes = new Uint8Array(4)

    /**
     * Identifies which atom of the specified type is to be used as the
     * preview.
     *
     * Typically, this field is set to 1 to indicate that you should use
     * the first atom of the type specified in the atom type field.
     *
     * @type {number}
     */
    atomIndex
}

/**
 * Parses an pnot atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function pnotAtomParser(reader, atomTemplate, scanner) {
    const atom = new PnotAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    const ascii = textDecoders.get('ascii')

    atom.modificationDate = MacintoshDate.from(await reader.readUint32())
    await reader.skip(2) // version field
    await reader.read(atom.atomTypeBytes)
    atom.atomType = ascii.decode(atom.atomTypeBytes)
    atom.atomIndex = await reader.readUint16()

    return atom
}
