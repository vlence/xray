import Atom from './atom.mjs'
import AtomScanner, { AtomByteReader } from './atom.scanner.mjs'

/**
 * This atom is a required extension for uncompressed Y´CbCr data
 * formats. The 'colr' extension is used to map the numerical values of
 * pixels in the file to a common representation of color in which images
 * can be correctly compared, combined, and displayed. The common
 * representation is the CIE XYZ tristimulus values (defined in
 * Publication CIE No. 15.2).
 *
 * Use of a common representation also allows you to correctly map
 * between Y´CbCr and RGB color spaces and to correctly compensate for
 * gamma on different systems.
 *
 * The 'colr' extension supersedes the previously defined 'gama' Image
 * Description extension. Writers of QuickTime files should never write
 * both into an Image Description, and readers of QuickTime files should
 * ignore 'gama' if 'colr' is present.
 *
 * The 'colr' extension is designed to work for multiple imaging
 * applications such as video and print. Each application, driven by its
 * own set of historical and economic realities, has its own set of
 * parameters needed to map from pixel values to CIE XYZ.
 *
 * The CIE XYZ representation is mapped to various stored Y´CbCr formats
 * using a common set of transfer functions and matrixes. The transfer
 * function coefficients and matrix values are stored as indexes into a
 * table of canonical references. This provides support for multiple video
 * systems while limiting the scope of possible values to a set of
 * recognized standards.
 *
 * The 'colr' atom contains four fields: a color parameter type and three
 * indexes. The indexes are to a table of primaries, a table of transfer
 * function coefficients, and a table of matrixes.
 *
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/color_parameter_atom}
 */
export default class ColrAtom extends Atom {
    /**
     * @type {string}
     */
    colorParameterType

    /**
     * @type {number?}
     */
    primariesIndex

    /**
     * @type {number?}
     */
    transferFunctionIndex

    /**
     * @type {number?}
     */
    matrixIndex
}

/**
 * Parses an colr atom's data.
 *
 * @param {AtomByteReader} reader
 * @param {Atom} atomTemplate
 * @param {AtomScanner} scanner
 */
export async function colrAtomParser(reader, atomTemplate, scanner) {
    const atom = new ColrAtom()
    atom.size = atomTemplate.size
    atom.type = atomTemplate.type
    atom.typeBytes = atomTemplate.typeBytes
    atom.extendedSize = atomTemplate.extendedSize
    atom.parent = atomTemplate.parent

    atom.colorParameterType = await reader.readUtf8String(4)

    if (atom.colorParameterType == 'nclc') {
        atom.primariesIndex = await reader.readUint16()
        atom.transferFunctionIndex = await reader.readUint16()
        atom.matrixIndex = await reader.readUint16()
    }
    else {
        atom.data = await reader.readBlob(atom.getDataSize() - 4)
    }

    return atom
}
