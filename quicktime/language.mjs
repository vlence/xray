const macintoshLanguageCodes = {
    0: 'English',
    1: 'French',
    2: 'German',
    3: 'Italian',
    4: 'Dutch',
    5: 'Swedish',
    6: 'Spanish',
    7: 'Danish',
    8: 'Portuguese',
    9: 'Norwegian',
    10: 'Hebrew',
    11: 'Japanese',
    12: 'Arabic',
    13: 'Finnish',
    14: 'Greek',
    15: 'Icelandic',
    16: 'Maltese',
    17: 'Turkish',
    18: 'Croatian',
    19: 'Traditional Chinese',
    20: 'Urdu',
    21: 'Hindi',
    22: 'Thai',
    23: 'Korean',
    24: 'Lithuanian',
    25: 'Polish',
    26: 'Hungarian',
    27: 'Estonian',
    28: 'Lettish/Latvian',
    29: 'Saami/Sami',
    30: 'Faroese',
    31: 'Farsi',
    32: 'Russian',
    33: 'Simplified Chinese',
    34: 'Flemish',
    35: 'Irish',
    36: 'Albanian',
    37: 'Romanian',
    38: 'Czech',
    39: 'Slovak',
    40: 'Slovenian',
    41: 'Yiddish',
    42: 'Serbian',
    43: 'Macedonian',
    44: 'Bulgarian',
    45: 'Ukrainian',
    46: 'Belarusian',
    47: 'Uzbek',
    48: 'Kazakh',
    49: 'Azerbaijani',
    50: 'AzerbaijanAr',
    51: 'Armenian',
    52: 'Georgian',
    53: 'Moldavian',
    54: 'Kirghiz',
    55: 'Tajiki',
    56: 'Turkmen',
    57: 'Mongolian',
    58: 'MongolianCyr',
    59: 'Pashto',
    60: 'Kurdish',
    61: 'Kashmiri',
    62: 'Sindhi',
    63: 'Tibetan',
    64: 'Nepali',
    65: 'Sanskrit',
    66: 'Marathi',
    67: 'Bengali',
    68: 'Assamese',
    69: 'Gujarati',
    70: 'Punjabi',
    71: 'Oriya',
    72: 'Malayalam',
    73: 'Kannada',
    74: 'Tamil',
    75: 'Telugu',
    76: 'Sinhala',
    77: 'Burmese',
    78: 'Khmer',
    79: 'Lao',
    80: 'Vietnamese',
    81: 'Indonesian',
    82: 'Tagalog',
    83: 'MalayRoman',
    84: 'MalayArabic',
    85: 'Amharic',
    87: 'Galla/Oromo',
    88: 'Somali',
    89: 'Swahili',
    90: 'Kinyarwanda',
    91: 'Rundi',
    92: 'Nyanja',
    93: 'Malagasy',
    94: 'Esperanto',
    128: 'Welsh',
    129: 'Basque',
    130: 'Catalan',
    131: 'Latin',
    132: 'Quechua',
    133: 'Guarani',
    134: 'Aymara',
    135: 'Tatar',
    136: 'Uighur',
    137: 'Dzongkha',
    138: 'JavaneseRom',
    32767: 'Unspecified',
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

export function getMacintoshLanguageCode(c) {
    if (!isMacintoshLanguageCode(c)) {
        return 'Unspecified'
    }

    return macintoshLanguageCodes[c]
}

/**
 * @param {number} c
 */
export function getISOLanguageCode(c) {
    if (!isISOLanguageCode(c)) {
        return 'Unspecified'
    }

    const x = ((c & 0x7c00) >> 10) + 0x60
    const y = ((c & 0x03e0) >> 5) + 0x60
    const z = (c & 0x001f) + 0x60

    const bytes = [x, y, z]
    return new TextDecoder().decode(new Uint8Array(bytes))
}
