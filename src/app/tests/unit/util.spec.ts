import BigNumber from "bignumber.js";

describe('Util tests', () => {

  it('Rounding test', () => {
    expect(+(new BigNumber(0.005).toFixed(2, BigNumber.ROUND_HALF_CEIL))).toBe(0.01);
    expect(+(new BigNumber(0.003).toFixed(2, BigNumber.ROUND_HALF_CEIL))).toBe(0.00);
  });

  it('Regex tests', () => {
    const regex = new RegExp('amount\\s+requested.*is\\s+more\\s+than\\s+the.*');
    expect((regex).test("amount requested 123 is more than the 123")).toBe(true);
    expect((regex).test("amount requested 123 is more than the 123")).toBe(true);
    expect((regex).test("amount  asdsa   requested   123   is   more   than  the  123")).toBe(false);
    expect((regex).test("amount requested 12313213123.123123 is more than the 0.341344")).toBe(true);
    expect((regex).test("amount requested 12313213123.123123 is s more than the 0.341344")).toBe(false);
  });

});
