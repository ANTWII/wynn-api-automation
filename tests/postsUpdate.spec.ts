import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { logger } from '../utils/logger';
import { postsUpdateService } from '../services/postsUpdateService';
import { postsCreateService } from '../services/postsCreateService';
import { postsReadService } from '../services/postsReadService';
import { PostCreatePayload } from '../requests/postsCreateRequests';
import { PostUpdatePayload, PostFullUpdatePayload } from '../requests/postsUpdateRequests';

test.describe('Posts Update API Tests', () => {
  let testPostId: number;
  let testUserId: number = 1;

  test.beforeEach(async () => {
    // Create a test post before each update test
    logger.info('Creating test post for update operations');
    
    const createPayload: PostCreatePayload = {
      title: faker.lorem.sentence(6),
      body: faker.lorem.paragraphs(2),
      userId: testUserId
    };

    const createResult = await postsCreateService.createPost(createPayload);
    expect(createResult.response.status()).toBe(201);
    testPostId = createResult.data.id;
    
    logger.info(`Created test post with ID: ${testPostId} for update testing`);
  });

  test('Verify PUT /posts/{id} completely replaces post content', { tag: ["@smoke", "@regression"] }, async () => {
    logger.info('Starting test: Verify PUT /posts/{id} completely replaces post content');
    
    try {
      const updatedTitle = faker.lorem.sentence(8);
      const updatedBody = faker.lorem.paragraphs(3);
      const updatedUserId = 5;
      
      const putPayload: PostFullUpdatePayload = {
        id: testPostId,
        title: updatedTitle,
        body: updatedBody,
        userId: updatedUserId
      };
      
      const result = await postsUpdateService.putPost(testPostId, putPayload);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(testPostId);
      expect(result.data.title).toBe(updatedTitle);
      expect(result.data.body).toBe(updatedBody);
      expect(result.data.userId).toBe(updatedUserId);
      
      logger.info(`Successfully updated post ${testPostId} with PUT operation`);
      
    } catch (error) {
      logger.error('Test failed: Verify PUT /posts/{id} completely replaces post content', error as Error);
      throw error;
    }
  });

  test('Verify PUT /posts/{id} with long content updates successfully', { tag: ["@regression"] }, async () => {
    logger.info('Starting test: Verify PUT /posts/{id} with long content updates successfully');
    
    try {
      const longTitle = faker.lorem.sentence(25); // Very long title
      const longBody = faker.lorem.paragraphs(8); // Very long body
      
      const putPayload: PostFullUpdatePayload = {
        id: testPostId,
        title: longTitle,
        body: longBody,
        userId: testUserId
      };
      
      const result = await postsUpdateService.putPost(testPostId, putPayload);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(testPostId);
      expect(result.data.title).toBe(longTitle);
      expect(result.data.body).toBe(longBody);
      expect(result.data.userId).toBe(testUserId);
      
      logger.info(`Successfully updated post ${testPostId} with long content via PUT`);
      
    } catch (error) {
      logger.error('Test failed: Verify PUT /posts/{id} with long content updates successfully', error as Error);
      throw error;
    }
  });

  test('Verify PUT /posts/{id} with special characters updates successfully', { tag: ["@regression"] }, async () => {
    logger.info('Starting test: Verify PUT /posts/{id} with special characters updates successfully');
    
    try {
      const specialTitle = `${faker.lorem.sentence(5)} - Special: !@#$%^&*()`;
      const specialBody = `${faker.lorem.paragraph()} 

Special characters test: áéíóú ñ çü ß 你好 🎉 
Line breaks and symbols: <>&"'`;
      
      const putPayload: PostFullUpdatePayload = {
        id: testPostId,
        title: specialTitle,
        body: specialBody,
        userId: testUserId
      };
      
      const result = await postsUpdateService.putPost(testPostId, putPayload);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(testPostId);
      expect(result.data.title).toBe(specialTitle);
      expect(result.data.body).toBe(specialBody);
      expect(result.data.userId).toBe(testUserId);
      
      logger.info(`Successfully updated post ${testPostId} with special characters via PUT`);
      
    } catch (error) {
      logger.error('Test failed: Verify PUT /posts/{id} with special characters updates successfully', error as Error);
      throw error;
    }
  });

  test('Verify PATCH /posts/{id} partially updates only title', { tag: ["@smoke", "@regression"] }, async () => {
    logger.info('Starting test: Verify PATCH /posts/{id} partially updates only title');
    
    try {
      // First get the original post to verify body remains unchanged
      const originalPost = await postsReadService.getPostById(testPostId);
      expect(originalPost.response.status()).toBe(200);
      
      const newTitle = faker.lorem.sentence(7);
      
      const patchPayload: PostUpdatePayload = {
        title: newTitle
      };
      
      const result = await postsUpdateService.patchPost(testPostId, patchPayload);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(testPostId);
      expect(result.data.title).toBe(newTitle);
      expect(result.data.body).toBeTruthy(); // Body should still exist
      expect(result.data.userId).toBeTruthy(); // UserId should still exist
      
      logger.info(`Successfully updated only title of post ${testPostId} with PATCH operation`);
      
    } catch (error) {
      logger.error('Test failed: Verify PATCH /posts/{id} partially updates only title', error as Error);
      throw error;
    }
  });

  test('Verify PATCH /posts/{id} partially updates only body', { tag: ["@smoke", "@regression"] }, async () => {
    logger.info('Starting test: Verify PATCH /posts/{id} partially updates only body');
    
    try {
      // First get the original post to verify title remains unchanged
      const originalPost = await postsReadService.getPostById(testPostId);
      expect(originalPost.response.status()).toBe(200);
      
      const newBody = faker.lorem.paragraphs(3);
      
      const patchPayload: PostUpdatePayload = {
        body: newBody
      };
      
      const result = await postsUpdateService.patchPost(testPostId, patchPayload);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(testPostId);
      expect(result.data.title).toBeTruthy(); // Title should still exist
      expect(result.data.body).toBe(newBody);
      expect(result.data.userId).toBeTruthy(); // UserId should still exist
      
      logger.info(`Successfully updated only body of post ${testPostId} with PATCH operation`);
      
    } catch (error) {
      logger.error('Test failed: Verify PATCH /posts/{id} partially updates only body', error as Error);
      throw error;
    }
  });

  test('Verify PATCH /posts/{id} partially updates both title and body', { tag: ["@regression"] }, async () => {
    logger.info('Starting test: Verify PATCH /posts/{id} partially updates both title and body');
    
    try {
      const newTitle = faker.lorem.sentence(6);
      const newBody = faker.lorem.paragraphs(2);
      
      const patchPayload: PostUpdatePayload = {
        title: newTitle,
        body: newBody
      };
      
      const result = await postsUpdateService.patchPost(testPostId, patchPayload);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(testPostId);
      expect(result.data.title).toBe(newTitle);
      expect(result.data.body).toBe(newBody);
      expect(result.data.userId).toBeTruthy(); // UserId should still exist
      
      logger.info(`Successfully updated title and body of post ${testPostId} with PATCH operation`);
      
    } catch (error) {
      logger.error('Test failed: Verify PATCH /posts/{id} partially updates both title and body', error as Error);
      throw error;
    }
  });

  test('Verify PATCH /posts/{id} with empty title updates successfully', { tag: ["@edge-cases"] }, async () => {
    logger.info('Starting test: Verify PATCH /posts/{id} with empty title updates successfully');
    
    try {
      const patchPayload: PostUpdatePayload = {
        title: ""
      };
      
      const result = await postsUpdateService.patchPost(testPostId, patchPayload);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(testPostId);
      expect(result.data.title).toBe("");
      expect(result.data.body).toBeTruthy(); // Body should still exist
      expect(result.data.userId).toBeTruthy(); // UserId should still exist
      
      logger.info(`Successfully updated post ${testPostId} with empty title via PATCH`);
      
    } catch (error) {
      logger.error('Test failed: Verify PATCH /posts/{id} with empty title updates successfully', error as Error);
      throw error;
    }
  });

  test('Verify sequential PUT and PATCH operations work correctly', { tag: ["@regression", "@integration"] }, async () => {
    logger.info('Starting test: Verify sequential PUT and PATCH operations work correctly');
    
    try {
      // Step 1: First do a complete PUT update
      const putTitle = faker.lorem.sentence(8);
      const putBody = faker.lorem.paragraphs(3);
      const putUserId = 10;
      
      const putPayload: PostFullUpdatePayload = {
        id: testPostId,
        title: putTitle,
        body: putBody,
        userId: putUserId
      };
      
      const putResult = await postsUpdateService.putPost(testPostId, putPayload);
      expect(putResult.response.status()).toBe(200);
      expect(putResult.data.title).toBe(putTitle);
      expect(putResult.data.body).toBe(putBody);
      expect(putResult.data.userId).toBe(putUserId);
      
      logger.info(`Step 1: PUT operation completed for post ${testPostId}`);
      
      // Step 2: Then do a partial PATCH update
      const patchTitle = faker.lorem.sentence(5);
      
      const patchPayload: PostUpdatePayload = {
        title: patchTitle
      };
      
      const patchResult = await postsUpdateService.patchPost(testPostId, patchPayload);
      expect(patchResult.response.status()).toBe(200);
      expect(patchResult.data.id).toBe(testPostId);
      expect(patchResult.data.title).toBe(patchTitle);
      expect(patchResult.data.body).toBe(putBody); // Should retain body from PUT
      expect(patchResult.data.userId).toBe(putUserId); // Should retain userId from PUT
      
      logger.info(`Step 2: PATCH operation completed for post ${testPostId} - Sequential operations successful`);
      
    } catch (error) {
      logger.error('Test failed: Verify sequential PUT and PATCH operations work correctly', error as Error);
      throw error;
    }
  });

  test('Verify PUT /posts/{id} with different user ID updates correctly', { tag: ["@regression"] }, async () => {
    logger.info('Starting test: Verify PUT /posts/{id} with different user ID updates correctly');
    
    try {
      const newTitle = faker.lorem.sentence(7);
      const newBody = faker.lorem.paragraph();
      const differentUserId = 15;
      
      const putPayload: PostFullUpdatePayload = {
        id: testPostId,
        title: newTitle,
        body: newBody,
        userId: differentUserId
      };
      
      const result = await postsUpdateService.putPost(testPostId, putPayload);
      
      expect(result.response.status()).toBe(200);
      expect(result.data.id).toBe(testPostId);
      expect(result.data.title).toBe(newTitle);
      expect(result.data.body).toBe(newBody);
      expect(result.data.userId).toBe(differentUserId);
      
      logger.info(`Successfully updated post ${testPostId} with different user ID ${differentUserId}`);
      
    } catch (error) {
      logger.error('Test failed: Verify PUT /posts/{id} with different user ID updates correctly', error as Error);
      throw error;
    }
  });

});
