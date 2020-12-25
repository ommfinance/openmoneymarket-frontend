/*
* Omm
* Formats JS
* Version 1.0
* Last updated 10/12/20
*/

/* ==========================================================================
    Formats
========================================================================== */

// %
var percentageFormat = wNumb({
    decimals: 0,
    suffix: '%'
});

// + .00
var prefixPlusFormat = wNumb({
    decimals: 2,
    thousand: ',',
    prefix: ' + '
});

// ICX
var icxFormat = wNumb({
    decimals: 0,
    thousand: ',',
    suffix: ' ICX'
});

// USDb
var usdbFormat = wNumb({
    decimals: 0,
    thousand: ',',
    suffix: ' USDb'
});

// + USDb .00
var usdbPrefixPlusFormat = wNumb({
    decimals: 2,
    thousand: ',',
    prefix: ' + ',
    suffix: ' USDb'
});

// - USDb .00
var usdbPrefixMinusFormat = wNumb({
    decimals: 2,
    thousand: ',',
    prefix: ' - ',
    suffix: ' USDb'
});

// + OMM .00
var ommPrefixPlusFormat = wNumb({
    decimals: 2,
    thousand: ',',
    prefix: ' + ',
    suffix: ' OMM'
});

// ICD
var icdFormat = wNumb({
    decimals: 0,
    thousand: ',',
    suffix: ' ICD'
});

// $
var usdFormat = wNumb({
    decimals: 0,
    thousand: ',',
    prefix: '$'
});

// $ .00
var usdTwoDecimalFormat = wNumb({
    decimals: 2,
    thousand: ',',
    prefix: '$'
});

// +$ .00
var usdTwoDecimalPlusFormat = wNumb({
    decimals: 2,
    thousand: ',',
    prefix: '+ $'
});

// -$ .00
var usdTwoDecimalMinusFormat = wNumb({
    decimals: 2,
    thousand: ',',
    prefix: '- $'
});