import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { logger } from '../utils/logger';
import { apiDataExtractor } from '../utils/apiDataExtractor';
import { postsCreateService } from '../services/postsCreateService';
import { postsReadService } from '../services/postsReadService';
import { postsUpdateService } from '../services/postsUpdateService';
import { postsDeleteService } from '../services/postsDeleteService';
import { PostCreatePayload } from '../requests/postsCreateRequests';
import { PostUpdatePayload, PostFullUpdatePayload } from '../requests/postsUpdateRequests';

// Store extracted post data for reuse across tests
let extractedPostIds: number[] = [];
let extractedUserIds: number[] = [];

test.describe('Posts CRUD Integration Tests', () => {

  test.beforeAll(async () => {
    logger.info('Extracting real data from JSONPlaceholder API for CRUD Integration tests...');
    
    // Initialize data extractor
    await apiDataExtractor.extractPostsData();
    
    // Get multiple real posts to use for testing
    const realPost1 = apiDataExtractor.getRandomPostData();
    const realPost2 = apiDataExtractor.getRandomPostData(); 
    const realPost3 = apiDataExtractor.getRandomPostData();
    
    extractedPostIds = [realPost1.postId, realPost2.postId, realPost3.postId];
    extractedUserIds = [realPost1.userId, realPost2.userId, realPost3.userId];
    
    logger.info(`Extracted real data: PostIDs=[${extractedPostIds.join(', ')}], UserIDs=[${extractedUserIds.join(', ')}]`);
  });

  test('Verify POST /posts creates and stores new post successfully', { tag: ["@smoke", "@integration"] }, async () => {
    logger.info('Starting test: Verify POST /posts creates and stores new post successfully');
    
    try {
      const testTitle = faker.lorem.sentence(7);
      const testBody = faker.lorem.paragraphs(2);
      
      const payload: PostCreatePayload = {
        title: testTitle,
        body: testBody,
        userId: 4
      };
      
      const result = await postsCreateService.createPost(payload);
      
      expect(result.response.status()).toBe(201);
      expect(result.data.id).toBeGreaterThan(0);
      expect(result.data.title).toBe(testTitle);
      expect(result.data.body).toBe(testBody);
      expect(result.data.userId).toBe(payload.userId);
      
      // Store the created post ID for potential use in other tests
      // Note: Using extracted post IDs instead for consistency
      
    } catch (error) {
      logger.error('Test failed: Verify POST /posts creates and stores new post successfully', error as Error);
      throw error;
    }
  });

  test('Verify GET /posts/{id} retrieves the created post by stored ID', { tag: ["@smoke", "@integration"] }, async () => {
    logger.info('Starting test: Verify GET /posts/{id} retrieves the created post by stored ID');
    
    try {
      // Use the third extracted post ID for read operations
      const storedPostId = extractedPostIds[2];
      expect(storedPostId).toBeGreaterThan(0);
      
      const result = await postsReadService.getPostById(storedPostId);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(storedPostId);
      expect(result.data.title).toContain('Integration Test Post 3');
      
      // Validate post structure
      await postsReadService.validatePostStructure(result.data);
      
    } catch (error) {
      logger.error('Test failed: Verify GET /posts/{id} retrieves the created post by stored ID', error as Error);
      throw error;
    }
  });

  test('Verify PUT /posts/{id} updates the created post using stored ID', { tag: ["@smoke", "@integration"] }, async () => {
    logger.info('Starting test: Verify PUT /posts/{id} updates the created post using stored ID');
    
    try {
      // Use the first extracted post ID for PUT operations
      const storedPostId = extractedPostIds[0];
      expect(storedPostId).toBeGreaterThan(0);
      
      const updatedTitle = faker.lorem.sentence(9);
      const updatedBody = faker.lorem.paragraphs(2);
      
      const fullUpdatePayload: PostFullUpdatePayload = {
        id: storedPostId,
        title: updatedTitle,
        body: updatedBody,
        userId: extractedUserIds[0]
      };
      
      const result = await postsUpdateService.putPost(storedPostId, fullUpdatePayload);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(storedPostId);
      expect(result.data.title).toBe(updatedTitle);
      expect(result.data.body).toBe(updatedBody);
      expect(result.data.body).toBe(fullUpdatePayload.body);
      expect(result.data.userId).toBe(fullUpdatePayload.userId);
      
    } catch (error) {
      logger.error('Test failed: Verify PUT /posts/{id} updates the created post using stored ID', error as Error);
      throw error;
    }
  });

  test('Verify PATCH /posts/{id} partially updates the created post using stored ID', { tag: ["@smoke", "@integration"] }, async () => {
    logger.info('Starting test: Verify PATCH /posts/{id} partially updates the created post using stored ID');
    
    try {
      // Use the first extracted post ID for PATCH operations (same as PUT test)
      const storedPostId = extractedPostIds[0];
      expect(storedPostId).toBeGreaterThan(0);
      
      const patchTitle = faker.lorem.sentence(8);
      const patchBody = faker.lorem.paragraph();
      
      const partialUpdatePayload: PostUpdatePayload = {
        title: patchTitle,
        body: patchBody
      };
      
      const result = await postsUpdateService.patchPost(storedPostId, partialUpdatePayload);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(storedPostId);
      expect(result.data.title).toBe(patchTitle);
      expect(result.data.body).toBe(patchBody);
      expect(result.data.title).toBe(partialUpdatePayload.title);
      expect(result.data.body).toBe(partialUpdatePayload.body);
      
      await postsUpdateService.validateUpdatedPost(result.data, partialUpdatePayload);
      
    } catch (error) {
      logger.error('Test failed: Verify PATCH /posts/{id} partially updates the created post using stored ID', error as Error);
      throw error;
    }
  });

  test('Verify DELETE /posts/{id} deletes the created post using stored ID', { tag: ["@smoke", "@integration"] }, async () => {
    logger.info('Starting test: Verify DELETE /posts/{id} deletes the created post using stored ID');
    
    try {
      // Use the second extracted post ID for DELETE operations
      const storedPostId = extractedPostIds[1];
      expect(storedPostId).toBeGreaterThan(0);
      
      const result = await postsDeleteService.deletePost(storedPostId);
      
      expect(result.response.status()).toBe(200);
      expect(result.success).toBeTruthy();
      expect(result.deletedId).toBe(storedPostId);
      
    } catch (error) {
      logger.error('Test failed: Verify DELETE /posts/{id} deletes the created post using stored ID', error as Error);
      throw error;
    }
  });

  test('Verify complete CRUD workflow with single post ID', { tag: ["@regression", "@integration"] }, async () => {
    logger.info('Starting test: Verify complete CRUD workflow with single post ID');
    
    try {
      // 1. CREATE - Create a new post
      const workflowTitle = faker.lorem.sentence(7);
      const workflowBody = faker.lorem.paragraphs(2);
      
      const createPayload: PostCreatePayload = {
        title: workflowTitle,
        body: workflowBody,
        userId: 5
      };
      
      const createResult = await postsCreateService.createPost(createPayload);
      expect(createResult.response.status()).toBe(201);
      const workflowPostId = createResult.data.id;
      
      // 2. READ - Verify the created post can be retrieved
      const readResult = await postsReadService.getPostById(workflowPostId);
      expect(readResult.response.status()).toBe(200);
      expect(readResult.data.id).toBe(workflowPostId);
      expect(readResult.data.title).toBe(workflowTitle);
      
      // 3. UPDATE (PUT) - Completely update the post
      const putTitle = faker.lorem.sentence(6);
      const putBody = faker.lorem.paragraph();
      
      const putPayload: PostFullUpdatePayload = {
        id: workflowPostId,
        title: putTitle,
        body: putBody,
        userId: 6
      };
      
      const putResult = await postsUpdateService.putPost(workflowPostId, putPayload);
      expect(putResult.response.status()).toBe(200);
      expect(putResult.data.title).toBe(putTitle);
      expect(putResult.data.body).toBe(putBody);
      
      // 4. UPDATE (PATCH) - Partially update the post
      const finalTitle = faker.lorem.sentence(5);
      
      const patchPayload: PostUpdatePayload = {
        title: finalTitle
      };
      
      const patchResult = await postsUpdateService.patchPost(workflowPostId, patchPayload);
      expect(patchResult.response.status()).toBe(200);
      expect(patchResult.data.title).toBe(finalTitle);
      
      // 5. DELETE - Remove the post
      const deleteResult = await postsDeleteService.deletePost(workflowPostId);
      expect(deleteResult.response.status()).toBe(200);
      expect(deleteResult.success).toBeTruthy();
      
    } catch (error) {
      logger.error('Test failed: Verify complete CRUD workflow with single post ID', error as Error);
      throw error;
    }
  });

});
