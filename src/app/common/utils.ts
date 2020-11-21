import IconService from 'icon-sdk-js';


export class Utils {

  // Returns icx value divided by the 10^18 to get normal value
  public static ixcValueToNormalisedValue(value: number | string): number {
    if (typeof value === "string") {
      return parseInt(value, 16) / 10 ** 18;
    } else {
      return value / 10 ** 18;
    }
  }

  public static hexToNumber(value: string | number): number {
    if (typeof value === "string")
      return parseInt(value, 16);
    else
      return value;
  }

  // Returns true if the address is valid EOA address, false otherwise
  public static isEoaAddress(address: string): boolean {
    if (!address) { return false; }
    return IconService.IconValidator.isEoaAddress(address);
  }

  public static formatNumberToNdigits(num: number, digits: number = 2): string {
    const si = [
      { value: 1, symbol: "" },
      { value: 1E3, symbol: "K" },
      { value: 1E6, symbol: "M" },
      { value: 1E9, symbol: "G" },
      { value: 1E12, symbol: "T" },
      { value: 1E15, symbol: "P" },
      { value: 1E18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
  }

  public static formatNumberToUSLocaleString(num: number): string {
    return num.toLocaleString('en-US');
  }

  public static scientificNotationToBigNumberString(amount: string) {
    amount = String(amount);
    // example: 3.214e+21
    if (amount.includes("e")) {
      let splitAmount = amount.split("e+");
      let exponent = +splitAmount[1]; // 21
      let number = splitAmount[0]; // 3.214
      let nrOfDecimals = 0;
      if (number.split(".").length > 1) {
        nrOfDecimals =  number.split(".")[1].length;
      }
      console.log("number of decimals = " + nrOfDecimals)
      let res = number.toString();
      for (let i = exponent - nrOfDecimals; i > 0; i--) {
        res += "0";
      }
      return res.replace(".","");
    } else {
      return amount;
    }
  }

}
