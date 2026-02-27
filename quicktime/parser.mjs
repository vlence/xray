import { FtypAtomParser } from './atom.ftyp.mjs'
import { MdatAtomParser } from './atom.mdat.mjs'
import { MoovAtomParser } from './atom.moov.mjs'
import AtomScanner from './atom.scanner.mjs'

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

        this.defineParser('ftyp', FtypAtomParser)
        this.defineParser('mdat', MdatAtomParser)
        this.defineParser('moov', MoovAtomParser)
    }
}
