import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { logger } from '../utils/logger';
import { apiDataExtractor } from '../utils/apiDataExtractor';
import { postsReadService } from '../services/postsReadService';
import { postsCreateService } from '../services/postsCreateService';
import { postsUpdateService } from '../services/postsUpdateService';
import { postsDeleteService } from '../services/postsDeleteService';
import { PostCreatePayload } from '../requests/postsCreateRequests';
import { PostUpdatePayload, PostFullUpdatePayload } from '../requests/postsUpdateRequests';

test.describe('JSONPlaceholder API Tests - API Flow', () => {
  let extractedPostId: number;
  let extractedUserId: number;
  let createdPostId: number;

  test.beforeAll(async () => {
    logger.info('Extracting real data from JSONPlaceholder API for API-style tests...');
    
    // Initialize data extractor
    await apiDataExtractor.extractPostsData();
    
    // Get a real post to use for testing
    const realPost = apiDataExtractor.getRandomPostData();
    extractedPostId = realPost.postId;
    extractedUserId = realPost.userId;
    
    logger.info(`Extracted real data: PostID=${extractedPostId}, UserID=${extractedUserId}`);
  });

  test('GET /posts/{id} - Get specific post', { tag: ["@api-flow"] }, async () => {
    logger.info(`Starting test: GET /posts/${extractedPostId} - Get specific post`);
    
    try {
      // Use the extracted post ID instead of hardcoded 1
      const result = await postsReadService.getPostById(extractedPostId);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(extractedPostId);
      expect(result.data.title).toBeTruthy();
      expect(result.data.body).toBeTruthy();
      expect(result.data.userId).toBeTruthy();
      
      logger.info(`Successfully retrieved post: ID=${result.data.id}, Title="${result.data.title.substring(0, 30)}..."`);
      
    } catch (error) {
      logger.error(`Test failed: GET /posts/${extractedPostId} - Get specific post`, error as Error);
      throw error;
    }
  });

  test('GET /posts - Get all posts', { tag: ["@api-flow"] }, async () => {
    logger.info('Starting test: GET /posts - Get all posts');
    
    try {
      const result = await postsReadService.getAllPosts();
      
      expect(result.response.status()).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      
      // Verify structure of first post
      const firstPost = result.data[0];
      expect(firstPost.id).toBeTruthy();
      expect(firstPost.title).toBeTruthy();
      expect(firstPost.body).toBeTruthy();
      expect(firstPost.userId).toBeTruthy();
      
      logger.info(`Successfully retrieved ${result.data.length} posts from API`);
      
    } catch (error) {
      logger.error('Test failed: GET /posts - Get all posts', error as Error);
      throw error;
    }
  });

  test('POST /posts - Create new post', { tag: ["@api-flow"] }, async () => {
    logger.info('Starting test: POST /posts - Create new post');
    
    try {
      // Generate dynamic test data with Faker
      const testTitle = faker.lorem.sentence(6);
      const testBody = faker.lorem.paragraphs(2);
      
      const payload: PostCreatePayload = {
        title: testTitle,
        body: testBody, 
        userId: extractedUserId // Use real user ID from extracted data
      };
      
      const result = await postsCreateService.createPost(payload);
      
      expect(result.response.status()).toBe(201);
      expect(result.data.id).toBeGreaterThan(0);
      expect(result.data.title).toBe(testTitle);
      expect(result.data.body).toBe(testBody);
      expect(result.data.userId).toBe(extractedUserId);
      
      // Store created post ID for subsequent tests
      createdPostId = result.data.id;
      
      logger.info(`Successfully created post: ID=${createdPostId}, UserID=${extractedUserId}`);
      
    } catch (error) {
      logger.error('Test failed: POST /posts - Create new post', error as Error);
      throw error;
    }
  });

  test('PUT /posts/1 - Full update post', { tag: ["@api-flow"] }, async () => {
    logger.info(`Starting test: PUT /posts/${extractedPostId} - Full update post`);
    
    try {
      // Generate dynamic test data with Faker
      const testTitle = faker.lorem.sentence(5);
      const testBody = faker.lorem.paragraph();
      
      const payload: PostFullUpdatePayload = {
        id: extractedPostId,
        title: testTitle,
        body: testBody,
        userId: extractedUserId
      };
      
      const result = await postsUpdateService.putPost(extractedPostId, payload);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(extractedPostId);
      expect(result.data.title).toBe(testTitle);
      expect(result.data.body).toBe(testBody);
      expect(result.data.userId).toBe(extractedUserId);
      
      logger.info(`Successfully updated post with PUT: ID=${extractedPostId}`);
      
    } catch (error) {
      logger.error(`Test failed: PUT /posts/${extractedPostId} - Full update post`, error as Error);
      throw error;
    }
  });

  test('PATCH /posts/1 - Partial update post', { tag: ["@api-flow"] }, async () => {
    logger.info(`Starting test: PATCH /posts/${extractedPostId} - Partial update post`);
    
    try {
      // Generate dynamic test data with Faker
      const testTitle = faker.lorem.sentence(4);
      
      const payload: PostUpdatePayload = {
        title: testTitle
      };
      
      const result = await postsUpdateService.patchPost(extractedPostId, payload);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(extractedPostId);
      expect(result.data.title).toBe(testTitle);
      // Other fields should remain from the original post
      expect(result.data.body).toBeTruthy();
      expect(result.data.userId).toBeTruthy();
      
      logger.info(`Successfully updated post with PATCH: ID=${extractedPostId}`);
      
    } catch (error) {
      logger.error(`Test failed: PATCH /posts/${extractedPostId} - Partial update post`, error as Error);
      throw error;
    }
  });

  test('DELETE /posts/1 - Delete post', { tag: ["@api-flow"] }, async () => {
    logger.info(`Starting test: DELETE /posts/${extractedPostId} - Delete post`);
    
    try {
      const result = await postsDeleteService.deletePost(extractedPostId);
      
      expect(result.response.status()).toBe(200);
      expect(result.success).toBeTruthy();
      expect(result.deletedId).toBe(extractedPostId);
      
      logger.info(`Successfully deleted post: ID=${extractedPostId}`);
      
    } catch (error) {
      logger.error('Test failed: DELETE /posts/1 - Delete post', error as Error);
      throw error;
    }
  });

  test('Complete API Collection Flow - Sequential CRUD Operations', { tag: ["@api-flow", "@integration"] }, async () => {
    logger.info('Starting test: Complete API Collection Flow - Sequential CRUD Operations');
    
    try {
      // Generate dynamic test data with Faker for consistent use across operations
      const workflowTitle = faker.lorem.sentence(7);
      const workflowBody = faker.lorem.paragraphs(3);
      const patchTitle = faker.lorem.sentence(5);
      
      // 1. GET /posts/1 - Get specific post (using extracted ID)
      logger.info('Step 1: GET /posts/1');
      const getSpecificResult = await postsReadService.getPostById(extractedPostId);
      expect(getSpecificResult.response.status()).toBe(200);
      expect(getSpecificResult.data.id).toBe(extractedPostId);
      
      // 2. GET /posts - Get all posts  
      logger.info('Step 2: GET /posts');
      const getAllResult = await postsReadService.getAllPosts();
      expect(getAllResult.response.status()).toBe(200);
      expect(Array.isArray(getAllResult.data)).toBe(true);
      
      // 3. POST /posts - Create new post
      logger.info('Step 3: POST /posts');
      const createPayload: PostCreatePayload = {
        title: workflowTitle,
        body: workflowBody,
        userId: extractedUserId
      };
      const createResult = await postsCreateService.createPost(createPayload);
      expect(createResult.response.status()).toBe(201);
      const workflowPostId = createResult.data.id;
      
      // 4. PUT /posts/{id} - Full update (use existing post ID, not newly created one)
      logger.info('Step 4: PUT /posts/{id} (using existing post)');
      const putPayload: PostFullUpdatePayload = {
        id: extractedPostId, // Use existing post ID instead of newly created one
        title: workflowTitle,
        body: workflowBody, 
        userId: extractedUserId
      };
      const putResult = await postsUpdateService.putPost(extractedPostId, putPayload);
      expect(putResult.response.status()).toBe(200);
      expect(putResult.data.title).toBe(workflowTitle);
      
      // 5. PATCH /posts/{id} - Partial update (use existing post ID)
      logger.info('Step 5: PATCH /posts/{id} (using existing post)');
      const patchPayload: PostUpdatePayload = {
        title: patchTitle
      };
      const patchResult = await postsUpdateService.patchPost(extractedPostId, patchPayload);
      expect(patchResult.response.status()).toBe(200);
      expect(patchResult.data.title).toBe(patchTitle);
      
      // 6. DELETE /posts/{id} - Delete existing post (not the created one)
      logger.info('Step 6: DELETE /posts/{id} (using existing post)');
      const deleteResult = await postsDeleteService.deletePost(extractedPostId);
      expect(deleteResult.response.status()).toBe(200);
      expect(deleteResult.success).toBeTruthy();
      
      logger.info(`Successfully completed full API collection flow using extracted PostID=${extractedPostId}, UserID=${extractedUserId}, CreatedID=${workflowPostId}`);
      
    } catch (error) {
      logger.error('Test failed: Complete API Collection Flow - Sequential CRUD Operations', error as Error);
      throw error;
    }
  });

});
