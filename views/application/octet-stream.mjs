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
    /** @type {HTMLDivElement} */ 
    #container

    /** @type {Uint8Array<ArrayBuffer>[]} */
    #pages = []

    #bytesPerRow = 16
    
    #rowsPerPage = 16

    constructor() {
        super()

        const div = document.createElement('div')

        div.appendChild(this.#initPageNav())
        div.appendChild(this.#initTable())

        this.#container = div
    }

    #initTable() {
        const table = document.createElement('table')
        const thead = document.createElement('thead')
        const tbody = document.createElement('tbody')

        table.style.fontFamily = 'monospace'

        thead.innerHTML = `
            <tr>
                <th></th>
                <th>0</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
                <th>5</th>
                <th>6</th>
                <th>7</th>
                <th>8</th>
                <th>9</th>
                <th>A</th>
                <th>B</th>
                <th>C</th>
                <th>D</th>
                <th>E</th>
                <th>F</th>
            </tr>
        `

        for (let i = 0; i < 16; i++) {
            const tr = document.createElement('tr')
            tr.classList.add('data')

            tr.innerHTML = `
                <th scope="row" class="address"></th>
                <td class="x0"></td>
                <td class="x1"></td>
                <td class="x2"></td>
                <td class="x3"></td>
                <td class="x4"></td>
                <td class="x5"></td>
                <td class="x6"></td>
                <td class="x7"></td>
                <td class="x8"></td>
                <td class="x9"></td>
                <td class="xA"></td>
                <td class="xB"></td>
                <td class="xC"></td>
                <td class="xD"></td>
                <td class="xE"></td>
                <td class="xF"></td>
            `

            tbody.appendChild(tr)
        }

        table.appendChild(thead)
        table.appendChild(tbody)
        
        return table
    }

    #initPageNav() {
        /** @type {HTMLElement} */
        const nav = document.createElement('nav')
        /** @type {HTMLButtonElement} */
        const nextBtn = document.createElement('button')
        /** @type {HTMLButtonElement} */
        const prevBtn = document.createElement('button')
        const currentPageText = document.createTextNode('1')

        let currentPage = 0

        prevBtn.textContent = 'Back'
        nextBtn.textContent = 'Next'

        prevBtn.disabled = true

        nextBtn.addEventListener('click', () => {
            const last = this.#pages.length-1

            currentPage++

            if (currentPage == last) {
                nextBtn.disabled = true
            }

            prevBtn.disabled = false

            requestAnimationFrame(() => {
                currentPageText.textContent = (currentPage+1).toString(10)
                this.#renderPage(currentPage)
            })
        })

        prevBtn.addEventListener('click', () => {
            currentPage--

            if (currentPage == 0) {
                prevBtn.disabled = true
            }

            nextBtn.disabled = false

            requestAnimationFrame(() => {
                currentPageText.textContent = (currentPage+1).toString(10)
                this.#renderPage(currentPage)
            })
        })

        nav.appendChild(prevBtn)
        nav.appendChild(currentPageText)
        nav.appendChild(nextBtn)

        return nav
    }

    #clearRows() {
        const rows = this.#container.querySelectorAll('tr.data')
        for (const row of rows) {
            const children = row.children

            for (const child of children) {
                child.innerHTML = ''
            }
        }
    }

    /**
     * @param {ReadableStream<Uint8Array<ArrayBuffer>>|Blob} blobOrStream
     */
    render(blobOrStream) {
        let stream

        if (blobOrStream instanceof Blob) {
            stream = blobOrStream.stream()
        }
        else if (blobOrStream instanceof ReadableStream) {
            stream = blobOrStream
        }

        if (stream) {
            const reader = new ByteReader(stream)
            const bytesPerPage = this.#bytesPerRow * this.#rowsPerPage

            this.#pages = []

            reader.readBytes(bytesPerPage)
                .then(async page => {
                    // render the first page immediately
                    this.#pages.push(page)
                    requestAnimationFrame(() => this.#renderPage(0))

                    while (!reader.done()) {
                        const nextPage = await reader.readBytes(bytesPerPage)
                        this.#pages.push(nextPage)
                    }
                })
        }

        return this.#container
    }

    /**
     * @param {number} idx
     */
    #renderPage(idx) {
        this.#clearRows()

        const ascii = textDecoders.get('ascii')

        /** @type {NodeList} */
        const rows = this.#container.querySelectorAll('tr.data')
        const page = this.#pages[idx]
        const bytesPerRow = this.#bytesPerRow

        let addr = idx * this.#bytesPerRow * this.#rowsPerPage

        for (
            let byteIdx = 0, rowIdx = 0;
            byteIdx < page.byteLength && rowIdx < this.#rowsPerPage;
            byteIdx += bytesPerRow, addr += bytesPerRow, rowIdx++
        ) {
            const row = rows[rowIdx]
            const bytes16 = page.subarray(byteIdx, byteIdx+bytesPerRow)

            const th = row.querySelector('th')
            th.innerHTML = '<br>' + addr.toString(16).padStart(8, '0').toUpperCase()

            for (let i = 0; i < bytes16.byteLength; i++) {
                const td = row.querySelector('td.x' + i.toString(16).toUpperCase())
                const byte = bytes16[i]

                let ch = ascii.decode(bytes16.subarray(i, i+1))
                const hex = byte.toString(16).padStart(2, '0')

                if (byte <= 32 || byte >= 127) {
                    ch = ''
                }

                td.innerHTML = `${ch}<br>${hex}`
            }
        }
    }

    unmount() {
        // do nothing because we don't expect to be unmounted
    }
}
