import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { common } from '../utils/common';
import _config from '../config/config';
import { postsCreateRequest } from '../requests/postsCreateRequests';
import { logger } from '../utils/logger';

test.describe('Posts Create API Negative Tests', () => {

    test('Verify POST /posts with missing required fields returns error @negative', async () => {
        logger.info('Starting test: POST /posts with missing required fields');
        
        const url = postsCreateRequest.createPost(_config.baseEndpoint);
        const incompletePayload = {
            title: faker.lorem.sentence()
        };

        const response = await common.postResponse(url, incompletePayload as any);
        
        expect([400, 422]).toContain(response.status());
        logger.info(`Incomplete payload handled with status: ${response.status()}`);
    });

    test('Verify POST /posts with invalid userId (non-existent user) @negative', async () => {
        logger.info('Starting test: POST /posts with invalid userId');
        
        const url = postsCreateRequest.createPost(_config.baseEndpoint);
        const payload = {
            title: faker.lorem.sentence(),
            body: faker.lorem.paragraphs(2),
            userId: 99999
        };

        const response = await common.postResponse(url, payload as any);
        
        expect([400, 404, 422]).toContain(response.status());
        logger.info(`Invalid userId handled with status: ${response.status()}`);
    });

    test('Verify POST /posts with null values in required fields @negative', async () => {
        logger.info('Starting test: POST /posts with null values');
        
        const url = postsCreateRequest.createPost(_config.baseEndpoint);
        const payload = {
            title: null,
            body: null,
            userId: 1
        };

        const response = await common.postResponse(url, payload as any);
        
        expect([400, 422]).toContain(response.status());
        logger.info(`Null values handled with status: ${response.status()}`);
    });

    test('Verify POST /posts with empty string values @negative', async () => {
        logger.info('Starting test: POST /posts with empty string values');
        
        const url = postsCreateRequest.createPost(_config.baseEndpoint);
        const payload = {
            title: '',
            body: '',
            userId: 1
        };

        const response = await common.postResponse(url, payload as any);
        
        expect([400, 422]).toContain(response.status());
        logger.info(`Empty strings handled with status: ${response.status()}`);
    });

    test('Verify POST to invalid endpoint returns 404 @negative', async () => {
        logger.info('Starting test: POST to invalid endpoint');
        
        const invalidUrl = `${_config.baseEndpoint}/invalid-endpoint`;
        const payload = {
            title: faker.lorem.sentence(),
            body: faker.lorem.paragraphs(2),
            userId: 1
        };

        const response = await common.postResponse(invalidUrl, payload as any);
        expect(response.status()).toBe(404);
        
        logger.info(`Invalid endpoint properly returned 404`);
    });

});
