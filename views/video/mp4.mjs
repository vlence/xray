import ColrBox from "../../mp4/box.colr.mjs";
import MetaBox from "../../mp4/box.meta.mjs";
import MP4Parser from "../../mp4/parser.mjs";
import QuickTimeRenderer from "./quicktime.mjs";

export default class MP4Renderer extends QuickTimeRenderer {
    constructor() {
        super()

        this.Parser = MP4Parser

        this.atomDetailsRenderers['meta'] = this.renderMetaBoxDetails.bind(this)
        this.atomDetailsRenderers['colr'] = this.renderColrBoxDetails.bind(this)
    }

    /**
     * @param {MetaBox} atom
     * @param {HTMLElement} atomDiv
     */
    renderMetaBoxDetails(atom, atomDiv) {
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

    /**
     * @param {ColrBox} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderColrBoxDetails(atom, atomElem) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        details.innerHTML = `<table style="margin-top: 0.5em;">
            <tr>
                <th scope="row">Color parameter type</th>
                <td>${atom.colorParameterType}</td>
            </tr>`

        if ('nclx') {
            details.innerHTML += `
                <tr>
                    <th scope="row">Primaries index</th>
                    <td>${atom.primariesIndex}</td>
                </tr>
                <tr>
                    <th scope="row">Transfer function index</th>
                    <td>${atom.transferFunctionIndex}</td>
                </tr>
                <tr>
                    <th scope="row">Matrix index</th>
                    <td>${atom.matrixIndex}</td>
                </tr>
                <tr>
                    <th scope="row">Full range</th>
                    <td><input type="checkbox" ${atom.isFullRange() ? 'checked' : ''} disabled></td>
                </tr>
            `
        }

        details.innerHTML += '</table>'

        atomElem.appendChild(details)
    }
}
