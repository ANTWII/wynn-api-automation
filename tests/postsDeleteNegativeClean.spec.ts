import { test, expect } from '@playwright/test';
import { postsDeleteService } from '../services/postsDeleteService';
import { apiDataExtractor } from '../utils/apiDataExtractor';
import { logger } from '../utils/logger';
import { common } from '../utils/common';
import _config from '../config/config';

test.describe('Posts Delete API Negative Tests', () => {
    let extractedPostId: number;
    let extractedUserId: number;

    test.beforeAll(async () => {
        logger.info('Extracting real data from JSONPlaceholder API for Delete negative tests...');
        await apiDataExtractor.extractPostsData();
        const randomPost = apiDataExtractor.getRandomPostData();
        extractedPostId = randomPost.postId;
        extractedUserId = randomPost.userId;
        logger.info(`Extracted real data: PostID=${extractedPostId}, UserID=${extractedUserId}`);
    });

    test('Verify DELETE /posts/{id} with non-existent ID (9999) returns 200 @negative', async () => {
        logger.info('Starting test: DELETE /posts with non-existent ID 9999');
        
        const nonExistentId = 9999;
        const result = await postsDeleteService.deletePost(nonExistentId);
        
        // JSONPlaceholder returns 200 even for non-existent IDs (idempotent delete)
        expect(result.response.status()).toBe(200);
        expect(result.success).toBe(true);
        expect(result.deletedId).toBe(nonExistentId);
        
        logger.info('Successfully handled DELETE request for non-existent post ID 9999');
    });

    test('Verify DELETE /posts/{id} with zero ID returns 200 @negative', async () => {
        logger.info('Starting test: DELETE /posts with zero ID');
        
        const zeroId = 0;
        const result = await postsDeleteService.deletePost(zeroId);
        
        expect(result.response.status()).toBe(200);
        expect(result.success).toBe(true);
        expect(result.deletedId).toBe(zeroId);
        
        logger.info('Successfully handled DELETE request for zero post ID');
    });

    test('Verify DELETE /posts/{id} with negative ID (-1) returns 200 @negative', async () => {
        logger.info('Starting test: DELETE /posts with negative ID -1');
        
        const negativeId = -1;
        const result = await postsDeleteService.deletePost(negativeId);
        
        // JSONPlaceholder accepts negative IDs for delete operations
        expect(result.response.status()).toBe(200);
        expect(result.success).toBe(true);
        expect(result.deletedId).toBe(negativeId);
        
        logger.info('Successfully handled DELETE request for negative post ID -1');
    });

    test('Verify DELETE to invalid endpoint returns 404 @negative', async () => {
        logger.info('Starting test: DELETE to invalid endpoint');
        
        const invalidUrl = `${_config.baseEndpoint}/invalid-endpoint`;
        
        const response = await common.deleteResponse(invalidUrl);
        expect(response.status()).toBe(404);
        
        logger.info('Invalid endpoint properly returned 404 for DELETE');
    });

});
