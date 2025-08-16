import { test, expect } from '@playwright/test';
import { logger } from '../utils/logger';
import { apiDataExtractor } from '../utils/apiDataExtractor';
import { postsDeleteService } from '../services/postsDeleteService';

test.describe('Posts Delete API Tests', () => {
  let extractedPostId: number;
  let extractedUserId: number;

  test.beforeAll(async () => {
    logger.info('Extracting real data from JSONPlaceholder API for Delete tests...');
    
    // Initialize data extractor
    await apiDataExtractor.extractPostsData();
    
    // Get a real post to use for testing
    const realPost = apiDataExtractor.getRandomPostData();
    extractedPostId = realPost.postId;
    extractedUserId = realPost.userId;
    
    logger.info(`Extracted real data: PostID=${extractedPostId}, UserID=${extractedUserId}`);
  });

  test('Verify DELETE /posts/{id} deletes post successfully', { tag: ["@smoke", "@regression"] }, async () => {
    logger.info(`Starting test: Verify DELETE /posts/${extractedPostId} deletes post successfully`);
    
    try {
      const result = await postsDeleteService.deletePost(extractedPostId);
      
      expect(result.response.status()).toBe(200);
      expect(result.success).toBeTruthy();
      expect(result.deletedId).toBe(extractedPostId);
      
      logger.info(`Successfully deleted post: ID=${extractedPostId}`);
      
    } catch (error) {
      logger.error(`Test failed: Verify DELETE /posts/${extractedPostId} deletes post successfully`, error as Error);
      throw error;
    }
  });

  test('Verify DELETE /posts/{id} with valid ID returns success response', { tag: ["@smoke", "@regression"] }, async () => {
    logger.info('Starting test: Verify DELETE /posts/{id} with valid ID returns success response');
    
    try {
      const postId = 10;
      
      const result = await postsDeleteService.deletePost(postId);
      
      expect(result.response.status()).toBe(200);
      expect(result.success).toBe(true);
      expect(result.deletedId).toBe(postId);
      
    } catch (error) {
      logger.error('Test failed: Verify DELETE /posts/{id} with valid ID returns success response', error as Error);
      throw error;
    }
  });

  test('Verify DELETE /posts/{id} with different post IDs works correctly', { tag: ["@regression"] }, async () => {
    logger.info('Starting test: Verify DELETE /posts/{id} with different post IDs works correctly');
    
    try {
      // Get additional real post IDs from the extracted data
      const post1 = apiDataExtractor.getRandomPostData();
      const post2 = apiDataExtractor.getRandomPostData();
      const post3 = apiDataExtractor.getRandomPostData();
      const additionalPosts = [post1, post2, post3];
      
      for (const post of additionalPosts) {
        const result = await postsDeleteService.deletePost(post.postId);
        
        expect(result.response.status()).toBe(200);
        expect(result.success).toBeTruthy();
        expect(result.deletedId).toBe(post.postId);
        
        logger.info(`Successfully deleted post: ID=${post.postId}`);
      }
      
    } catch (error) {
      logger.error('Test failed: Verify DELETE /posts/{id} with different post IDs works correctly', error as Error);
      throw error;
    }
  });

  test('Verify DELETE /posts/{id} with non-existent ID handles gracefully', { tag: ["@regression"] }, async () => {
    logger.info('Starting test: Verify DELETE /posts/{id} with non-existent ID handles gracefully');
    
    try {
      const nonExistentId = 999999;
      
      const result = await postsDeleteService.deletePost(nonExistentId);
      
      // JSONPlaceholder returns 200 even for non-existent IDs
      expect(result.response.status()).toBe(200);
      expect(result.success).toBeTruthy();
      expect(result.deletedId).toBe(nonExistentId);
      
    } catch (error) {
      logger.error('Test failed: Verify DELETE /posts/{id} with non-existent ID handles gracefully', error as Error);
      throw error;
    }
  });

});
