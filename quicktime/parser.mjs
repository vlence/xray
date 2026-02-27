import AtomScanner from './atom.scanner.mjs'
import { ftypAtomParser } from './atom.ftyp.mjs'
import { moovAtomParser } from './atom.moov.mjs'
import { mvhdAtomParser } from './atom.mvhd.mjs'
import { trackAtomParser } from './atom.trak.mjs'

const log = console

/**
 * A QuickTime file parser. It extends the AtomScanner
 * class and defines the parsers for QuickTime atoms.
 * Instances of this class may be used for parsing MP4
 * files as well.
 */
export default class QuickTimeParser extends AtomScanner {
    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>} stream
     */
    constructor(stream) {
        super(stream)

        this.defineParser('ftyp', ftypAtomParser)
        this.defineParser('moov', moovAtomParser)
        this.defineParser('mvhd', mvhdAtomParser)
        this.defineParser('trak', trackAtomParser)
    }
}
