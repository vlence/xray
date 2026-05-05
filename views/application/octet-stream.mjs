import Renderer from '../renderer.mjs'
import ByteReader from '../../utils/bytereader.mjs'
import * as textDecoders from '../../utils/textdecoder.mjs'

const log = console

/**
 * A BinaryRenderer renders raw binary data as 1s and 0s and
 * also as hex code. Additionally each byte is interpreted as
 * ASCII.
 */
export default class BinaryRenderer extends Renderer {
    /** @type {HTMLElement} */ 
    container

    currentPage = 0

    totalPages = 0

    bytesPerRow = 16
    
    rowsPerPage = 32

    /**
     * @type {Uint8Array<ArrayBuffer>[]}
     */
    dataRows = []

    /**
     * @type {HTMLTableRowElement[]}
     */
    tableRows = []

    /**
     * @type {HTMLElement}
     */
    tbody

    /**
     * @type {HTMLButtonElement}
     */
    prevBtn

    /**
     * @type {HTMLButtonElement}
     */
    nextBtn

    /**
     * @type {HTMLInputElement}
     */
    pageInput

    constructor() {
        super()

        const div = document.createElement('div')

        const pageNav = document.createElement('nav')
        const prevBtn = document.createElement('button')
        const nextBtn = document.createElement('button')
        const pageInput = document.createElement('input')

        const table = document.createElement('table')
        const thead = document.createElement('thead')
        const tbody = document.createElement('tbody')

        for (let i = 0; i < this.rowsPerPage; i++) {
            const tr = document.createElement('tr')
            tr.innerHTML = `<th class="offset" scope="row"></th><td class="hex"></td><td class="ascii"></td>`

            this.tableRows.push(tr)
        }

        prevBtn.innerText = 'Prev'
        nextBtn.innerText = 'Next'
        prevBtn.disabled = true
        nextBtn.disabled = true

        prevBtn.addEventListener('click', () => this.prevPage())
        nextBtn.addEventListener('click', () => this.nextPage())

        pageInput.type = 'number'
        pageInput.min = '1'
        pageInput.addEventListener('change', () => this.jumpToPage())

        pageNav.appendChild(prevBtn)
        pageNav.appendChild(pageInput)
        pageNav.appendChild(nextBtn)

        this.prevBtn = prevBtn
        this.nextBtn = nextBtn
        this.pageInput = pageInput

        thead.innerHTML = `<tr>
            <th scope="col"></th>
            <th scope="col">00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F</th>
            <th scope="col"></th>
        </tr>`

        table.style.fontFamily = 'monospace'
        table.style.textAlign = 'left'
        table.appendChild(thead)
        table.appendChild(tbody)

        this.tbody = tbody

        div.appendChild(pageNav)
        div.appendChild(table)

        this.container = div
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>|Blob} blobOrStream
     */
    render(blobOrStream) {
        /**
         * @type {ReadableStream<Uint8Array<ArrayBuffer>>}
         */
        let stream

        if (blobOrStream instanceof Blob) {
            stream = blobOrStream.stream()
        }
        else if (blobOrStream instanceof ReadableStream) {
            stream = blobOrStream
        }

        if (stream) {
            const reader = new ByteReader(stream)

            this.readStream(reader)
        }

        return this.container
    }

    /**
     * @param {ByteReader} reader
     */
    async readStream(reader) {
        let row = 0
        let pages = 0

        while (!reader.done()) {
            const dataRow = new Uint8Array(this.bytesPerRow)
            const n = await reader.read(dataRow)
            this.dataRows.push(dataRow.subarray(0, n))

            row++

            if (row % this.rowsPerPage) {
                pages++
            }

            if (pages == 1) {
                this.renderPage(0)
            }
        }

        if (pages == 0) {
            this.renderPage(0)
            pages = 1
        }

        this.totalPages = pages

        if (pages > 1) {
            this.nextBtn.disabled = false
        }
    }

    clearPage() {
        requestAnimationFrame(() => {
            for (const tr of this.tableRows) {
                this.tbody.removeChild(tr)
            }
        })
    }

    renderPage(i) {
        this.clearPage()

        requestAnimationFrame(() => {
            for (let tableRowIdx = 0, dataRowIdx = i * this.rowsPerPage, offset = i * (this.bytesPerRow * this.rowsPerPage)
                ; tableRowIdx < this.rowsPerPage && dataRowIdx < this.dataRows.length
                ; tableRowIdx++, dataRowIdx++, offset += this.bytesPerRow
            ) {
                const tr = this.tableRows[tableRowIdx]
                const dataRow = this.dataRows[dataRowIdx]

                const offsetTh = tr.querySelector('.offset')
                const hexTd = tr.querySelector('.hex')
                const asciiTd = tr.querySelector('.ascii')

                const asciiArr = dataRow.map(byte => byte >= 32 && byte <= 126 ? byte : '.'.charCodeAt(0))
                const hexArr = []

                for (const byte of dataRow) {
                    hexArr.push(byte.toString(16).padStart(2, '0'))
                }

                offsetTh.innerText = offset.toString(16).padStart(8, '0')
                hexTd.innerText = hexArr.join('\t')
                asciiTd.innerText = textDecoders.get('ascii').decode(asciiArr)

                this.tbody.appendChild(tr)
            }

            this.pageInput.value = (i+1).toString(10)
        })
    }

    nextPage() {
        const lastPage = this.totalPages - 1

        if (this.currentPage == lastPage) {
            return
        }

        this.currentPage++

        this.renderPage(this.currentPage)

        if (this.currentPage == lastPage) {
            this.nextBtn.disabled = true
        }

        if (this.currentPage != 0) {
            this.prevBtn.disabled = false
        }
    }

    prevPage() {
        const lastPage = this.totalPages - 1

        if (this.currentPage == 0) {
            return
        }

        this.currentPage--

        this.renderPage(this.currentPage)

        if (this.currentPage == 0) {
            this.prevBtn.disabled = true
        }

        if (this.currentPage != lastPage) {
            this.nextBtn.disabled = false
        }
    }

    jumpToPage() {
        const v = parseInt(this.pageInput.value)
        const i = v - 1
        const lastPage = this.totalPages - 1

        if (v < 1) {
            return
        }

        if (v > this.totalPages) {
            return
        }

        this.renderPage(i)
        this.currentPage = i

        if (i == 0) {
            this.prevBtn.disabled = true
        }

        if (i > 0) {
            this.prevBtn.disabled = false
        }

        if (i < lastPage) {
            this.nextBtn.disabled = false
        }

        if (i == lastPage) {
            this.nextBtn.disabled = true
        }
    }

    unmount() {
        // do nothing because we don't expect to be unmounted
    }
}
