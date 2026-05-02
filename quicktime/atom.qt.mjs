import Atom from "./atom.mjs";

/**
 * QT atoms are an enhanced data structure that provide a more
 * general-purpose storage format and remove some of the ambiguities
 * that arise when using simple atoms. A QT atom has an expanded header;
 * the size and type fields are followed by fields for an atom ID and a
 * count of child atoms.
 *
 * This allows multiple child atoms of the same type to be specified
 * through identification numbers. It also makes it possible to parse the
 * contents of a QT atom of unknown type, by walking the tree of its
 * child atoms.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/qt_atoms_and_atom_containers}
 */
export default class QTAtom extends Atom {
    /**
     * This value must be unique among its siblings. The root atom always
     * has an atom ID value of 1.
     *
     * @type {number}
     */
    id

    /**
     * This count includes only immediate children. If this field is set
     * to 0, the atom is a leaf atom and contains only data.
     *
     * @type {number}
     */
    childCount

    getDataSize() {
        const size = super.getDataSize()
        const atomIDSize = 4
        const reservedSize = 2 + 4
        const childCountSize = 2

        return size - atomIDSize - reservedSize - childCountSize
    }
}

/**
 * QT atoms are normally wrapped in an atom container, a data structure
 * with a header containing a lock count. Each atom container contains
 * exactly one root atom, which is the QT atom. Atom containers are not
 * atoms, and are not found in the hierarchy of atoms that makes up a
 * QuickTime movie file. Atom containers may be found as data structures
 * inside some atoms, however. Examples include media input maps and
 * media property atoms.
 *
 * An atom container is NOT the same as a container atom. An atom
 * container is a container, not an atom.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/qt_atoms_and_atom_containers#QT-atom-containers}
 */
export class QTAtomContainer {
    /** @type {QTAtomContainerHeader} */
    header

    /** @type {QTAtom} */
    root
}

export class QTAtomContainerHeader {
    /**
     * 16-bit integer. Always 0.
     */
    lockCount = 0
}
