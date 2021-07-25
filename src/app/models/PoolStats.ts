export class PoolStats {

  constructor(base: number, quote: number, baseToken: string, quoteToken: string, totalSupply: number, price: number, name: string,
              baseDecimals: number, quoteDecimals: number, minQuote: number) {
    this.base = base;
    this.quote = quote;
    this.baseToken = baseToken;
    this.quoteToken = quoteToken;
    this.totalSupply = totalSupply;
    this.price = price;
    this.name = name;
    this.baseDecimals = baseDecimals;
    this.quoteDecimals = quoteDecimals;
    this.minQuote = minQuote;
  }
  base: number;
  quote: number;
  baseToken: string;
  quoteToken: string;
  totalSupply: number;
  price: number;
  name: string;
  baseDecimals: number;
  quoteDecimals: number;
  minQuote: number;

  public static getPoolPrecision(baseDecimals: number, quoteDecimals: number): number {
    return (baseDecimals + quoteDecimals) / 2;
  }

  getPrecision(): number {
    return (this.baseDecimals + this.quoteDecimals) / 2;
  }
}

export interface PoolStatsInterface {
  base: number;
  quote: number;
  base_token: string;
  quote_token: string;
  total_supply: number;
  price: number;
  name: string;
  base_decimals: number;
  quote_decimals: number;
  min_quote: number;
}


// Example response for pool_id = 5
// {
//   "base":"0x3635c9adc5dea00000",
//   "quote":"0xee6b280",
//   "base_token":"cxa96491850d5dd69efa5d64afa9138fd4a66cd348",
//   "quote_token":"cx65f639254090820361da483df233f6d0e69af9b7",
//   "total_supply":"0x1c6bf52634000",
//   "price":"0x3d090",
//   "name":"OMM/IUSDC",
//   "base_decimals":"0x12",
//   "quote_decimals":"0x6",
//   "min_quote":"0x0"
// }

