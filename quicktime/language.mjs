const macintoshLanguageCodes = {
    0: 'English',
    1: 'French',
    2: 'German',
    3: 'Italian',
}

/**
 * @param {number} c
 */
export function isMacintoshLanguageCode(c) {
    if (typeof c != 'number') {
        return false
    }

    if (isNaN(c)) {
        return false
    }

    if (c == 0x7FFF) {
        return true
    }

    if (c < 0x400) {
        return true
    }

    return false
}

/**
 * @param {number} c
 */
export function isISOLanguageCode(c) {
    if (typeof c != 'number') {
        return false
    }

    if (isNaN(c)) {
        return false
    }

    return !isMacintoshLanguageCode(c)
}
