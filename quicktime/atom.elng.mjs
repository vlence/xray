import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'
import * as textDecoders from '../utils/textdecoder.mjs'

/**
 * The extended language tag atom represents media language information
 * based on the RFC 4646 (Best Common Practices (BCP) #47) industry
 * standard. It is an optional peer of the media header atom and follows
 * the definition of the media header atom in a QuickTime movie. There is
 * at most one extended language tag atom per media atom and, in turn,
 * per track. The extended language tag atom has an atom type of 'elng'.
 *
 * Until the introduction of this atom type, QuickTime had support for
 * languages via codes based on either ISO 639 or the classic Macintosh
 * language codes. These language codes are associated to a media (per
 * track) in a QuickTime movie and are referred to as the media language.
 *
 * To distinguish the extended language support from the old system, it
 * is referred to as the extended language tag as opposed to language
 * code. The major advantage of the extended language tag is that it
 * includes additional information such as region, script, variation, and
 * so on, as parts (or subtags). For instance, this additional
 * information allows distinguishing content in French as spoken in
 * Canada from content in French as spoken in France.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/extended_language_tag_atom}
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc4646}
 */
export default class ElngAtom extends FullAtom {

    /**
     * A RFC 4646 (BCP 47) language tag.
     *
     * @type {string}
     */
    languageTag

    /**
     * @type {Uint8Array<ArrayBuffer>}
     */
    languageTagBytes
}

/**
 * Parses an elng atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function elngAtomParser(reader, atomTemplate, scanner) {
    const atom = new ElngAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()

    atom.languageTagBytes = new Uint8Array(atom.getDataSize())
    await reader.read(atom.languageTagBytes)

    const ascii = textDecoders.get('ascii')
    // The language tag is a null-terminated c string so we want
    // to ignore the last byte when decoding it as utf-8/ascii
    atom.languageTag = ascii.decode(atom.languageTagBytes.subarray(0, atom.languageTagBytes.byteLength-1))

    return atom
}
