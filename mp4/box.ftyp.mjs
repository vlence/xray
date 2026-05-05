import { brandString, ftypAtomParser } from "../quicktime/atom.ftyp.mjs";

export async function ftypBoxParser(reader, atomTemplate, scanner) {
    const box = await ftypAtomParser(reader, atomTemplate, scanner)

    box.getMinorVersionString = () => brandString(box.minorVersion)

    return box
}
