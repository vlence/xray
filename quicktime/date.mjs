const ms1904 = new Date('1904-01-01').valueOf()

const MacintoshDate = {
    /**
     * Returns a JavaScript date representation of the given
     * Macintosh date. A Macintosh date is a 32-bit value
     * indicating the number of seconds since 1 Jan 1904.
     *
     * @param {Uint8Array<ArrayBuffer>} arr
     *
     * @returns {Date}
     *
     * @see {@link https://developer.apple.com/documentation/quicktime-file-format/calendar_date_and_time_values}
     */
    from(arr) {
        const d = new DataView(arr.buffer).getUint32()
        return new Date(ms1904 + (d * 1000))
    }
}

export default MacintoshDate
