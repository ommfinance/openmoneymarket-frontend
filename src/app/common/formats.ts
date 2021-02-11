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
import {AssetTag} from "../models/Asset";

declare var wNumb: any;

// %
export const normalFormat = wNumb({
  decimals: 0,
});

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

export function assetFormat(assetTag: AssetTag): any {
    return wNumb({
      decimals: 0,
      thousand: ',',
      suffix: ` ${assetTag.toString()}`
    });
}

// + USDb .00
export function assetPrefixPlusFormat(assetTag: AssetTag): any {
  return wNumb({
    decimals: 2,
    thousand: ',',
    prefix: ' + ',
    suffix: ` ${assetTag.toString()}`
  });
}

// - USDb .00
export function assetPrefixMinusFormat(assetTag: AssetTag): any {
  return wNumb({
    decimals: 2,
    thousand: ',',
    prefix: ' - ',
    suffix: ` ${assetTag.toString()}`
  });
}

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
