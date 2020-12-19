/*
* Omm
* Formats JS
* Version 1.0
* Last updated 10/12/20
*/

/* ==========================================================================
    Formats
========================================================================== */

// declare wNumb
declare var wNumb: any;


// %
export const percentageFormat = wNumb({
  decimals: 0,
  suffix: '%'
});

// + .00
export const prefixPlusFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: ' + '
});

// ICX
export const icxFormat = wNumb({
  decimals: 0,
  thousand: ',',
  suffix: ' ICX'
});

// USDb
export const usdbFormat = wNumb({
  decimals: 0,
  thousand: ',',
  suffix: ' USDb'
});

// + USDb .00
export const usdbPrefixPlusFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: ' + ',
  suffix: ' USDb'
});

// - USDb .00
export const usdbPrefixMinusFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: ' - ',
  suffix: ' USDb'
});

// + OMM .00
export const ommPrefixPlusFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: ' + ',
  suffix: ' OMM'
});

// ICD
export const icdFormat = wNumb({
  decimals: 0,
  thousand: ',',
  suffix: ' ICD'
});

// $
export const usdFormat = wNumb({
  decimals: 0,
  thousand: ',',
  prefix: '$'
});

// $ .00
export const usdTwoDecimalFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: '$'
});

// +$ .00
export const usdTwoDecimalPlusFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: '+ $'
});

// -$ .00
export const usdTwoDecimalMinusFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: '- $'
});
