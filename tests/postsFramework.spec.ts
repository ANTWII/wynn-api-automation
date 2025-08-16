import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { logger } from '../utils/logger';
import { postsTestDataManager } from '../utils/postsTestDataManager';
import { postsReadService } from '../services/postsReadService';
import { postsUpdateService } from '../services/postsUpdateService';
import { postsDeleteService } from '../services/postsDeleteService';
import { PostCreatePayload } from '../requests/postsCreateRequests';
import { PostUpdatePayload, PostFullUpdatePayload } from '../requests/postsUpdateRequests';

test.describe('Posts CRUD Framework Tests', () => {

  test.beforeAll(async () => {
    await postsTestDataManager.initialize();
  });

  test.afterAll(async () => {
    const cleanup = await postsTestDataManager.cleanupAllManagedPosts();
    logger.info(`Framework cleanup completed: ${cleanup.success} successful, ${cleanup.failed} failed`);
  });

  test('Verify framework can create multiple managed posts', { tag: ["@framework"] }, async () => {
    logger.info('Starting test: Verify framework can create multiple managed posts');
    
    try {
      const testPosts = [
        { title: faker.lorem.sentence(6), body: faker.lorem.paragraph() },
        { title: faker.lorem.sentence(8), body: faker.lorem.paragraphs(2) },
        { title: faker.lorem.sentence(4), body: faker.lorem.paragraph() }
      ];

      const createdPosts = [];
      for (const testPost of testPosts) {
        const post = await postsTestDataManager.createManagedPostWithRealUserId(testPost.title, testPost.body);
        createdPosts.push(post);
      }
      
      expect(createdPosts.length).toBe(3);
      
      for (const post of createdPosts) {
        expect(post.id).toBeGreaterThan(0);
        expect(post.isCreatedByFramework).toBe(true);
      }
      
      const summary = postsTestDataManager.getSummary();
      expect(summary.created).toBeGreaterThanOrEqual(3);
      
      logger.info(`Successfully created and verified ${createdPosts.length} managed posts`);
      
    } catch (error) {
      logger.error('Test failed: Verify framework can create multiple managed posts', error as Error);
      throw error;
    }
  });

  test('Verify framework can create and retrieve managed post', { tag: ["@framework"] }, async () => {
    logger.info('Starting test: Verify framework can create and retrieve managed post');
    
    try {
      const testTitle = faker.lorem.sentence(7);
      const testBody = faker.lorem.paragraphs(2);
      
      const managedPost = await postsTestDataManager.createManagedPostWithRealUserId(testTitle, testBody);
      
      expect(managedPost.id).toBeGreaterThan(0);
      expect(managedPost.title).toBe(testTitle);
      expect(managedPost.body).toBe(testBody);
      expect(managedPost.isCreatedByFramework).toBe(true);
      
      // Try to find it by ID
      const retrievedPost = postsTestDataManager.findManagedPostById(managedPost.id);
      expect(retrievedPost).not.toBeNull();
      expect(retrievedPost!.id).toBe(managedPost.id);
      
      logger.info(`Successfully created and retrieved managed post with ID: ${managedPost.id}`);
      
    } catch (error) {
      logger.error('Test failed: Verify framework can create and retrieve managed post', error as Error);
      throw error;
    }
  });

  test('Verify framework can get real API post data', { tag: ["@framework"] }, async () => {
    logger.info('Starting test: Verify framework can get real API post data');
    
    try {
      const realPost = postsTestDataManager.getRealApiPost();
      
      expect(realPost).not.toBeNull();
      expect(realPost.id).toBeGreaterThan(0);
      expect(realPost.title).toBeTruthy();
      expect(realPost.body).toBeTruthy();
      expect(realPost.userId).toBeGreaterThan(0);
      expect(realPost.isCreatedByFramework).toBe(false);
      
      logger.info(`Successfully retrieved real API post: ID=${realPost.id}, UserID=${realPost.userId}`);
      
    } catch (error) {
      logger.error('Test failed: Verify framework can get real API post data', error as Error);
      throw error;
    }
  });

  test('Verify framework can get all managed posts', { tag: ["@framework"] }, async () => {
    logger.info('Starting test: Verify framework can get all managed posts');
    
    try {
      const initialCount = postsTestDataManager.getManagedPostsCount();
      
      // Create a test post
      const testPost = await postsTestDataManager.createManagedPostWithRealUserId(
        faker.lorem.sentence(5),
        faker.lorem.paragraph()
      );
      
      const allPosts = postsTestDataManager.getAllManagedPosts();
      expect(allPosts.length).toBe(initialCount + 1);
      
      const foundPost = allPosts.find(p => p.id === testPost.id);
      expect(foundPost).toBeDefined();
      expect(foundPost!.isCreatedByFramework).toBe(true);
      
      logger.info(`Successfully verified managed posts collection: ${allPosts.length} posts`);
      
    } catch (error) {
      logger.error('Test failed: Verify framework can get all managed posts', error as Error);
      throw error;
    }
  });

  test('Verify framework can perform CRUD operations on managed post', { tag: ["@framework", "@integration"] }, async () => {
    logger.info('Starting test: Verify framework can perform CRUD operations on managed post');
    
    try {
      // CREATE - via framework
      const originalTitle = faker.lorem.sentence(6);
      const originalBody = faker.lorem.paragraphs(2);
      const managedPost = await postsTestDataManager.createManagedPostWithRealUserId(originalTitle, originalBody);
      
      expect(managedPost.id).toBeGreaterThan(0);
      expect(managedPost.isCreatedByFramework).toBe(true);
      
      // READ - via API service
      const readResult = await postsReadService.getPostById(managedPost.id);
      expect(readResult.response.status()).toBe(200);
      expect(readResult.data.id).toBe(managedPost.id);
      
      // UPDATE - via API service
      const updatedTitle = faker.lorem.sentence(8);
      const updatedBody = faker.lorem.paragraph();
      const updatePayload: PostUpdatePayload = {
        title: updatedTitle,
        body: updatedBody
      };
      
      const updateResult = await postsUpdateService.patchPost(managedPost.id, updatePayload);
      expect(updateResult.response.status()).toBe(200);
      expect(updateResult.data.title).toBe(updatedTitle);
      expect(updateResult.data.body).toBe(updatedBody);
      
      // DELETE - verify the framework will clean it up later
      const foundPost = postsTestDataManager.findManagedPostById(managedPost.id);
      expect(foundPost).not.toBeNull();
      expect(foundPost!.isCreatedByFramework).toBe(true);
      
      logger.info(`Successfully performed CRUD operations on managed post ${managedPost.id}`);
      
    } catch (error) {
      logger.error('Test failed: Verify framework can perform CRUD operations on managed post', error as Error);
      throw error;
    }
  });

  test('Verify framework summary provides accurate counts', { tag: ["@framework"] }, async () => {
    logger.info('Starting test: Verify framework summary provides accurate counts');
    
    try {
      const initialSummary = postsTestDataManager.getSummary();
      
      // Create one framework post
      await postsTestDataManager.createManagedPostWithRealUserId(
        faker.lorem.sentence(5),
        faker.lorem.paragraph()
      );
      
      // Get one real API post
      postsTestDataManager.getRealApiPost();
      
      const finalSummary = postsTestDataManager.getSummary();
      
      expect(finalSummary.created).toBe(initialSummary.created + 1);
      expect(finalSummary.real).toBeGreaterThanOrEqual(initialSummary.real + 1);
      expect(finalSummary.total).toBe(finalSummary.created + finalSummary.real);
      
      logger.info(`Framework summary verified - Created: ${finalSummary.created}, Real: ${finalSummary.real}, Total: ${finalSummary.total}`);
      
    } catch (error) {
      logger.error('Test failed: Verify framework summary provides accurate counts', error as Error);
      throw error;
    }
  });

  test('Verify framework cleanup removes only created posts', { tag: ["@framework", "@cleanup"] }, async () => {
    logger.info('Starting test: Verify framework cleanup removes only created posts');
    
    try {
      // Get initial counts
      const initialSummary = postsTestDataManager.getSummary();
      
      // Create posts that will be cleaned up
      const batchPosts = [];
      for (let i = 0; i < 2; i++) {
        const post = await postsTestDataManager.createManagedPostWithRealUserId(
          faker.lorem.sentence(5),
          faker.lorem.paragraph()
        );
        batchPosts.push(post);
      }
      
      // Get real API posts (should not be cleaned up)
      postsTestDataManager.getRealApiPost();
      
      const preCleanupSummary = postsTestDataManager.getSummary();
      expect(preCleanupSummary.created).toBe(initialSummary.created + 2);
      
      // Verify posts exist
      for (const post of batchPosts) {
        const found = postsTestDataManager.findManagedPostById(post.id);
        expect(found).not.toBeNull();
      }
      
      // Perform cleanup
      const cleanup = await postsTestDataManager.cleanupAllManagedPosts();
      expect(cleanup.success).toBeGreaterThanOrEqual(2);
      
      const postCleanupSummary = postsTestDataManager.getSummary();
      expect(postCleanupSummary.created).toBe(0);
      
      // Real API posts should still be tracked
      expect(postCleanupSummary.real).toBeGreaterThanOrEqual(1);
      
      logger.info(`Successfully verified cleanup: ${cleanup.success} posts cleaned, ${postCleanupSummary.real} real posts retained`);
      
    } catch (error) {
      logger.error('Test failed: Verify framework cleanup removes only created posts', error as Error);
      throw error;
    }
  });

});
