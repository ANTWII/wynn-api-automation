import { test, expect } from '@playwright/test';
import { postsReadService } from '../services/postsReadService';
import { apiDataExtractor } from '../utils/apiDataExtractor';
import { logger } from '../utils/logger';

test.describe('Posts Read API Negative Tests', () => {
    let extractedPostId: number;

    test.beforeAll(async () => {
        logger.info('Extracting real data from JSONPlaceholder API for Read negative tests...');
        await apiDataExtractor.extractPostsData();
        const randomPost = apiDataExtractor.getRandomPostData();
        extractedPostId = randomPost.postId;
        logger.info(`Extracted real data: PostID=${extractedPostId}`);
    });

    test('Verify GET /posts/{id} with non-existent ID (9999) returns 404 @negative', async () => {
        logger.info('Starting test: GET /posts with non-existent ID 9999');
        
        const nonExistentId = 9999;
        const result = await postsReadService.getPostById(nonExistentId);
        
        expect(result.response.status()).toBe(404);
        expect(result.data).toEqual({});
        
        logger.info('Successfully handled non-existent post ID 9999');
    });

    test('Verify GET /posts/{id} with zero ID returns 404 @negative', async () => {
        logger.info('Starting test: GET /posts with zero ID');
        
        const zeroId = 0;
        const result = await postsReadService.getPostById(zeroId);
        
        expect(result.response.status()).toBe(404);
        expect(result.data).toEqual({});
        
        logger.info('Successfully handled post ID 0');
    });

    test('Verify GET /posts/{id} with negative ID (-1) returns 404 @negative', async () => {
        logger.info('Starting test: GET /posts with negative ID -1');
        
        const negativeId = -1;
        const result = await postsReadService.getPostById(negativeId);
        
        expect(result.response.status()).toBe(404);
        expect(result.data).toEqual({});
        
        logger.info('Successfully handled negative post ID -1');
    });

    test('Verify GET /posts/{id} boundary values (ID 101 should not exist) @negative', async () => {
        logger.info('Starting test: GET /posts boundary value ID 101');
        
        const boundaryId = 101;
        const result = await postsReadService.getPostById(boundaryId);
        
        expect(result.response.status()).toBe(404);
        expect(result.data).toEqual({});
        
        logger.info('Successfully handled boundary post ID 101');
    });

});
