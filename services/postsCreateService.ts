import { expect } from "@playwright/test";
import _config from "../config/config";
import { postsCreateRequest, PostCreatePayload } from "../requests/postsCreateRequests";
import { common } from "../utils/common";

export class _PostsCreateService {

    // 3. POST /posts - Create a new post
    async createPost(payload: PostCreatePayload) {
        const url = postsCreateRequest.createPost(_config.baseEndpoint);
        const response = await common.postResponse(url, payload as any);
        expect(response.status(), "Expected status 201 for creating a post").toBe(201);
        const responseJson = await response.json();
        return {
            response,
            data: responseJson
        };
    }

    // Utility method to validate created post response
    async validateCreatedPost(responseData: any, expectedPayload: PostCreatePayload) {
        expect(responseData).toHaveProperty('id');
        expect(responseData.title).toBe(expectedPayload.title);
        expect(responseData.body).toBe(expectedPayload.body);
        expect(responseData.userId).toBe(expectedPayload.userId);
        expect(typeof responseData.id).toBe('number');
    }

}

export const postsCreateService = new _PostsCreateService();
