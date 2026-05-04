import QuickTimeParser from "../quicktime/parser.mjs"
import { metaAtomParser } from "./atom.meta.mjs"

const log = console

/**
 * A QuickTime file parser. It extends the AtomScanner
 * class and defines the parsers for QuickTime atoms.
 * Instances of this class may be used for parsing MP4
 * files as well.
 */
export default class MP4Parser extends QuickTimeParser {
    constructor() {
        super()

        this.defineParser('meta', metaAtomParser)
    }
}
