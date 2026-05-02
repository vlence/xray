import AtomScanner from './atom.scanner.mjs'
import { ftypAtomParser } from './atom.ftyp.mjs'
import { moovAtomParser } from './atom.moov.mjs'
import { mvhdAtomParser } from './atom.mvhd.mjs'
import { trakAtomParser } from './atom.trak.mjs'
import { mdatAtomParser } from './atom.mdat.mjs'
import { prflAtomParser } from './atom.prfl.mjs'
import { clipAtomParser } from './atom.clip.mjs'
import { crgnAtomParser } from './atom.crgn.mjs'
import { tkhdAtomParser } from './atom.tkhd.mjs'
import { taptAtomParser } from './atom.tapt.mjs'
import { clefAtomParser } from './atom.clef.mjs'
import { profAtomParser } from './atom.prof.mjs'
import { enofAtomParser } from './atom.enof.mjs'
import { mattAtomParser } from './atom.matt.mjs'
import { kmatAtomParser } from './atom.kmat.mjs'
import { stsdAtomParser } from './atom.stsd.mjs'
import { freeAtomParser } from './atom.free.mjs'
import { skipAtomParser } from './atom.skip.mjs'
import { wideAtomParser } from './atom.wide.mjs'
import { pnotAtomParser } from './atom.pnot.mjs'
import { edtsAtomParser } from './atom.edts.mjs'
import { elstAtomParser } from './atom.elst.mjs'
import { udtaAtomParser } from './atom.udta.mjs'
import { trefAtomParser } from './atom.tref.mjs'
import { txasAtomParser } from './atom.txas.mjs'
import { loadAtomParser } from './atom.load.mjs'
import { imapAtomParser, inputTypeAtomParser, objectIDAtomParser, trackInputAtomParser } from './atom.imap.mjs'

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
        this.defineParser('free', freeAtomParser)
        this.defineParser('skip', skipAtomParser)
        this.defineParser('wide', wideAtomParser)
        this.defineParser('pnot', pnotAtomParser)
        this.defineParser('moov', moovAtomParser)
        this.defineParser('mvhd', mvhdAtomParser)
        this.defineParser('trak', trakAtomParser)
        this.defineParser('mdat', mdatAtomParser)
        this.defineParser('prfl', prflAtomParser)
        this.defineParser('clip', clipAtomParser)
        this.defineParser('crgn', crgnAtomParser)
        this.defineParser('tkhd', tkhdAtomParser)
        this.defineParser('tapt', taptAtomParser)
        this.defineParser('clef', clefAtomParser)
        this.defineParser('prof', profAtomParser)
        this.defineParser('enof', enofAtomParser)
        this.defineParser('matt', mattAtomParser)
        this.defineParser('kmat', kmatAtomParser)
        this.defineParser('stsd', stsdAtomParser)
        this.defineParser('edts', edtsAtomParser)
        this.defineParser('elst', elstAtomParser)
        this.defineParser('udta', udtaAtomParser)
        this.defineParser('tref', trefAtomParser)
        this.defineParser('txas', txasAtomParser)
        this.defineParser('load', loadAtomParser)
        this.defineParser('imap', imapAtomParser)
        this.defineParser('\x00 in', trackInputAtomParser)
        this.defineParser('\x00 ty', inputTypeAtomParser)
        this.defineParser('obid', objectIDAtomParser)
    }
}
