import {IconValidator} from "icon-sdk-js";

export class IconValidation {

  public static isEoaAddress( address: string){
    return IconValidator.isEoaAddress(address)
  }

}
