import MP4Parser from "../../mp4/parser.mjs";
import QuickTimeRenderer from "./quicktime.mjs";

export default class MP4Renderer extends QuickTimeRenderer {
    constructor() {
        super()

        this.Parser = MP4Parser

        this.atomDetailsRenderers['meta'] = this.renderMetaAtomDetails
    }

    /**
     * @param {MetaAtom} atom
     * @param {HTMLElement} atomDiv
     */
    renderMetaAtomDetails(atom, atomDiv) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        details.innerHTML = `
            <tr>
                <th scope="row">Version</th>
                <td>${atom.version()}</td>
            </tr>
            <tr>
                <th scope="row">Flags</th>
                <td>0x${atom.flags().toString(16).padStart(6, '0')}</td>
            </tr>
        `

        atomDiv.appendChild(details)
    }
}
