import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * User data atoms allow you to define and store data associated with a
 * QuickTime object, such as a movie 'moov', track 'trak', or media
 * 'mdia'. This includes both information that QuickTime looks for, such
 * as copyright information or whether a movie should loop, and arbitrary
 * information — provided by and for your application — that QuickTime
 * simply ignores.
 *
 * A user data atom whose immediate parent is a movie atom contains data
 * relevant to the movie as a whole. A user data atom whose parent is a
 * track atom contains information relevant to that specific track. A
 * QuickTime movie file may contain many user data atoms, but only one
 * user data atom is allowed as the immediate child of any given movie
 * atom or track atom.
 *
 * The user data atom has an atom type of 'udta'. Inside the user data
 * atom is a list of atoms describing each piece of user data. User data
 * provides a simple way to extend the information stored in a QuickTime
 * movie. For example, user data atoms can store a movie’s window
 * position, playback characteristics, or creation information.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/user_data_atoms}
 */
export default class UdtaAtom extends Atom {
}

/**
 * Parses an udta atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function udtaAtomParser(reader, atomTemplate, scanner) {
    const atom = new UdtaAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize

    let bytesRemaining = atom.getDataSize()

    if (bytesRemaining == 0) {
        return atom
    }

    if (bytesRemaining == 4) {
        await reader.readUint32()
        return atom
    }

    for await (const nextAtom of scanner) {
        atom.children.push(nextAtom)
        bytesRemaining -= nextAtom.getSize()

        if (bytesRemaining == 0) {
            break
        }

        if (bytesRemaining == 4) {
            await reader.readUint32()
            break
        }
    }

    return atom
}
