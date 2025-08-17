import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { postsUpdateService } from '../services/postsUpdateService';
import { apiDataExtractor } from '../utils/apiDataExtractor';
import { logger } from '../utils/logger';

test.describe('Posts Update API Negative Tests', () => {
    let extractedPostId: number;
    let extractedUserId: number;

    test.beforeAll(async () => {
        logger.info('Extracting real data from JSONPlaceholder API for Update negative tests...');
        await apiDataExtractor.extractPostsData();
        const randomPost = apiDataExtractor.getRandomPostData();
        extractedPostId = randomPost.postId;
        extractedUserId = randomPost.userId;
        logger.info(`Extracted real data: PostID=${extractedPostId}, UserID=${extractedUserId}`);
    });

    test('Verify PUT /posts/{id} with non-existent ID (9999) returns 500 @negative', async () => {
        logger.info('Starting test: PUT /posts with non-existent ID 9999');
        
        const nonExistentId = 9999;
        const payload = {
            id: nonExistentId,
            title: faker.lorem.sentence(),
            body: faker.lorem.paragraphs(2),
            userId: extractedUserId
        };

        const result = await postsUpdateService.putPost(nonExistentId, payload);
        
        expect(result.response.status()).toBe(500);
        expect(result.data).toEqual({});
        
        logger.info('Successfully handled PUT request for non-existent post ID 9999');
    });

    test('Verify PATCH /posts/{id} with non-existent ID (9999) returns 500 @negative', async () => {
        logger.info('Starting test: PATCH /posts with non-existent ID 9999');
        
        const nonExistentId = 9999;
        const payload = {
            title: faker.lorem.sentence()
        };

        const result = await postsUpdateService.patchPost(nonExistentId, payload);
        
        expect(result.response.status()).toBe(500);
        expect(result.data).toEqual({});
        
        logger.info('Successfully handled PATCH request for non-existent post ID 9999');
    });

    test('Verify PUT /posts/{id} with zero ID returns 500 @negative', async () => {
        logger.info('Starting test: PUT /posts with zero ID');
        
        const zeroId = 0;
        const payload = {
            id: zeroId,
            title: faker.lorem.sentence(),
            body: faker.lorem.paragraphs(2),
            userId: extractedUserId
        };

        const result = await postsUpdateService.putPost(zeroId, payload);
        
        expect(result.response.status()).toBe(500);
        expect(result.data).toEqual({});
        
        logger.info('Successfully handled PUT request for zero post ID');
    });

    test('Verify PATCH /posts/{id} with invalid userId (non-existent user) @negative', async () => {
        logger.info('Starting test: PATCH /posts with invalid userId');
        
        const payload = {
            userId: 99999
        };

        const result = await postsUpdateService.patchPost(extractedPostId, payload);
        
        expect([400, 422]).toContain(result.response.status());
        
        logger.info(`Handled invalid userId with status: ${result.response.status()}`);
    });

    test('Verify PUT /posts/{id} with missing required fields @negative', async () => {
        logger.info('Starting test: PUT /posts with missing required fields');
        
        const incompletePayload = {
            id: extractedPostId,
            title: faker.lorem.sentence()
        };

        const result = await postsUpdateService.putPost(extractedPostId, incompletePayload as any);
        
        expect([400, 422]).toContain(result.response.status());
        
        logger.info(`Successfully handled PUT with missing fields for post ${extractedPostId}`);
    });

});
