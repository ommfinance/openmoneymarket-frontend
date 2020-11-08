declare var wNumb: any;

/*
*
* Formats
*
*/

// %

export const percentageFormat = wNumb({
  decimals: 0,
  suffix: '%'
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