import Renderer from '../renderer.mjs'
import QuickTimeParser from '../../quicktime/parser.mjs'
import FtypAtom from '../../quicktime/atom.ftyp.mjs'
import streamToBlob from '../../utils/streamtoblob.mjs'
import Atom from '../../quicktime/atom.mjs'
import MvhdAtom from '../../quicktime/atom.mvhd.mjs'
import TkhdAtom from '../../quicktime/atom.tkhd.mjs'
import TrakAtom from '../../quicktime/atom.trak.mjs'
import MoovAtom from '../../quicktime/atom.moov.mjs'
import Matrix from '../../quicktime/matrix.mjs'
import ElstAtom from '../../quicktime/atom.elst.mjs'
import BinaryRenderer from '../application/octet-stream.mjs'
import MdhdAtom from '../../quicktime/atom.mdhd.mjs'
import { HandlerReferenceAtom, MetadataHandlerAtom } from '../../quicktime/atom.hdlr.mjs'
import VmhdAtom from '../../quicktime/atom.vmhd.mjs'

import * as QuickTimeLanguage from '../../quicktime/language.mjs'
import * as QuickTimeGraphicsMode from '../../quicktime/graphicsmode.mjs'
import TfhdAtom from '../../quicktime/atom.tfhd.mjs'
import MfhdAtom from '../../quicktime/atom.mfhd.mjs'
import TfdtAtom from '../../quicktime/atom.tfdt.mjs'
import TrunAtom from '../../quicktime/atom.trun.mjs'

const log = console

export default class QuickTimeRenderer extends Renderer {
    /** @type {HTMLElement} */
    #container

    /** @type {HTMLElement} */
    #atomsContainer

    constructor() {
        super()

        const div = document.createElement('div')
        div.innerHTML = `<video style="width: 100%;" controls></video>`

        this.#container = div
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>|Blob} blobOrStream
     */
    render(blobOrStream) {
        if (blobOrStream instanceof Blob) {
            this.#renderBlob(blobOrStream)
        }
        else if (blobOrStream instanceof ReadableStream) {
            this.#renderStream(blobOrStream)
        }
        else {
            throw new TypeError('blobOrStream must be ReadableStream or Blob')
        }

        return this.#container
    }

    /**
     * @param {Blob} blob
     */
    async #renderBlob(blob) {
        return Promise.all([
            this.#loadAndPlayVideo(blob),
            this.#parse(blob.stream())
        ])
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>} stream
     */
    async #renderStream(stream) {
        const [stream1, stream2] = stream.tee()

        return Promise.all([
            streamToBlob(stream1).then(blob => this.#loadAndPlayVideo(blob)),
            this.#parse(stream2)
        ])
    }

    /**
     * @param {Blob} blob
     */
    async #loadAndPlayVideo(blob) {
        /** @type {HTMLVideoElement} */
        const video = this.#container.querySelector('video')

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
    async #parse(stream) {
        const scanner = new QuickTimeParser()
        scanner.init(stream)
        const atoms = []

        for await (const atom of scanner) {
            log.debug(atom)
            atoms.push(atom)
        }

        const atomsContainer = document.createElement('div')
        atomsContainer.classList.add('atoms')

        for (const atom of atoms) {
            const atomDiv = this.#renderAtom(atom)
            atomsContainer.appendChild(atomDiv)
        }

        if (this.#atomsContainer) {
            this.#container.removeChild(this.#atomsContainer)
        }

        this.#container.appendChild(atomsContainer)
        this.#atomsContainer = atomsContainer
    }

    /**
     * @param {Atom} atom
     */
    #renderAtom(atom) {
        const childrenDiv = document.createElement('div')
        childrenDiv.classList.add('children')

        for (const child of atom.children) {
            childrenDiv.appendChild(this.#renderAtom(child))
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

        this.#renderAtomDetails(atom, atomDetails)

        atomDetails.appendChild(childrenDiv)

        return atomDetails
    }


    /**
     * @param {Atom} atom
     * @param {HTMLElement} atomDiv
     */
    #renderAtomDetails(atom, atomDiv) {
        switch (atom.type) {
            case 'ftyp':
                this.#renderFtypAtomDetails(atom, atomDiv)
                break

            case 'mvhd':
                this.#renderMvhdAtomDetails(atom, atomDiv)
                break

            case 'mdhd':
                this.#renderMdhdAtomDetails(atom, atomDiv)
                break

            case 'tkhd':
                this.#renderTkhdAtomDetails(atom, atomDiv)
                break

            case 'tfhd':
                this.#renderTfhdAtomDetails(atom, atomDiv)
                break

            case 'mfhd':
                this.#renderMfhdAtomDetails(atom, atomDiv)
                break

            case 'tfdt':
                this.#renderTfdtAtomDetails(atom, atomDiv)
                break

            case 'elst':
                this.#renderElstAtomDetails(atom, atomDiv)
                break

            case 'trun':
                this.#renderTrunAtomDetails(atom, atomDiv)
                break

            case 'vmhd':
                this.#renderVmhdAtomDetails(atom, atomDiv)
                break

            case 'hdlr':
                if (atom instanceof HandlerReferenceAtom) {
                    this.#renderHandlerReferenceAtomDetails(atom, atomDiv)
                }
                else if (atom instanceof MetadataHandlerAtom) {
                    this.#renderMetadataHandlerAtomDetails(atom, atomDiv)
                }
                break

            default:
                if (atom.data != null) {
                    const binaryRenderer = new BinaryRenderer()
                    const hex = binaryRenderer.render(atom.data)
                    atomDiv.appendChild(hex)
                }

                break
        }
    }

    /**
     * @param {FtypAtom} atom
     * @param {HTMLElement} atomDiv
     */
    #renderFtypAtomDetails(atom, atomDiv) {
        const details = document.createElement('table')
        details.style.marginTop = '0.5em'

        details.innerHTML = `
            <tr>
                <th scope="row">Major brand</th>
                <td>${atom.majorBrand}</td>
            </tr>
            <tr>
                <th scope="row">Minor brand</th>
                <td>${atom.minorBrand}</td>
            </tr>
            <tr>
                <th scope="row">Compatible brand</th>
                <td>${atom.compatibleBrands.join(', ')}</td>
            </tr>
        `

        atomDiv.appendChild(details)
    }

    /**
     * @param {MetadataHandlerAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    #renderMetadataHandlerAtomDetails(atom, atomElem) {
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
                <td>${atom.name}</td>
            </tr>
            <tr>
                <th scope="row">Handler type</th>
                <td>${atom.handlerType}</td>
            </tr>
        </table>`

        atomElem.appendChild(details)
    }

    /**
     * @param {VmhdAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    #renderVmhdAtomDetails(atom, atomElem) {
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
     * @param {HandlerReferenceAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    #renderHandlerReferenceAtomDetails(atom, atomElem) {
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
    #renderTrunAtomDetails(atom, atomElem) {
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
                <th scope="col">${i+1}</th>
                <th scope="col">${atom.sampleDurationPresent() ? sample.duration : 'Undefined'}</th>
                <th scope="col">${atom.sampleSizePresent() ? sample.size + ' bytes' : 'Undefined'}</th>
                <th scope="col">${atom.sampleFlagsPresent() ? '0x'+sample.flags.toString(16).padStart(8, '0') : 'Undefined'}</th>
                <th scope="col">${atom.sampleCompositionTimeOffsetsPresent() ? sample.compositionTimeOffset : 'Undefined'}</th>
            `
            samplesTable.appendChild(row)
        }

        atomElem.appendChild(details)
        atomElem.appendChild(samplesTable)
    }

    /**
     * @param {ElstAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    #renderElstAtomDetails(atom, atomElem) {
        const edts = atom.parent
        /** @type {TrakAtom} */
        const trak = edts.parent
        /** @type {MoovAtom} */
        const moov = trak.parent
        const mvhd = moov.header

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
                <th scope="col">${i+1}</th>
                <th scope="col">${entry.trackDuration / mvhd.timeScale}s</th>
                <th scope="col">${entry.mediaTime / mvhd.timeScale}s</th>
                <th scope="col">${entry.mediaRate}x</th>
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
    #renderTfhdAtomDetails(atom, atomElem) {
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
     * @param {TkhdAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    #renderTkhdAtomDetails(atom, atomElem) {
        /** @type {TrakAtom} */
        const trak = atom.parent
        /** @type {MoovAtom} */
        const moov = trak.parent
        const mvhd = moov.header
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
                <td>${this.#renderMatrix(atom.matrix)}</td>
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
    #renderMdhdAtomDetails(atom, atomElem) {
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
     * @param {TfdtAtom} atom
     * @param {HTMLDetailsElement} atomElem
     */
    #renderTfdtAtomDetails(atom, atomElem) {
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
    #renderMfhdAtomDetails(atom, atomElem) {
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
    #renderMvhdAtomDetails(atom, atomElem) {
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
                <td>${this.#renderMatrix(atom.matrixStructure)}</td>
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
    #renderMatrix(matrix) {
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
