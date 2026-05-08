export const markerSymbols = {
    // start of frame, non-differential, huffman coding
    0xFFC0: 'SOF0',
    0xFFC1: 'SOF1',
    0xFFC2: 'SOF2',
    0xFFC3: 'SOF3',

    // huffman table specification
    0xFFC4: 'DHT',

    // start of frame, differential, huffman coding
    0xFFC5: 'SOF5',
    0xFFC6: 'SOF6',
    0xFFC7: 'SOF7',

    // start of frame, non-differential, arithmetic coding
    0xFFC8: 'JPG',
    0xFFC9: 'SOF9',
    0xFFCA: 'SOF10',
    0xFFCB: 'SOF11',

    // arithmetic coding conditioning specification
    0xFFCC: 'DAC',

    // start of frame, differential, arithmetic coding
    0xFFCD: 'SOF13',
    0xFFCE: 'SOF14',
    0xFFCF: 'SOF15',

    // Restart interval termination
    0xFFD0: 'RSTm0',
    0xFFD1: 'RSTm1',
    0xFFD2: 'RSTm2',
    0xFFD3: 'RSTm3',
    0xFFD4: 'RSTm4',
    0xFFD5: 'RSTm5',
    0xFFD6: 'RSTm6',
    0xFFD7: 'RSTm7',

    // Other
    0xFFD8: 'SOI',
    0xFFD9: 'EOI',
    0xFFDA: 'SOS',
    0xFFDB: 'DQT',
    0xFFDC: 'DNL',
    0xFFDD: 'DRI',
    0xFFDE: 'DHP',
    0xFFDF: 'EXP',

    // Application segments

    // Comment
    0xFFFE: 'Comment',
}

export default class Segment {
    /**
     * @type {number}
     */
    marker

    /**
     * @type {number}
     */
    size = 2

    /**
     * @type {Blob?}
     */
    data

    getSize() {
        return this.size
    }

    getDataSize() {
        return this.size - 4
    }

    getMarkerSymbol() {
        let symbol = markerSymbols[this.marker]

        if (!symbol) {
            symbol = 'Unknown'
        }

        return symbol
    }
}

