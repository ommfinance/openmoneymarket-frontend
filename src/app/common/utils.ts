import IconService from 'icon-sdk-js'


export class Utils {

  // Returns icx value divided by the 10^18 to get normal value
  public static ixcValueToNormalisedValue(value: number): number {
    return value / 10**18;
  }

  // Returns true if the address is valid EOA address, false otherwise
  public static isEoaAddress(address: string): boolean {
    if (!address) return false;
    return IconService.IconValidator.isEoaAddress(address);
  }

}
