import Atom, { FullAtom } from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * Chunk offset atoms have an atom type of 'stco'.
 *
 * The chunk-offset table gives the index of each chunk into the
 * containing file. There are two variants, permitting the use of
 * 32-bit or 64-bit offsets. The latter is useful when managing very
 * large movies. Only one of these variants occurs in any single instance
 * of a sample table atom.
 *
 * Note that offsets are file offsets, not the offset into any atom within
 * the file (for example, a 'mdat' atom). This permits referring to media
 * data in files without any atom structure. However, be careful when
 * constructing a self-contained QuickTime file with its metadata (movie
 * atom) at the front because the size of the movie atom affects the chunk
 * offsets to the media data.
 *
 * Note that the sample table atom can contain a 64-bit chunk offset atom
 * (STChunkOffset64AID = 'co64'). When this atom appears, it is used in
 * place of the original chunk offset atom, which can contain only 32-bit
 * offsets. When QuickTime writes movie files, it uses the 64-bit chunk
 * offset atom only if there are chunks that use the high 32-bits of the
 * chunk offset. Otherwise, the original 32-bit chunk offset atom is used
 * to ensure compatibility with previous versions of QuickTime.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/chunk_offset_atom}
 */
export default class StcoAtom extends FullAtom {
    /**
     * @type {number}
     */
    offsets = []
}

/**
 * Parses an stco atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function stcoAtomParser(reader, atomTemplate, scanner) {
    const atom = new StcoAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent
    atom.versionAndFlags = await reader.readUint32()

    const entries = await reader.readUint32()

    for (let i = 0; i < entries; i++) {
        atom.offsets.push(await reader.readUint32())
    }

    return atom
}
