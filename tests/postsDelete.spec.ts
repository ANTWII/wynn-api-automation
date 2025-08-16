import { test, expect } from '@playwright/test';
import { logger } from '../utils/logger';
import { postsDeleteService } from '../services/postsDeleteService';

test.describe('Posts Delete API Tests', () => {

  test('Verify DELETE /posts/{id} deletes post successfully', { tag: ["@smoke", "@regression"] }, async () => {
    logger.info('Starting test: Verify DELETE /posts/{id} deletes post successfully');
    
    try {
      const postId = 1;
      
      const result = await postsDeleteService.deletePost(postId);
      
      expect(result.response.status()).toBe(200);
      expect(result.success).toBeTruthy();
      expect(result.deletedId).toBe(postId);
      
    } catch (error) {
      logger.error('Test failed: Verify DELETE /posts/{id} deletes post successfully', error as Error);
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
      const postIds = [5, 25, 50];
      
      for (const postId of postIds) {
        const result = await postsDeleteService.deletePost(postId);
        
        expect(result.response.status()).toBe(200);
        expect(result.success).toBeTruthy();
        expect(result.deletedId).toBe(postId);
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
