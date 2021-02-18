import "./widget/icon-bridge-widget";
import { BridgeService } from "./lib/BridgeService";
declare global {
    interface Window {
        BridgeService: any;
    }
}
export default BridgeService;
//# sourceMappingURL=index.d.ts.map