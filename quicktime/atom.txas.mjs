import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Indicates not to automatically select this track.
 *
 * Some alternate tracks contain something other than a direct
 * translation (or untranslated written form) of the primary content.
 * Commentary tracks are one example. Don’t automatically select these
 * tracks. The presence of the Track Exclude From Autoselection atom in
 * a track indicates not to automatically select this track.
 *
 * Ensure that such tracks have user-readable names that help users to
 * identify the purpose of the track. These names are stored in one or
 * more track name ('tnam') atoms, each translated into a different
 * language, within a user data ('udta') atom within the 'trak' atom.
 *
 * The type of the Track Exclude From Autoselection atom is 'txas'.
 * This atom, if used, must be somewhere after the 'tkhd' atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_exclude_from_autoselection_atom}
 */
export default class TxasAtom extends Atom {
}

/**
 * Parses an txas atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function txasAtomParser(reader, atomTemplate, scanner) {
    const atom = new TxasAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    return atom
}
