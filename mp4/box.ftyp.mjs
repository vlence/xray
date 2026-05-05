import { brandString, ftypAtomParser } from "../quicktime/atom.ftyp.mjs";

export async function ftypBoxParser(reader, atomTemplate, scanner) {
    const atom = await ftypAtomParser(reader, atomTemplate, scanner)

    atom.getMinorVersionString = () => brandString(atom.minorVersion)

    return atom
}
