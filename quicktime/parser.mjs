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
import { mdiaAtomParser } from './atom.mdia.mjs'
import { mdhdAtomParser } from './atom.mdhd.mjs'
import { elngAtomParser } from './atom.elng.mjs'
import { hdlrAtomParser } from './atom.hdlr.mjs'
import { minfAtomParser } from './atom.minf.mjs'
import { vmhdAtomParser } from './atom.vmhd.mjs'
import { dinfAtomParser } from './atom.dinf.mjs'
import { drefAtomParser } from './atom.dref.mjs'
import { metaAtomParser } from './atom.meta.mjs'
import { moofAtomParser } from './atom.moof.mjs'
import { trafAtomParser } from './atom.traf.mjs'
import { tfhdAtomParser } from './atom.tfhd.mjs'
import { mfhdAtomParser } from './atom.mfhd.mjs'
import { tfdtAtomParser } from './atom.tfdt.mjs'
import { trunAtomParser } from './atom.trun.mjs'
import { ilstAtomParser } from './atom.ilst.mjs'
import { dataAtomParser } from './atom.data.mjs'
import { mvexAtomParser } from './atom.mvex.mjs'
import { trexAtomParser } from './atom.trex.mjs'
import { stblAtomParser } from './atom.stbl.mjs'
import { keysAtomParser } from './atom.keys.mjs'
import { colrAtomParser } from './atom.colr.mjs'
import { sdtpAtomParser } from './atom.sdtp.mjs'
import { sttsAtomParser } from './atom.stts.mjs'
import { cttsAtomParser } from './atom.ctts.mjs'
import { cslgAtomParser } from './atom.cslg.mjs'
import { stssAtomParser } from './atom.stss.mjs'
import { stpsAtomParser } from './atom.stps.mjs'
import { stscAtomParser } from './atom.stsc.mjs'
import { stszAtomParser } from './atom.stsz.mjs'
import { stcoAtomParser } from './atom.stco.mjs'
import { co64AtomParser } from './atom.co64.mjs'
import { smhdAtomParser } from './atom.smhd.mjs'
import { gmhdAtomParser } from './atom.gmhd.mjs'

const log = console

/**
 * A QuickTime file parser. It extends the AtomScanner
 * class and defines the parsers for QuickTime atoms.
 * Instances of this class may be used for parsing MP4
 * files as well.
 */
export default class QuickTimeParser extends AtomScanner {
    constructor() {
        super()

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
        this.defineParser('\x00\x00in', trackInputAtomParser)
        this.defineParser('\x00\x00ty', inputTypeAtomParser)
        this.defineParser('obid', objectIDAtomParser)
        this.defineParser('mdia', mdiaAtomParser)
        this.defineParser('mdhd', mdhdAtomParser)
        this.defineParser('elng', elngAtomParser)
        this.defineParser('hdlr', hdlrAtomParser)
        this.defineParser('minf', minfAtomParser)
        this.defineParser('vmhd', vmhdAtomParser)
        this.defineParser('dinf', dinfAtomParser)
        this.defineParser('dref', drefAtomParser)
        this.defineParser('meta', metaAtomParser)
        this.defineParser('moof', moofAtomParser)
        this.defineParser('traf', trafAtomParser)
        this.defineParser('tfhd', tfhdAtomParser)
        this.defineParser('mfhd', mfhdAtomParser)
        this.defineParser('tfdt', tfdtAtomParser)
        this.defineParser('trun', trunAtomParser)
        this.defineParser('ilst', ilstAtomParser)
        this.defineParser('data', dataAtomParser)
        this.defineParser('mvex', mvexAtomParser)
        this.defineParser('trex', trexAtomParser)
        this.defineParser('stbl', stblAtomParser)
        this.defineParser('keys', keysAtomParser)
        this.defineParser('colr', colrAtomParser)
        this.defineParser('sdtp', sdtpAtomParser)
        this.defineParser('stts', sttsAtomParser)
        this.defineParser('ctts', cttsAtomParser)
        this.defineParser('cslg', cslgAtomParser)
        this.defineParser('stss', stssAtomParser)
        this.defineParser('stps', stpsAtomParser)
        this.defineParser('stsc', stscAtomParser)
        this.defineParser('stsz', stszAtomParser)
        this.defineParser('stco', stcoAtomParser)
        this.defineParser('co64', co64AtomParser)
        this.defineParser('smhd', smhdAtomParser)
        this.defineParser('gmhd', gmhdAtomParser)
    }
}
