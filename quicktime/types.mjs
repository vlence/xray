/**
 * Reserved for use where no type needs to be indicated
 */
export const RESERVED = 0

/**
 * Without any count or NULL terminator
 */
export const UTF8 = 1

/**
 * Also known as UTF-16BE
 */
export const UTF16 = 2

/**
 * Deprecated unless it is needed for special Japanese characters
 *
 * @deprecated
 */
export const SJIS = 3

/**
 * Variant storage of a string for sorting only
 */
export const UTF8Sort = 4

/**
 * Variant storage of a string for sorting only
 */
export const UTF16Sort = 5

/**
 * In a JFIF wrapper
 */
export const JPEG = 13

/**
 * In a PNG wrapper
 */
export const PNG = 13

/**
 * @param {number} t
 */
export function isWellKnown(t) {
    return indicatorOf(t) == 0
}

/**
 * @param {number} t 32-bit number
 */
export function indicatorOf(t) {
    return (t & 0xFF000000) >> 24
}

/**
 * @param {number} t 32-bit number
 */
export function typeOf(t) {
    return t & 0x00FFFFFF
}

/**
 * @param {number} t 32-bit number
 */
export function isUTF8(t) {
    return isWellKnown(t) && (typeOf(t) == UTF8 || typeOf(t) == UTF8Sort)
}

/**
 * @param {number} t 32-bit number
 */
export function isUTF16(t) {
    return isWellKnown(t) && (typeOf(t) == UTF16 || typeOf(t) == UTF16Sort)
}

/**
 * @param {number} t 32-bit number
 */
export function isSJIS(t) {
    return isWellKnown(t) && typeOf(t) == SJIS
}

/**
 * @param {number} t 32-bit number
 */
export function isJPEG(t) {
    return isWellKnown(t) && typeOf(t) == JPEG
}

/**
 * @param {number} t 32-bit number
 */
export function isPNG(t) {
    return isWellKnown(t) && typeOf(t) == PNG
}
