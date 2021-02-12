import { RequestsWrapper } from "../common/requests-wrapper";
import { User } from "../models/User/User";
import { AxiosResponse } from "axios";
export declare class UserApiService {
    private requestsWrapper;
    constructor(requestsWrapper: RequestsWrapper);
    /**
     * @description Get currently logged in user data
     * @return {Promise<AxiosResponse<User>>} Promise with User model in response
     * @throws {BridgeError} - contains user friendly message from the API and external error
     */
    getUser(): Promise<AxiosResponse<User>>;
    /**
     * @description Create new User entity
     * @param {User} user - User model
     * @return {Promise<AxiosResponse<User>>} Promise with User model in response
     * @throws {BridgeError} - contains user friendly message from the API and external error
     */
    postUser(user: User): Promise<AxiosResponse<User>>;
    /**
     * @description Update user email
     * @param {string} email - New user email
     * @return {Promise<AxiosResponse<User>>} Promise with User model in response
     * @throws {BridgeError} - contains user friendly message from the API and external error
     */
    updateUserEmail(email: string): Promise<AxiosResponse<User>>;
}
// # sourceMappingURL=user-api-service.d.ts.map
