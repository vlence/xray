import MdiaAtom from './atom.mdia.mjs'
import MetaAtom from './atom.meta.mjs'
import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

const log = console

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
export class HandlerReferenceAtom extends FullAtom {

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

export class MetadataHandlerAtom extends FullAtom {
    /** Always 0 */
    predefined = 0

    /** @type {string} */
    handlerType

    /**
     * @type {string}
     */
    name
}

/**
 * Parses an hdlr atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function hdlrAtomParser(reader, atomTemplate, scanner) {
    if (atomTemplate.parent instanceof MdiaAtom) {
        return handlerReferenceAtomParser(reader, atomTemplate, scanner)
    }
    else if (atomTemplate.parent instanceof MetaAtom) {
        return metadataHandlerAtomParser(reader, atomTemplate, scanner)
    }
    else {
        log.warn('hdlr: unexpected parent atom ' + atomTemplate.parent?.type)
        return atomTemplate
    }
}

/**
 * Parses a handler reference atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function handlerReferenceAtomParser(reader, atomTemplate, scanner) {
    const atom = new HandlerReferenceAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    let bytesRemaining = atom.getDataSize()

    atom.versionAndFlags = await reader.readUint32()
    bytesRemaining -= 4

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

    if (bytesRemaining > 0) {
        // this is supposed to be a counted string i.e. the first
        // one or two bytes should provide the length of the string
        // but many encoders don't follow this rule so we simply
        // read all the remaining bytes as a string
        atom.componentName = await reader.readUtf8String(bytesRemaining)
    }

    return atom
}

/**
 * Parses a metadata handler atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function metadataHandlerAtomParser(reader, atomTemplate, scanner) {
    const atom = new MetadataHandlerAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.versionAndFlags = await reader.readUint32()
    atom.handlerType = await reader.readUtf8String(4)
    
    const bytesRemaining = atom.getDataSize() - 4 - 4
    atom.name = await reader.readUtf8String(bytesRemaining)

    return atom
}
