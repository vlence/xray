import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Historically, the handler reference atom was also used for data
 * references. However, this isn’t the case anymore.
 *
 * The handler atom within a media atom declares the process by which the
 * media data in the stream may be presented, and thus, the nature of the
 * media in a stream. For example, a video handler would handle a video
 * track.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/handler_reference_atom}
 */
export default class HdlrAtom extends Atom {
    /**
     * @type {number}
     */
    version

    flags = new Uint8Array(3)

    /**
     * A four-character code that identifies the type of the handler.
     *
     * Only two values are valid for this field: 'mhlr' for media handlers
     * and 'dhlr' for data handlers.
     *
     * @type {string}
     */
    componentType

    /**
     * A four-character code that identifies the type of the media
     * handler or data handler.
     *
     * For media handlers, this field defines the type of data — for
     * example, 'vide' for video data, 'soun' for sound data or ‘subt’
     * for subtitles.
     *
     * For data handlers, this field defines the data reference type; for
     * example, a component subtype value of 'alis' identifies a file
     * alias.
     *
     * @type {string}
     */
    componentSubtype
    
    componentManufacturer = 0
    componentFlags = 0
    componentFlagsMask = 0
    componentName = ''
}

/**
 * Parses an hdlr atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function hdlrAtomParser(reader, atomTemplate, scanner) {
    const atom = new HdlrAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    let bytesRemaining = atom.getDataSize()

    atom.version = await reader.readUint8()
    bytesRemaining -= 1

    await reader.read(atom.flags)
    bytesRemaining -= 3

    atom.componentType = await reader.readUtf8String(4)
    bytesRemaining -= 4

    atom.componentSubtype = await reader.readUtf8String(4)
    bytesRemaining -= 4

    await reader.skip(4) // component manufacturer
    bytesRemaining -= 4

    await reader.skip(4) // component flags
    bytesRemaining -= 4

    await reader.skip(4) // component mask
    bytesRemaining -= 4

    // assuming component name length is just one byte
    const strlen = await reader.readUint8()
    bytesRemaining -= 1

    atom.componentName = await reader.readUtf8String(strlen)
    bytesRemaining -= strlen

    if (bytesRemaining > 0) {
        await reader.skip(bytesRemaining)
    }

    return atom
}
