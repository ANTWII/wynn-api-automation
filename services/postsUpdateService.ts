import { expect } from "@playwright/test";
import _config from "../config/config";
import { postsUpdateRequest, PostUpdatePayload, PostFullUpdatePayload } from "../requests/postsUpdateRequests";
import { common } from "../utils/common";

export class _PostsUpdateService {

    // 4. PUT /posts/{id} - Full update (replaces entire resource)
    async putPost(id: string | number, payload: PostFullUpdatePayload) {
        const url = postsUpdateRequest.putPost(_config.baseEndpoint, id);
        const response = await common.putResponse(url, payload as any);
        expect(response.status(), `Expected status 200 for PUT update of post ID: ${id}`).toBe(200);
        const responseJson = await response.json();
        return {
            response,
            data: responseJson
        };
    }

    // 4. PATCH /posts/{id} - Partial update (updates only specified fields)
    async patchPost(id: string | number, payload: PostUpdatePayload) {
        const url = postsUpdateRequest.patchPost(_config.baseEndpoint, id);
        const response = await common.patchResponse(url, payload as any);
        expect(response.status(), `Expected status 200 for PATCH update of post ID: ${id}`).toBe(200);
        const responseJson = await response.json();
        return {
            response,
            data: responseJson
        };
    }

    // Validate updated post response
    async validateUpdatedPost(responseData: any, expectedChanges: PostUpdatePayload) {
        if (expectedChanges.title) {
            expect(responseData.title).toBe(expectedChanges.title);
        }
        if (expectedChanges.body) {
            expect(responseData.body).toBe(expectedChanges.body);
        }
        if (expectedChanges.userId) {
            expect(responseData.userId).toBe(expectedChanges.userId);
        }
        expect(responseData).toHaveProperty('id');
    }

}

export const postsUpdateService = new _PostsUpdateService();
