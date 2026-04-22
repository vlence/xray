const log = console

/**
 * A transformation matrix
 * 
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/matrices}
 */
export default class Matrix {
    /**
     * @param {Uint8Array<ArrayBuffer>} arr
     */
    constructor(arr) {
        const view = new Uint32Array(arr.buffer)

        this.a = view.at(0)
        this.b = view.at(1)
        this.u = view.at(2)
        this.c = view.at(3)
        this.d = view.at(4)
        this.v = view.at(5)
        this.x = view.at(6)
        this.y = view.at(7)
        this.w = view.at(8)
    }
    
    /**
     * 32-bit fixed point number divided as 16.16.
     *
     * @type {number}
     */
    a
    
    /**
     * 32-bit fixed point number divided as 16.16.
     *
     * @type {number}
     */
    b

    /**
     * 32-bit fixed point number divided as 16.16.
     *
     * @type {number}
     */
    c

    /**
     * 32-bit fixed point number divided as 16.16.
     *
     * @type {number}
     */
    d

    /**
     * 32-bit fixed point number divided as 2.30.
     *
     * @type {number}
     */
    u

    /**
     * 32-bit fixed point number divided as 2.30.
     *
     * @type {number}
     */
    v

    /**
     * 32-bit fixed point number divided as 2.30.
     *
     * @type {number}
     */
    w

    /** @type {number} */
    x

    /** @type {number} */
    y
}
