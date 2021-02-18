import BigNumber from "bignumber.js";

describe('Util tests', () => {

  it('Rounding test', () => {
    expect(+(new BigNumber(0.005).toFixed(2, BigNumber.ROUND_HALF_CEIL))).toBe(0.01);
    expect(+(new BigNumber(0.003).toFixed(2, BigNumber.ROUND_HALF_CEIL))).toBe(0.00);
  });
});
