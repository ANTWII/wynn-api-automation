import { expect } from "@playwright/test";
import _config from "../config/config";
import { postsReadRequest } from "../requests/postsReadRequests";
import { common } from "../utils/common";

export class _PostsReadService {

    // 1. GET /posts - Get all posts
    async getAllPosts() {
        const response = await common.getResponse(postsReadRequest.getAllPosts(_config.baseEndpoint));
        expect(response.status(), "Expected status 200 for getting all posts").toBe(200);
        const responseJson = await response.json();
        return {
            response,
            data: responseJson
        };
    }

    // 2. GET /posts/{id} - Get post by ID
    async getPostById(id: string | number) {
        const response = await common.getResponse(postsReadRequest.getPostById(_config.baseEndpoint, id));
        const responseJson = await response.json();
        return {
            response,
            data: responseJson
        };
    }

    // Utility method to verify post structure
    async validatePostStructure(postData: any) {
        expect(postData).toHaveProperty('id');
        expect(postData).toHaveProperty('title');
        expect(postData).toHaveProperty('body');
        expect(postData).toHaveProperty('userId');
        expect(typeof postData.id).toBe('number');
        expect(typeof postData.title).toBe('string');
        expect(typeof postData.body).toBe('string');
        expect(typeof postData.userId).toBe('number');
    }

}

export const postsReadService = new _PostsReadService();
