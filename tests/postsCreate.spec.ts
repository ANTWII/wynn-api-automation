import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { logger } from '../utils/logger';
import { apiDataExtractor } from '../utils/apiDataExtractor';
import { postsCreateService } from '../services/postsCreateService';
import { PostCreatePayload } from '../requests/postsCreateRequests';

test.describe('Posts Create API Tests', () => {
  let extractedUserId: number;

  test.beforeAll(async () => {
    logger.info('Extracting real data from JSONPlaceholder API for Create tests...');
    
    // Initialize data extractor
    await apiDataExtractor.extractPostsData();
    
    // Get a real user ID to use for testing
    const realPost = apiDataExtractor.getRandomPostData();
    extractedUserId = realPost.userId;
    
    logger.info(`Extracted real data: UserID=${extractedUserId}`);
  });

  test('Verify POST /posts creates new post successfully', { tag: ["@smoke", "@regression"] }, async () => {
    logger.info('Starting test: Verify POST /posts creates new post successfully');
    
    try {
      const testTitle = faker.lorem.sentence(6);
      const testBody = faker.lorem.paragraphs(2);
      
      const payload: PostCreatePayload = {
        title: testTitle,
        body: testBody,
        userId: extractedUserId
      };
      
      const result = await postsCreateService.createPost(payload);
      
      expect(result.response.status()).toBe(201);
      expect(result.data.id).toBeGreaterThan(0);
      expect(result.data.title).toBe(testTitle);
      expect(result.data.body).toBe(testBody);
      expect(result.data.userId).toBe(payload.userId);
      
    } catch (error) {
      logger.error('Test failed: Verify POST /posts creates new post successfully', error as Error);
      throw error;
    }
  });

  test('Verify POST /posts with valid payload returns correct response structure', { tag: ["@smoke", "@regression"] }, async () => {
    logger.info('Starting test: Verify POST /posts with valid payload returns correct response structure');
    
    try {
      const testTitle = faker.lorem.sentence(8);
      const testBody = faker.lorem.paragraph();
      
      const payload: PostCreatePayload = {
        title: testTitle,
        body: testBody,
        userId: extractedUserId
      };
      
      const result = await postsCreateService.createPost(payload);
      
      expect(result.response.status()).toBe(201);
      await postsCreateService.validateCreatedPost(result.data, payload);
      
    } catch (error) {
      logger.error('Test failed: Verify POST /posts with valid payload returns correct response structure', error as Error);
      throw error;
    }
  });

  test('Verify POST /posts with long content creates post successfully', { tag: ["@regression"] }, async () => {
    logger.info('Starting test: Verify POST /posts with long content creates post successfully');
    
    try {
      const longTitle = faker.lorem.sentence(20); // Long title
      const longBody = faker.lorem.paragraphs(5); // Long body content
      
      const payload: PostCreatePayload = {
        title: longTitle,
        body: longBody,
        userId: extractedUserId
      };
      
      const result = await postsCreateService.createPost(payload);
      
      expect(result.response.status()).toBe(201);
      await postsCreateService.validateCreatedPost(result.data, payload);
      
    } catch (error) {
      logger.error('Test failed: Verify POST /posts with long content creates post successfully', error as Error);
      throw error;
    }
  });

  test('Verify POST /posts with special characters creates post successfully', { tag: ["@regression"] }, async () => {
    logger.info('Starting test: Verify POST /posts with special characters creates post successfully');
    
    try {
      const specialTitle = `${faker.lorem.sentence(5)} !@#$%^&*()`;
      const specialBody = `${faker.lorem.paragraph()} - Special chars: áéíóú ñ çü ß 你好 🎉`;
      
      const payload: PostCreatePayload = {
        title: specialTitle,
        body: specialBody,
        userId: extractedUserId
      };
      
      const result = await postsCreateService.createPost(payload);
      
      expect(result.response.status()).toBe(201);
      await postsCreateService.validateCreatedPost(result.data, payload);
      
    } catch (error) {
      logger.error('Test failed: Verify POST /posts with special characters creates post successfully', error as Error);
      throw error;
    }
  });

});
