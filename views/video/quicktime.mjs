import Renderer from '../renderer.mjs'
import QuickTimeParser from '../../quicktime/parser.mjs'
import FtypAtom from '../../quicktime/atom.ftyp.mjs'
import streamToBlob from '../../utils/streamtoblob.mjs'
import Atom from '../../quicktime/atom.mjs'
import MvhdAtom from '../../quicktime/atom.mvhd.mjs'
import TkhdAtom from '../../quicktime/atom.tkhd.mjs'
import MoovAtom from '../../quicktime/atom.moov.mjs'
import Matrix from '../../quicktime/matrix.mjs'
import ElstAtom from '../../quicktime/atom.elst.mjs'
import BinaryRenderer from '../application/octet-stream.mjs'
import MdhdAtom from '../../quicktime/atom.mdhd.mjs'
import { HdlrAtom, MetaHdlrAtom } from '../../quicktime/atom.hdlr.mjs'
import VmhdAtom from '../../quicktime/atom.vmhd.mjs'

import * as QuickTimeLanguage from '../../quicktime/language.mjs'
import * as QuickTimeGraphicsMode from '../../quicktime/graphicsmode.mjs'
import TfhdAtom from '../../quicktime/atom.tfhd.mjs'
import MfhdAtom from '../../quicktime/atom.mfhd.mjs'
import TfdtAtom from '../../quicktime/atom.tfdt.mjs'
import TrunAtom from '../../quicktime/atom.trun.mjs'
import TrexAtom from '../../quicktime/atom.trex.mjs'
import DataAtom from '../../quicktime/atom.data.mjs'
import ClefAtom from '../../quicktime/atom.clef.mjs'
import KeysAtom from '../../quicktime/atom.keys.mjs'
import StsdAtom, { VideoSampleDescription, videoSampleTypes } from '../../quicktime/atom.stsd.mjs'
import ColrAtom from '../../quicktime/atom.colr.mjs'
import SdtpAtom from '../../quicktime/atom.sdtp.mjs'

const log = console

export default class QuickTimeRenderer extends Renderer {
    /** @type {HTMLElement} */
    container

    /** @type {HTMLElement} */
    atomsContainer

    atomDetailsRenderers = {}

    Parser = QuickTimeParser

    constructor() {
        super()

        const div = document.createElement('div')
        div.innerHTML = `<video style="width: 100%; max-width: 640px;" controls></video>`

        this.container = div

        this.atomDetailsRenderers['ftyp'] = this.renderFtypAtomDetails.bind(this)
        this.atomDetailsRenderers['data'] = this.renderDataAtomDetails.bind(this)
        this.atomDetailsRenderers['mvhd'] = this.renderMvhdAtomDetails.bind(this)
        this.atomDetailsRenderers['mdhd'] = this.renderMdhdAtomDetails.bind(this)
        this.atomDetailsRenderers['tkhd'] = this.renderTkhdAtomDetails.bind(this)
        this.atomDetailsRenderers['tfhd'] = this.renderTfhdAtomDetails.bind(this)
        this.atomDetailsRenderers['mfhd'] = this.renderMfhdAtomDetails.bind(this)
        this.atomDetailsRenderers['tfdt'] = this.renderTfdtAtomDetails.bind(this)
        this.atomDetailsRenderers['trex'] = this.renderTrexAtomDetails.bind(this)
        this.atomDetailsRenderers['trun'] = this.renderTrunAtomDetails.bind(this)
        this.atomDetailsRenderers['vmhd'] = this.renderVmhdAtomDetails.bind(this)
        this.atomDetailsRenderers['hdlr'] = this.renderHandlerAtomDetails.bind(this)
        this.atomDetailsRenderers['clef'] = this.renderClefAtomDetails.bind(this)
        this.atomDetailsRenderers['prof'] = this.renderClefAtomDetails.bind(this)
        this.atomDetailsRenderers['enof'] = this.renderClefAtomDetails.bind(this)
        this.atomDetailsRenderers['elst'] = this.renderElstAtomDetails.bind(this)
        this.atomDetailsRenderers['keys'] = this.renderKeysAtomDetails.bind(this)
        this.atomDetailsRenderers['colr'] = this.renderColrAtomDetails.bind(this)
        this.atomDetailsRenderers['sdtp'] = this.renderSdtpAtomDetails.bind(this)
        // this.atomDetailsRenderers['stsd'] = this.renderStsdAtomDetails.bind(this)
        
        for (const type of videoSampleTypes) {
            this.atomDetailsRenderers[type] = this.renderVideoSampleDescriptionDetails.bind(this)
        }
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>|Blob} blobOrStream
     */
    render(blobOrStream) {
        if (blobOrStream instanceof Blob) {
            this.renderBlob(blobOrStream)
        }
        else if (blobOrStream instanceof ReadableStream) {
            this.renderStream(blobOrStream)
        }
        else {
            throw new TypeError('blobOrStream must be ReadableStream or Blob')
        }

        return this.container
    }

    /**
     * @param {Blob} blob
     */
    async renderBlob(blob) {
        return Promise.all([
            this.loadAndPlayVideo(blob),
            this.parse(blob.stream())
        ])
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>} stream
     */
    async renderStream(stream) {
        const [stream1, stream2] = stream.tee()

        return Promise.all([
            streamToBlob(stream1).then(blob => this.loadAndPlayVideo(blob)),
            this.parse(stream2)
        ])
    }

    /**
     * @param {Blob} blob
     */
    async loadAndPlayVideo(blob) {
        /** @type {HTMLVideoElement} */
        const video = this.container.querySelector('video')

        const canPlay = function () {
            video.play()
            video.removeEventListener('canplay', canPlay)
        }

        video.addEventListener('canplay', canPlay)
        video.src = URL.createObjectURL(blob)
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>} stream
     */
    async parse(stream) {
        const Parser = this.Parser
        const scanner = new Parser()
        scanner.init(stream)
        const atoms = []

        for await (const atom of scanner) {
            log.debug(atom)
            atoms.push(atom)
        }

        const atomsContainer = document.createElement('div')
        atomsContainer.classList.add('atoms')

        for (const atom of atoms) {
            const atomDiv = this.renderAtom(atom)
            atomsContainer.appendChild(atomDiv)
        }

        if (this.atomsContainer) {
            this.container.removeChild(this.atomsContainer)
        }

        this.container.appendChild(atomsContainer)
        this.atomsContainer = atomsContainer
    }

    /**
     * @param {Atom} atom
     */
    renderAtom(atom) {
        const childrenDiv = document.createElement('div')
        childrenDiv.classList.add('children')

        for (const child of atom.children) {
            childrenDiv.appendChild(this.renderAtom(child))
        }

        const atomDetails = document.createElement('details')
        atomDetails.classList.add('atom')
        atomDetails.style.padding = '0.5em'
        atomDetails.style.marginTop = '0.5em'
        atomDetails.style.border = '1px solid black'
        atomDetails.style.textAlign = 'left'
        atomDetails.open = false

        atomDetails.innerHTML = `<summary>
            ${atom.type} [${atom.typeBytes.join(', ')}], ${atom.size || atom.extendedSize} bytes
        </summary>`

        this.renderAtomDetails(atom, atomDetails)

        atomDetails.appendChild(childrenDiv)

        return atomDetails
    }

    /**
     * @param {Atom} atom
     * @param {HTMLElement} atomDiv
     */
    renderHandlerAtomDetails(atom, atomDiv) {
        if (atom instanceof MetaHdlrAtom) {
            this.renderMetaHdlrAtomDetails(atom, atomDiv)
        }
        else {
            this.renderHdlrAtomDetails(atom, atomDiv)
        }
    }

    /**
     * @param {Atom} atom
     * @param {HTMLElement} atomDiv
     */
    renderAtomDetails(atom, atomDiv) {
        const fn = this.atomDetailsRenderers[atom.type]
        
        if (fn) {
            fn(atom, atomDiv)
        }

        if (atom.data != null) {
            const binaryRenderer = new BinaryRenderer()
            const hex = binaryRenderer.render(atom.data)
            hex.style.marginTop = '0.5em'
            atomDiv.appendChild(hex)
        }
    }

    /**
     * @param {DataAtom} atom
     * @param {HTMLElement} atomDiv
     */
    renderDataAtomDetails(atom, atomDiv) {
        const details = document.createElement('div')
        details.style.marginTop = '0.5em'

        details.innerHTML = `
            ${atom.isString() ? atom.getStringValue() : ''}
        `

        atomDiv.appendChild(details)
    }

    /**
     * @param {FtypAtom} atom
     * @param {HTMLElement} atomDiv
     */
    renderFtypAtomDetails(atom, atomDiv) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        details.innerHTML = `
            <tr>
                <th scope="row">Major brand</th>
                <td>${atom.getMajorBrandString()}</td>
            </tr>
            <tr>
                <th scope="row">Minor version</th>
                <td>${atom.getMinorVersionString()}</td>
            </tr>
            <tr>
                <th scope="row">Compatible brands</th>
                <td>${atom.getCompatibleBrandsString()}</td>
            </tr>
        `

        atomDiv.appendChild(details)
    }

    /**
     * @param {MetaHdlrAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderMetaHdlrAtomDetails(atom, atomElem) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        details.innerHTML = `<table>
            <tr>
                <th scope="row">Version</th>
                <td>${atom.version()}</td>
            </tr>
            <tr>
                <th scope="row">Flags</th>
                <td>0x${atom.flags().toString(16).padStart(6, '0')}</td>
            </tr>
            <tr>
                <th scope="row">Handler name</th>
                <td>${atom.componentName}</td>
            </tr>
            <tr>
                <th scope="row">Handler type</th>
                <td>${atom.handlerType()}</td>
            </tr>
        </table>`

        atomElem.appendChild(details)
    }

    /**
     * @param {VmhdAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderVmhdAtomDetails(atom, atomElem) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        details.innerHTML = `<table>
            <tr>
                <th scope="row">Version</th>
                <td>${atom.version()}</td>
            </tr>
            <tr>
                <th scope="row">Flags</th>
                <td>
                    <label>
                        <input type="checkbox" ${atom.noLeanAhead() ? 'checked' : ''} disabled>
                        No lean ahead
                    </label>
                </td>
            </tr>
            <tr>
                <th scope="row">Graphics mode</th>
                <td>
                    ${QuickTimeGraphicsMode.modeString(atom.graphicsMode)}
                    [0x${atom.graphicsMode.toString(16).padStart(4, '0')}]
                </td>
            </tr>
            <tr>
                <th scope="row">Opcolor</th>
                <td>
                    <label>
                        <input type="color" value="#${atom.opcolor.hex()}" disabled>
                        R: ${atom.opcolor.red}
                        G: ${atom.opcolor.green}
                        B: ${atom.opcolor.blue}
                        [0x${atom.opcolor.hex()}]
                    </label>
                </td>
            </tr>
        </table>`

        atomElem.appendChild(details)
    }

    /**
     * @param {HdlrAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderHdlrAtomDetails(atom, atomElem) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        details.innerHTML = `<table>
            <tr>
                <th scope="row">Version</th>
                <td>${atom.version()}</td>
            </tr>
            <tr>
                <th scope="row">Flags</th>
                <td>0x${atom.flags().toString(16).padStart(6, '0')}</td>
            </tr>
            <tr>
                <th scope="row">Component name</th>
                <td>${atom.componentName}</td>
            </tr>
            <tr>
                <th scope="row">Component type</th>
                <td>${atom.componentType}</td>
            </tr>
            <tr>
                <th scope="row">Component subtype</th>
                <td>${atom.componentSubtype}</td>
            </tr>
            <tr>
                <th scope="row">Component manufacturer</th>
                <td>${atom.componentManufacturer}</td>
            </tr>
            <tr>
                <th scope="row">Component flags</th>
                <td>0x${atom.componentFlags.toString(16).padStart(8, '0')}</td>
            </tr>
            <tr>
                <th scope="row">Component flags mask</th>
                <td>0x${atom.componentFlagsMask.toString(16).padStart(8, '0')}</td>
            </tr>
        </table>`

        atomElem.appendChild(details)
    }

    /**
     * @param {TrunAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderTrunAtomDetails(atom, atomElem) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        const samplesTable = document.createElement('table')
        samplesTable.innerHTML = `<tr>
            <th></th>
            <th scope="col">Duration</th>
            <th scope="col">Size</th>
            <th scope="col">Flags</th>
            <th scope="col">Composition time offset</th>
        </tr>`

        details.innerHTML = `<table>
            <tr>
                <th scope="row">Version</th>
                <td>${atom.version()}</td>
            </tr>
            <tr>
                <th scope="row">Flags</th>
                <td>
                    <label>
                        <input type="checkbox" disabled ${atom.dataOffsetPresent() ? 'checked' : ''}>
                        Data offset present
                    </label>
                    <br>

                    <label>
                        <input type="checkbox" disabled ${atom.firstSampleFlagsPresent() ? 'checked' : ''}>
                        First sample flags present
                    </label>
                    <br>

                    <label>
                        <input type="checkbox" disabled ${atom.sampleDurationPresent() ? 'checked' : ''}>
                        Sample duration present
                    </label>
                    <br>

                    <label>
                        <input type="checkbox" disabled ${atom.sampleSizePresent() ? 'checked' : ''}>
                        Sample size present
                    </label>
                    <br>

                    <label>
                        <input type="checkbox" disabled ${atom.sampleFlagsPresent() ? 'checked' : ''}>
                        Sample flags present
                    </label>
                    <br>

                    <label>
                        <input type="checkbox" disabled ${atom.sampleCompositionTimeOffsetsPresent() ? 'checked' : ''}>
                        Sample composition time offsets present
                    </label>
                    <br>
                </td>
            </tr>
            <tr>
                <th scope="row">Data offset</th>
                <td>${atom.dataOffsetPresent() ? '0x'+atom.dataOffset.toString(16).padStart(8, '0') : 'Undefined'}</td>
            </tr>
            <tr>
                <th scope="row">First sample flags</th>
                <td>${atom.firstSampleFlagsPresent() ? '0x'+atom.firstSampleFlags.toString(16).padStart(8, '0') : 'Undefined'}</td>
            </tr>
            <tr>
                <th scope="row">Samples</th>
                <td>${atom.samples.length}</td>
            </tr>
        </table>`

        for (let i = 0; i < atom.samples.length; i++) {
            const sample = atom.samples[i]
            const row = document.createElement('tr')
            row.innerHTML = `
                <th scope="row">${i+1}</th>
                <td>${atom.sampleDurationPresent() ? sample.duration : 'Undefined'}</td>
                <td>${atom.sampleSizePresent() ? sample.size + ' bytes' : 'Undefined'}</td>
                <td>${atom.sampleFlagsPresent() ? '0x'+sample.flags.toString(16).padStart(8, '0') : 'Undefined'}</td>
                <td>${atom.sampleCompositionTimeOffsetsPresent() ? sample.compositionTimeOffset : 'Undefined'}</td>
            `
            samplesTable.appendChild(row)
        }

        atomElem.appendChild(details)
        atomElem.appendChild(samplesTable)
    }

    /**
     * @param {StsdAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderStsdAtomDetails(atom, atomElem) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        const entriesTable = document.createElement('table')
        entriesTable.innerHTML = `<tr>
            <th></th>
            <th scope="col">Format</th>
            <th scope="col">Reference index</th>
            <th scope="col">Data</th>
        </tr>`

        details.innerHTML = `<table>
            <tr>
                <th scope="row">Version</th>
                <td>${atom.version()}</td>
            </tr>
            <tr>
                <th scope="row">Flags</th>
                <td>0x${atom.flags().toString(16).padStart(6, '0')}</td>
            </tr>
        </table>`

        for (let i = 0; i < atom.sampleDescriptions.length; i++) {
            const desc = atom.sampleDescriptions[i]
            const row = document.createElement('tr')
            const binaryRenderer = new BinaryRenderer()
            const hex = binaryRenderer.render(desc.data)

            const dataCell = document.createElement('td')
            dataCell.appendChild(hex)

            row.innerHTML = `
                <th scope="row">${i+1}</th>
                <td>${desc.dataFormat}</td>
                <td>${desc.dataReferenceIndex}</td>
            `
            row.appendChild(dataCell)
            entriesTable.appendChild(row)
        }

        atomElem.appendChild(details)
        atomElem.appendChild(entriesTable)
    }

    /**
     * @param {VideoSampleDescription} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderVideoSampleDescriptionDetails(atom, atomElem) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        details.innerHTML = `<table style="margin-top: 0.5em;">
            <tr>
                <th scope="row">Version</th>
                <td>${atom.version}</td>
            </tr>
            <tr>
                <th scope="row">Revision level</th>
                <td>${atom.revisionLevel}</td>
            </tr>
            <tr>
                <th scope="row">Vendor</th>
                <td>${atom.vendor}</td>
            </tr>
            <tr>
                <th scope="row">Temporal quality</th>
                <td>${atom.temporalQuality}</td>
            </tr>
            <tr>
                <th scope="row">Spatial quality</th>
                <td>${atom.spatialQuality}</td>
            </tr>
            <tr>
                <th scope="row">Width</th>
                <td>${atom.width}</td>
            </tr>
            <tr>
                <th scope="row">Height</th>
                <td>${atom.height}</td>
            </tr>
            <tr>
                <th scope="row">Horizontal resolution</th>
                <td>${atom.horizontalResolution} pixels per inch</td>
            </tr>
            <tr>
                <th scope="row">Vertical resolution</th>
                <td>${atom.verticalResolution} pixels per inch</td>
            </tr>
            <tr>
                <th scope="row">Data size</th>
                <td>${atom.dataSize}</td>
            </tr>
            <tr>
                <th scope="row">Frame count</th>
                <td>${atom.frameCount}</td>
            </tr>
            <tr>
                <th scope="row">Compressor name</th>
                <td>${atom.compressorName}</td>
            </tr>
            <tr>
                <th scope="row">Depth</th>
                <td>${atom.depth}</td>
            </tr>
            <tr>
                <th scope="row">Color table ID</th>
                <td>${atom.colorTableID}</td>
            </tr>
        </table>`

        atomElem.appendChild(details)
    }

    /**
     * @param {ColrAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderColrAtomDetails(atom, atomElem) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        details.innerHTML = `<table style="margin-top: 0.5em;">
            <tr>
                <th scope="row">Color parameter type</th>
                <td>${atom.colorParameterType}</td>
            </tr>
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
        </table>`

        atomElem.appendChild(details)
    }

    /**
     * @param {SdtpAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderSdtpAtomDetails(atom, atomElem) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        details.innerHTML = `<table>
            <tr>
                <th scope="row">Version</th>
                <td>${atom.version()}</td>
            </tr>
            <tr>
                <th scope="row">Flags</th>
                <td>0x${atom.flags().toString(16).padStart(6, '0')}</td>
            </tr>
        </table>`

        atomElem.appendChild(details)

        const entriesTable = document.createElement('table')
        entriesTable.innerHTML = `<tr>
            <th></th>
            <th>Earlier display time allowed</th>
            <th>Sample does not depend on others</th>
            <th>Sample depends on others</th>
            <th>No other sample depends on this sample</th>
            <th>Other samples depend on this sample</th>
            <th>There is no redundant coding in this sample</th>
            <th>There is redundant coding in this sample</th>
        </tr>`

        for (let i = 0; i < atom.sampleFlags.length && i < 10; i++) {
            const flags = atom.sampleFlags[i]
            const row = document.createElement('tr')
            row.innerHTML = `
                <th scope="row">${i+1}</th>
                <td>
                    <input type="checkbox" disabled ${flags.earlierDisplayTimeAllowed ? 'checked' : ''}>
                </td>
                <td>
                    <input type="checkbox" disabled ${flags.sampleDoesNotDependOnOthers ? 'checked' : ''}>
                </td>
                <td>
                    <input type="checkbox" disabled ${flags.sampleDependsOnOthers ? 'checked' : ''}>
                </td>
                <td>
                    <input type="checkbox" disabled ${flags.noOtherSampleDependsOnThisSample ? 'checked' : ''}>
                </td>
                <td>
                    <input type="checkbox" disabled ${flags.otherSamplesDependOnThisSample ? 'checked' : ''}>
                </td>
                <td>
                    <input type="checkbox" disabled ${flags.thereIsNoRedundantCodingInThisSample ? 'checked' : ''}>
                </td>
                <td>
                    <input type="checkbox" disabled ${flags.thereIsRedundantCodingInThisSample ? 'checked' : ''}>
                </td>
            `
            entriesTable.appendChild(row)
        }

        atomElem.appendChild(entriesTable)
        
        if (atom.sampleFlags.length >= 10) {
            const others = document.createElement('p')
            others.innerText = (atom.sampleFlags.length - 10) + ' more samples'
            atomElem.appendChild(others)
        }
    }

    /**
     * @param {KeysAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderKeysAtomDetails(atom, atomElem) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        const entriesTable = document.createElement('table')
        entriesTable.innerHTML = `<tr>
            <th></th>
            <th scope="col">Namespace</th>
            <th scope="col">Value</th>
        </tr>`

        details.innerHTML = `<table>
            <tr>
                <th scope="row">Version</th>
                <td>${atom.version()}</td>
            </tr>
            <tr>
                <th scope="row">Flags</th>
                <td>0x${atom.flags().toString(16).padStart(6, '0')}</td>
            </tr>
        </table>`

        for (let i = 0; i < atom.keys.length; i++) {
            const key = atom.keys[i]
            const row = document.createElement('tr')
            row.innerHTML = `
                <th scope="row">${i+1}</th>
                <td>${key.namespace}</td>
                <td>${key.value}</td>
            `
            entriesTable.appendChild(row)
        }

        atomElem.appendChild(details)
        atomElem.appendChild(entriesTable)
    }

    /**
     * @param {ElstAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderElstAtomDetails(atom, atomElem) {
        /** @type {MoovAtom} */
        const moov = atom.findParentByType('moov')
        /** @type {MvhdAtom} */
        const mvhd = moov.findByType('mvhd')

        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        const entriesTable = document.createElement('table')
        entriesTable.innerHTML = `<tr>
            <th></th>
            <th scope="col">Duration</th>
            <th scope="col">Media time</th>
            <th scope="col">Media rate</th>
        </tr>`

        details.innerHTML = `<table>
            <tr>
                <th scope="row">Version</th>
                <td>${atom.version()}</td>
            </tr>
            <tr>
                <th scope="row">Flags</th>
                <td>0x${atom.flags().toString(16).padStart(6, '0')}</td>
            </tr>
        </table>`

        for (let i = 0; i < atom.entries.length; i++) {
            const entry = atom.entries[i]
            const row = document.createElement('tr')
            row.innerHTML = `
                <th scope="row">${i+1}</th>
                <td>${entry.trackDuration / mvhd.timeScale}s</td>
                <td>${entry.mediaTime / mvhd.timeScale}s</td>
                <td>${entry.mediaRate}x</td>
            `
            entriesTable.appendChild(row)
        }

        atomElem.appendChild(details)
        atomElem.appendChild(entriesTable)
    }

    /**
     * @param {TfhdAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderTfhdAtomDetails(atom, atomElem) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        details.innerHTML = `<table>
            <tr>
                <th scope="row">Version</th>
                <td>${atom.version()}</td>
            </tr>
            <tr>
                <th scope="row">Flags</th>
                <td>
                    <label>
                        <input type="checkbox" disabled ${atom.baseDataOffsetPresent() ? 'checked' : ''}>
                        Base data offset present
                    </label>
                    <br>

                    <label>
                        <input type="checkbox" disabled ${atom.sampleDescriptionIndexPresent() ? 'checked' : ''}>
                        Sample description index present
                    </label>
                    <br>

                    <label>
                        <input type="checkbox" disabled ${atom.defaultSampleDurationPresent() ? 'checked' : ''}>
                        Default sample duration present
                    </label>
                    <br>

                    <label>
                        <input type="checkbox" disabled ${atom.defaultSampleSizePresent() ? 'checked' : ''}>
                        Default sample size present
                    </label>
                    <br>

                    <label>
                        <input type="checkbox" disabled ${atom.defaultSampleFlagsPresent() ? 'checked' : ''}>
                        Default sample flags present
                    </label>
                    <br>

                    <label>
                        <input type="checkbox" disabled ${atom.durationIsEmpty() ? 'checked' : ''}>
                        Duration is empty
                    </label>
                    <br>

                    <label>
                        <input type="checkbox" disabled ${atom.defaultBaseIsMoof() ? 'checked' : ''}>
                        Default base is moof
                    </label>
                </td>
            </tr>
            <tr>
                <th scope="row">Track ID</th>
                <td>${atom.id}</td>
            </tr>
            <tr>
                <th scope="row">Base data offset</th>
                <td>${atom.baseDataOffsetPresent() ? '0x'+atom.baseDataOffset.toString(16).padStart(16, '0') : 'Undefined'}</td>
            </tr>
            <tr>
                <th scope="row">Sample description index</th>
                <td>${atom.sampleDescriptionIndexPresent() ? atom.sampleDescriptionIndexPresent : 'Undefined'}</td>
            </tr>
            <tr>
                <th scope="row">Default sample duration</th>
                <td>${atom.defaultSampleDurationPresent() ? atom.defaultSampleDuration : 'Undefined'}</td>
            </tr>
            <tr>
                <th scope="row">Default sample size</th>
                <td>${atom.defaultSampleSizePresent() ? atom.defaultSampleSize + ' bytes' : 'Undefined'}</td>
            </tr>
            <tr>
                <th scope="row">Default sample flags</th>
                <td>${atom.defaultSampleFlagsPresent() ? '0x'+atom.defaultSampleFlags.toString(16).padStart(8, '0') : 'Undefined'}</td>
            </tr>
        </table>`

        atomElem.appendChild(details)
    }

    /**
     * @param {ClefAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderClefAtomDetails(atom, atomElem) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        details.innerHTML = `<table>
            <tr>
                <th scope="row">Version</th>
                <td>${atom.version()}</td>
            </tr>
            <tr>
                <th scope="row">Flags</th>
                <td>0x${atom.flags().toString(16).padStart(8, '0')}</td>
            </tr>
            <tr>
                <th scope="row">Width</th>
                <td>${atom.width}</td>
            </tr>
            <tr>
                <th scope="row">Height</th>
                <td>${atom.height}</td>
            </tr>
        </table>`

        atomElem.appendChild(details)
    }

    /**
     * @param {TkhdAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderTkhdAtomDetails(atom, atomElem) {
        /** @type {MoovAtom} */
        const moov = atom.findParentByType('moov')
        /** @type {MvhdAtom} */
        const mvhd = moov.findByType('mvhd')
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        details.innerHTML = `<table>
            <tr>
                <th scope="row">Version</th>
                <td>${atom.version()}</td>
            </tr>
            <tr>
                <th scope="row">Flags</th>
                <td>
                    <label>
                        <input type="checkbox" disabled ${atom.trackEnabled() ? 'checked' : ''}>
                        Track enabled
                    </label>
                    <br>

                    <label>
                        <input type="checkbox" disabled ${atom.trackInMovie() ? 'checked' : ''}>
                        Track in movie
                    </label>
                    <br>

                    <label>
                        <input type="checkbox" disabled ${atom.trackInPreview() ? 'checked' : ''}>
                        Track in preview
                    </label>
                    <br>

                    <label>
                        <input type="checkbox" disabled ${atom.trackInPoster() ? 'checked' : ''}>
                        Track in poster
                    </label>
                    <br>
                </td>
            </tr>
            <tr>
                <th scope="row">Creation time</th>
                <td>${atom.creationTime.toLocaleString()}</td>
            </tr>
            <tr>
                <th scope="row">Modification time</th>
                <td>${atom.modificationTime.toLocaleString()}</td>
            </tr>
            <tr>
                <th scope="row">Track ID</th>
                <td>${atom.id}</td>
            </tr>
            <tr>
                <th scope="row">Duration</th>
                <td>${atom.duration / mvhd.timeScale}s</td>
            </tr>
            <tr>
                <th scope="row">Layer</th>
                <td>${atom.layer}</td>
            </tr>
            <tr>
                <th scope="row">Alternate group</th>
                <td>${atom.alternateGroup}</td>
            </tr>
            <tr>
                <th scope="row">Volume</th>
                <td>${atom.volume * 100}%</td>
            </tr>
            <tr>
                <th scope="row">Matrix</th>
                <td>${this.renderMatrix(atom.matrix)}</td>
            </tr>
            <tr>
                <th scope="row">Width</th>
                <td>${atom.width}</td>
            </tr>
            <tr>
                <th scope="row">Height</th>
                <td>${atom.height}</td>
            </tr>
        </table>`

        atomElem.appendChild(details)
    }

    /**
     * @param {MdhdAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderMdhdAtomDetails(atom, atomElem) {
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
            <tr>
                <th scope="row">Creation time</th>
                <td>${atom.creationTime.toLocaleString()}</td>
            </tr>
            <tr>
                <th scope="row">Modification time</th>
                <td>${atom.modificationTime.toLocaleString()}</td>
            </tr>
            <tr>
                <th scope="row">Time scale</th>
                <td>${atom.timeScale}</td>
            </tr>
            <tr>
                <th scope="row">Duration</th>
                <td>${atom.duration / atom.timeScale}s</td>
            </tr>
            <tr>
                <th scope="row">Language</th>
                <td>
                    ${QuickTimeLanguage.isMacintoshLanguageCode(atom.language)
                    ? QuickTimeLanguage.getMacintoshLanguageCode(atom.language)
                    : QuickTimeLanguage.getISOLanguageCode(atom.language)
                    }
                    [0x${atom.language.toString(16).padStart(4, '0')}]
                </td>
            </tr>
            <tr>
                <th scope="row">Quality</th>
                <td>${atom.quality}</td>
            </tr>
        `

        atomElem.appendChild(details)
    }

    /**
     * @param {TrexAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderTrexAtomDetails(atom, atomElem) {
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
            <tr>
                <th scope="row">id</th>
                <td>${atom.id}</td>
            </tr>
            <tr>
                <th scope="row">Default sample description index</th>
                <td>${atom.defaultSampleDescriptionIndex}</td>
            </tr>
            <tr>
                <th scope="row">Default sample duration</th>
                <td>${atom.defaultSampleDuration}</td>
            </tr>
            <tr>
                <th scope="row">Default sample size</th>
                <td>${atom.defaultSampleSize}</td>
            </tr>
            <tr>
                <th scope="row">Default sample flags</th>
                <td>0x${atom.defaultSampleFlags.toString(16).padStart(6, '0')}</td>
            </tr>
        `

        atomElem.appendChild(details)
    }

    /**
     * @param {TfdtAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderTfdtAtomDetails(atom, atomElem) {
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
            <tr>
                <th scope="row">Base media decode time</th>
                <td>${atom.baseMediaDecodeTime}</td>
            </tr>
        `

        atomElem.appendChild(details)
    }

    /**
     * @param {MfhdAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderMfhdAtomDetails(atom, atomElem) {
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
            <tr>
                <th scope="row">Sequence number</th>
                <td>${atom.sequenceNumber}</td>
            </tr>
        `

        atomElem.appendChild(details)
    }

    /**
     * @param {MvhdAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    renderMvhdAtomDetails(atom, atomElem) {
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
            <tr>
                <th scope="row">Creation time</th>
                <td>${atom.creationTime.toLocaleString()}</td>
            </tr>
            <tr>
                <th scope="row">Modification time</th>
                <td>${atom.modificationTime.toLocaleString()}</td>
            </tr>
            <tr>
                <th scope="row">Time scale</th>
                <td>${atom.timeScale}</td>
            </tr>
            <tr>
                <th scope="row">Duration</th>
                <td>${atom.duration / atom.timeScale}s</td>
            </tr>
            <tr>
                <th scope="row">Preferred rate</th>
                <td>${atom.preferredRate}x</td>
            </tr>
            <tr>
                <th scope="row">Preferred volume</th>
                <td>${atom.preferredVolume * 100}%</td>
            </tr>
            <tr>
                <th scope="row">Matrix structure</th>
                <td>${this.renderMatrix(atom.matrixStructure)}</td>
            </tr>
            <tr>
                <th scope="row">Preview time</th>
                <td>${atom.previewTime}s</td>
            </tr>
            <tr>
                <th scope="row">Preview duration</th>
                <td>${atom.previewDuration / atom.timeScale}s</td>
            </tr>
            <tr>
                <th scope="row">Poster time</th>
                <td>${atom.posterTime}s</td>
            </tr>
            <tr>
                <th scope="row">Selection time</th>
                <td>${atom.selectionTime}s</td>
            </tr>
            <tr>
                <th scope="row">Selection duration</th>
                <td>${atom.selectionDuration / atom.timeScale}s</td>
            </tr>
            <tr>
                <th scope="row">Current time</th>
                <td>${atom.currentTime}s</td>
            </tr>
            <tr>
                <th scope="row">Next track ID</th>
                <td>${atom.nextTrackID}</td>
            </tr>
        `

        atomElem.appendChild(details)
    }

    /**
     * @param {Matrix} matrix
     */
    renderMatrix(matrix) {
        return `<math>
            <mrow>
                <mo>[</mo>
                <mtable>
                    <mtr>
                        <mtd><mn>${matrix.a}</mn></mtd>
                        <mtd><mn>${matrix.b}</mn></mtd>
                        <mtd><mn>${matrix.u}</mn></mtd>
                    </mtr>
                    <mtr>
                        <mtd><mn>${matrix.c}</mn></mtd>
                        <mtd><mn>${matrix.d}</mn></mtd>
                        <mtd><mn>${matrix.v}</mn></mtd>
                    </mtr>
                    <mtr>
                        <mtd><mn>${matrix.x}</mn></mtd>
                        <mtd><mn>${matrix.y}</mn></mtd>
                        <mtd><mn>${matrix.w}</mn></mtd>
                    </mtr>
                </mtable>
                <mo>]</mo>
            </mrow>
        </math>`
    }

    unmount() {}
}
