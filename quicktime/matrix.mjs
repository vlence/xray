const log = console

/**
 * A transformation matrix
 * 
 * @see {@link https://developer.apple.com/documentation/quicktime-file-format/matrices}
 */
export default class Matrix {
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
