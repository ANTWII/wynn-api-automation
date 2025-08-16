import { test, expect } from '@playwright/test';
import { logger } from '../utils/logger';
import { postsReadService } from '../services/postsReadService';

test.describe('Posts Read API Tests', () => {

  test('Verify GET /posts returns all posts successfully', { tag: ["@smoke", "@regression"] }, async () => {
    logger.info('Starting test: Verify GET /posts returns all posts successfully');
    
    try {
      const result = await postsReadService.getAllPosts();
      
      expect(result.response.status()).toBe(200);
      expect(Array.isArray(result.data)).toBeTruthy();
      expect(result.data.length).toBeGreaterThan(0);
      
      // Verify first post structure
      await postsReadService.validatePostStructure(result.data[0]);
      
    } catch (error) {
      logger.error('Test failed: Verify GET /posts returns all posts successfully', error as Error);
      throw error;
    }
  });

  test('Verify GET /posts/{id} returns specific post successfully', { tag: ["@smoke", "@regression"] }, async () => {
    logger.info('Starting test: Verify GET /posts/{id} returns specific post successfully');
    
    try {
      const postId = 1;
      const result = await postsReadService.getPostById(postId);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(postId);
      
      // Validate post structure
      await postsReadService.validatePostStructure(result.data);
      
    } catch (error) {
      logger.error('Test failed: Verify GET /posts/{id} returns specific post successfully', error as Error);
      throw error;
    }
  });

  test('Verify GET /posts/{id} with invalid ID returns empty object', { tag: ["@regression"] }, async () => {
    logger.info('Starting test: Verify GET /posts/{id} with invalid ID returns empty object');
    
    try {
      const invalidPostId = 999999;
      const result = await postsReadService.getPostById(invalidPostId);
      
      expect(result.response.status()).toBe(200);
      expect(result.data).toEqual({});
      
    } catch (error) {
      logger.error('Test failed: Verify GET /posts/{id} with invalid ID returns empty object', error as Error);
      throw error;
    }
  });

  test('Verify GET /posts returns consistent data structure across all posts', { tag: ["@regression"] }, async () => {
    logger.info('Starting test: Verify GET /posts returns consistent data structure across all posts');
    
    try {
      const result = await postsReadService.getAllPosts();
      
      expect(result.response.status()).toBe(200);
      expect(result.data.length).toBe(100); // JSONPlaceholder returns 100 posts
      
      // Validate multiple posts structure
      for (let i = 0; i < 3; i++) {
        await postsReadService.validatePostStructure(result.data[i]);
      }
      
    } catch (error) {
      logger.error('Test failed: Verify GET /posts returns consistent data structure across all posts', error as Error);
      throw error;
    }
  });

});
