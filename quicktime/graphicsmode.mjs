/**
 * Copy the source image over the destination.
 */
export const COPY = 0x0

/**
 * Dither the image (if needed), otherwise do a copy.
 */
export const DITHER_COPY = 0x40

/**
 * Replaces destination pixel with a blend of the source and destination
 * pixel colors, with the proportion for each channel controlled by that
 * channel in the opcolor.
 */
export const BLEND = 0x20

/**
 * Replaces the destination pixel with the source pixel if the source
 * pixel isn’t equal to the opcolor.
 */
export const TRANSPARENT = 0x24

/**
 * Replaces the destination pixel with a blend of the source and
 * destination pixels, with the proportion controlled by the alpha
 * channel.
 */
export const STRAIGHT_ALPHA = 0x100

/**
 * Premultiplied with white means that the color components of each pixel
 * have already been blended with a white pixel, based on their alpha
 * channel value. Effectively, this means that the image has already been
 * combined with a white background. First, remove the white from each
 * pixel and then blend the image with the actual background pixels.
 */
export const PREMUL_WHITE_ALPHA = 0x101

/**
 * Premultiplied with black is the same as pre-multiplied with white,
 * except the background color that the image has been blended with is
 * black instead of white.
 */
export const PREMUL_BLACK_ALPHA = 0x102

/**
 * Similar to straight alpha, but the alpha value used for each channel
 * is the combination of the alpha channel and that channel in the
 * opcolor.
 */
export const STRAIGHT_ALPHA_BLEND = 0x104

/**
 * (Tracks only) The track is drawn offscreen, and then composed onto the
 * screen using dither copy.
 */
export const COMPOSITION = 0x103

const opcolorModes = [BLEND, TRANSPARENT, STRAIGHT_ALPHA_BLEND]

/**
 * Returns true if the given graphics mode uses opcolor.
 * @param {number} mode
 */
export function usesOpcolor(mode) {
    if (typeof mode != 'number') {
        return false
    }

    if (isNaN(mode)) {
        return false
    }

    return opcolorModes.includes(mode)
}

/**
 * Returns true if the actual graphics mode is the expected graphics
 * mode.
 *
 * @param {number} expected The expected graphics mode
 * @param {number} actual The actual graphics mode
 */
export function is(expected, actual) {
    return expected === actual
}
