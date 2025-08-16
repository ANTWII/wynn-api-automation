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

// Simple data management for this test
interface TestPost {
  id: number;
  title: string;
  body: string;
  userId: number;
  createdByTest: boolean;
}

let testPosts: TestPost[] = [];
let extractedUserIds: number[] = [];
let extractedPostIds: number[] = [];

test.describe('Posts API Tests with Real Data Flow Management', () => {

  test.beforeAll(async () => {
    logger.info('Initializing real data flow tests with API data extraction...');
    
    // Extract real data from API
    await apiDataExtractor.extractPostsData();
    
    // Get collections of real IDs
    extractedUserIds = apiDataExtractor.getUniqueUserIds();
    const postsData = await apiDataExtractor.extractPostsData();
    extractedPostIds = postsData.map(post => post.postId).slice(0, 10); // Take first 10 for testing
    
    logger.info(`Extracted ${extractedUserIds.length} unique user IDs and ${extractedPostIds.length} post IDs for testing`);
  });

  test.afterAll(async () => {
    logger.info('Cleaning up test-created posts...');
    let cleanupCount = 0;
    
    for (const post of testPosts) {
      if (post.createdByTest) {
        try {
          await postsDeleteService.deletePost(post.id);
          cleanupCount++;
        } catch (error) {
          logger.error(`Failed to cleanup post ${post.id}`, error as Error);
        }
      }
    }
    
    logger.info(`Cleaned up ${cleanupCount} test-created posts`);
    testPosts = [];
  });

  test('Extract and validate real API data structure', { tag: ["@real-data-flow"] }, async () => {
    logger.info('Starting test: Extract and validate real API data structure');
    
    try {
      // Verify we extracted meaningful data
      expect(extractedUserIds.length).toBeGreaterThan(0);
      expect(extractedPostIds.length).toBeGreaterThan(0);
      
      // Get a sample post to validate structure
      const samplePostId = extractedPostIds[0];
      const samplePost = apiDataExtractor.getPostById(samplePostId);
      
      expect(samplePost).not.toBeNull();
      expect(samplePost?.postId).toBe(samplePostId);
      expect(samplePost?.userId).toBeGreaterThan(0);
      expect(samplePost?.title).toBeTruthy();
      expect(samplePost?.body).toBeTruthy();
      
      // Verify extracted user IDs are in valid range (JSONPlaceholder has 10 users)
      for (const userId of extractedUserIds) {
        expect(userId).toBeGreaterThanOrEqual(1);
        expect(userId).toBeLessThanOrEqual(10);
      }
      
      logger.info(`Successfully validated real API data: ${extractedUserIds.length} users, ${extractedPostIds.length} posts`);
      
    } catch (error) {
      logger.error('Test failed: Extract and validate real API data structure', error as Error);
      throw error;
    }
  });

  test('Create post using extracted real user ID', { tag: ["@real-data-flow"] }, async () => {
    logger.info('Starting test: Create post using extracted real user ID');
    
    try {
      // Select a random real user ID
      const realUserId = extractedUserIds[Math.floor(Math.random() * extractedUserIds.length)];
      
      const testTitle = faker.lorem.sentence(7);
      const testBody = faker.lorem.paragraphs(2);
      
      const payload: PostCreatePayload = {
        title: testTitle,
        body: testBody,
        userId: realUserId
      };
      
      const result = await postsCreateService.createPost(payload);
      
      expect(result.response.status()).toBe(201);
      expect(result.data.id).toBeGreaterThan(0);
      expect(result.data.title).toBe(testTitle);
      expect(result.data.body).toBe(testBody);
      
      expect(result.response.status()).toBe(201);
      expect(result.data.id).toBeGreaterThan(0);
      expect(result.data.title).toBe(payload.title);
      expect(result.data.body).toBe(payload.body);
      expect(result.data.userId).toBe(realUserId);
      
      // Track this post for cleanup
      testPosts.push({
        id: result.data.id,
        title: result.data.title,
        body: result.data.body,
        userId: result.data.userId,
        createdByTest: true
      });
      
      logger.info(`Successfully created post with real user ID: PostID=${result.data.id}, UserID=${realUserId}`);
      
    } catch (error) {
      logger.error('Test failed: Create post using extracted real user ID', error as Error);
      throw error;
    }
  });

  test('Update existing post using extracted real data', { tag: ["@real-data-flow"] }, async () => {
    logger.info('Starting test: Update existing post using extracted real data');
    
    try {
      // Use an extracted real post ID and user ID
      const realPostId = extractedPostIds[Math.floor(Math.random() * extractedPostIds.length)];
      const realUserId = extractedUserIds[Math.floor(Math.random() * extractedUserIds.length)];
      
      // Perform PUT update
      const putPayload: PostFullUpdatePayload = {
        id: realPostId,
        title: `Real Data Flow - Updated Post ${realPostId}`,
        body: `This post was updated using real data: PostID=${realPostId}, UserID=${realUserId}`,
        userId: realUserId
      };
      
      const putResult = await postsUpdateService.putPost(realPostId, putPayload);
      
      expect(putResult.response.status()).toBe(200);
      expect(putResult.data.id).toBe(realPostId);
      expect(putResult.data.title).toBe(putPayload.title);
      expect(putResult.data.body).toBe(putPayload.body);
      expect(putResult.data.userId).toBe(realUserId);
      
      logger.info(`Successfully updated existing post: PostID=${realPostId}, UserID=${realUserId}`);
      
    } catch (error) {
      logger.error('Test failed: Update existing post using extracted real data', error as Error);
      throw error;
    }
  });

  test('Complete CRUD workflow using extracted real data', { tag: ["@real-data-flow", "@integration"] }, async () => {
    logger.info('Starting test: Complete CRUD workflow using extracted real data');
    
    try {
      const realUserId = extractedUserIds[Math.floor(Math.random() * extractedUserIds.length)];
      const realPostId = extractedPostIds[Math.floor(Math.random() * extractedPostIds.length)];
      
      logger.info(`CRUD Workflow using Real UserID=${realUserId}, Real PostID=${realPostId}`);
      
      // 1. CREATE - Create new post with real user ID
      const createPayload: PostCreatePayload = {
        title: `CRUD Workflow - Real UserID ${realUserId}`,
        body: `Complete CRUD workflow test using extracted real user ID ${realUserId}`,
        userId: realUserId
      };
      
      const createResult = await postsCreateService.createPost(createPayload);
      expect(createResult.response.status()).toBe(201);
      const workflowPostId = createResult.data.id;
      
      // Track for cleanup
      testPosts.push({
        id: workflowPostId,
        title: createResult.data.title,
        body: createResult.data.body,
        userId: createResult.data.userId,
        createdByTest: true
      });
      
      // 2. READ - Read an existing post (JSONPlaceholder doesn't persist created posts)
      logger.info(`Reading existing real post for validation: PostID=${realPostId}`, { service: 'playwright-tests' });
      const readResult = await postsReadService.getPostById(realPostId);
      expect(readResult.response.status()).toBe(200);
      expect(readResult.data.id).toBe(realPostId);
      
      // 3. UPDATE (PUT) - Full update using different real user ID (use existing post instead)
      const differentUserId = extractedUserIds.find(id => id !== realUserId) || realUserId;
      const putPayload: PostFullUpdatePayload = {
        id: realPostId, // Use existing post for PUT to avoid 500 error
        title: `CRUD Updated - UserID ${differentUserId}`,
        body: `Updated via PUT with different real user ID ${differentUserId}`,
        userId: differentUserId
      };
      
      const putResult = await postsUpdateService.putPost(realPostId, putPayload);
      expect(putResult.response.status()).toBe(200);
      expect(putResult.data.userId).toBe(differentUserId);
      
      // 4. UPDATE (PATCH) - Partial update on existing post
      const patchPayload: PostUpdatePayload = {
        title: `CRUD Final - Complete Real Data Workflow`,
        body: `Final update in CRUD workflow using real extracted data`
      };
      
      const patchResult = await postsUpdateService.patchPost(realPostId, patchPayload);
      expect(patchResult.response.status()).toBe(200);
      expect(patchResult.data.title).toBe(patchPayload.title);
      
      // 5. DELETE - Clean up the created post (not the existing one we updated)
      const deleteResult = await postsDeleteService.deletePost(workflowPostId);
      expect(deleteResult.response.status()).toBe(200);
      expect(deleteResult.success).toBeTruthy();
      
      // Remove from tracking since we manually deleted it
      testPosts = testPosts.filter(post => post.id !== workflowPostId);
      
      logger.info(`Complete CRUD workflow successful: Created=${workflowPostId}, Updated=${realPostId}, UserIDs=[${realUserId}, ${differentUserId}]`);
      
    } catch (error) {
      logger.error('Test failed: Complete CRUD workflow using extracted real data', error as Error);
      throw error;
    }
  });

});