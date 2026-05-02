import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Track load settings atoms contain information that indicates how the
 * track is to be used in its movie. Applications that read QuickTime
 * files can use this information to process the movie data more
 * efficiently. Track load settings atoms have an atom type value of
 * 'load'.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/track_load_settings_atom}
 */
export default class LoadAtom extends Atom {
    /**
     * Specifies the starting time, in the movie’s time coordinate
     * system, of a segment of the track that is to be preloaded.
     *
     * Used in conjunction with `preloadDuration`.
     *
     * @type {number}
     */
    preloadStartTime

    /**
     * Specifies the duration, in the movie’s time coordinate system, of
     * a segment of the track that is to be preloaded.
     *
     * If the duration is set to –1, it means that the preload segment
     * extends from the preload start time to the end of the track. All
     * media data in the segment of the track defined by the preload
     * start time and preload duration values should be loaded into
     * memory when the movie is to be played.
     *
     * @type {number}
     */
    preloadDuration
    
    /**
     * Only two flags are defined, and they are mutually exclusive. If
     * this flag is set to 1, the track is to be preloaded regardless of
     * whether it is enabled. If this flag is set to 2, the track is to
     * be preloaded only if it is enabled.
     *
     * @type {number}
     */
    preloadFlags

    /**
     * If this flag is enabled the track should be played using double-
     * buffered I/O.
     *
     * @type {boolean}
     */
    useDoubleBufferedIO

    /**
     * If this flag is set then the track should be displayed with the
     * highest quality without regard to performance considerations.
     * 
     * @type {boolean}
     */
    useHighQuality
}

/**
 * Parses an load atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function loadAtomParser(reader, atomTemplate, scanner) {
    const atom = new LoadAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    atom.preloadStartTime = await reader.readInt32()
    atom.preloadDuration = await reader.readInt32()
    atom.preloadFlags = await reader.readInt32()

    const defaultHints = await reader.readInt32()
    atom.useDoubleBufferedIO = (defaultHints & 0x0020) != 0
    atom.useHighQuality = (defaultHints & 0x0100) != 0

    return atom
}
