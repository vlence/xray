export default class Color {
    /**
     * 16-bit integer.
     *
     * @type {number}
     */
    red

    /**
     * 16-bit integer.
     *
     * @type {number}
     */
    green

    /**
     * 16-bit integer.
     *
     * @type {number}
     */
    blue

    /**
     * Red as 8-bit integer.
     */
    red8() {
        return Math.floor(this.red / 256)
    }

    /**
     * Green as 8-bit integer.
     */
    green8() {
        return Math.floor(this.green / 256)
    }

    /**
     * Blue as 8-bit integer.
     */
    blue8() {
        return Math.floor(this.blue / 256)
    }

    /**
     * Get RGB value as hex
     */
    hex() {
        const r = this.red8()
        const g = this.green8()
        const b = this.blue8()

        return r.toString(16).padStart(2, '0')
            + g.toString(16).padStart(2, '0')
            + b.toString(16).padStart(2, '0')
    }
}
