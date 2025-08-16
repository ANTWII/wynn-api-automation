import { expect } from "@playwright/test";
import _config from "../config/config";
import { postsDeleteRequest } from "../requests/postsDeleteRequests";
import { common } from "../utils/common";

export class _PostsDeleteService {

    // 5. DELETE /posts/{id} - Delete post by ID
    async deletePost(id: string | number) {
        const response = await common.deleteResponse(postsDeleteRequest.deletePost(_config.baseEndpoint, id));
        expect(response.status(), `Expected status 200 for deleting post ID: ${id}`).toBe(200);
        return {
            response,
            success: true,
            deletedId: id
        };
    }

}

export const postsDeleteService = new _PostsDeleteService();
