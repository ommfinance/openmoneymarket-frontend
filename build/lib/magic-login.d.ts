import { Magic } from "magic-sdk";
import { UserApiService } from "./services/user-api-service";
import { MagicLoginResponse } from "./models/Interfaces/MagicLogin";
export declare function MagicLogin(magic: Magic, email: string, userApiService: UserApiService): Promise<MagicLoginResponse>;
// # sourceMappingURL=magic-login.d.ts.map
