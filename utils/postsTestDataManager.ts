import { logger } from './logger';
import { apiDataExtractor, ExtractedPostData } from './apiDataExtractor';
import { postsCreateService } from '../services/postsCreateService';
import { postsDeleteService } from '../services/postsDeleteService';
import { PostCreatePayload } from '../requests/postsCreateRequests';

export interface ManagedPost {
  id: number;
  title: string;
  body: string;
  userId: number;
  isCreatedByFramework: boolean; // Track if we created this or it's from API
}

export class PostsTestDataManager {
  private static instance: PostsTestDataManager;
  private managedPosts: Map<string, ManagedPost> = new Map();
  private isApiDataLoaded: boolean = false;

  private constructor() {}

  public static getInstance(): PostsTestDataManager {
    if (!PostsTestDataManager.instance) {
      PostsTestDataManager.instance = new PostsTestDataManager();
    }
    return PostsTestDataManager.instance;
  }

  /**
   * Initialize the manager by loading real API data
   */
  public async initialize(): Promise<void> {
    if (this.isApiDataLoaded) {
      logger.info('API data already loaded, skipping initialization');
      return;
    }

    logger.info('Initializing PostsTestDataManager with real API data...');
    
    try {
      await apiDataExtractor.extractPostsData();
      this.isApiDataLoaded = true;
      logger.info('PostsTestDataManager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize PostsTestDataManager', error as Error);
      throw error;
    }
  }

  /**
   * Get a real post from API data (not created by framework)
   */
  public getRealApiPost(): ManagedPost {
    if (!this.isApiDataLoaded) {
      throw new Error('PostsTestDataManager not initialized. Call initialize() first.');
    }

    const realPost = apiDataExtractor.getRandomPostData();
    const managedPost: ManagedPost = {
      id: realPost.postId,
      title: realPost.title,
      body: realPost.body,
      userId: realPost.userId,
      isCreatedByFramework: false
    };

    // Store it for reference but don't track for cleanup since we didn't create it
    const key = `real_${realPost.postId}`;
    this.managedPosts.set(key, managedPost);
    
    logger.info(`Retrieved real API post: ID=${managedPost.id}, UserID=${managedPost.userId}`);
    return managedPost;
  }

  /**
   * Get a specific real post by ID
   */
  public getRealApiPostById(postId: number): ManagedPost | null {
    if (!this.isApiDataLoaded) {
      throw new Error('PostsTestDataManager not initialized. Call initialize() first.');
    }

    const realPost = apiDataExtractor.getPostById(postId);
    if (!realPost) {
      return null;
    }

    const managedPost: ManagedPost = {
      id: realPost.postId,
      title: realPost.title,
      body: realPost.body,
      userId: realPost.userId,
      isCreatedByFramework: false
    };

    const key = `real_${realPost.postId}`;
    this.managedPosts.set(key, managedPost);
    
    return managedPost;
  }

  /**
   * Create a new post using real user ID from API data
   */
  public async createManagedPostWithRealUserId(title?: string, body?: string): Promise<ManagedPost> {
    if (!this.isApiDataLoaded) {
      throw new Error('PostsTestDataManager not initialized. Call initialize() first.');
    }

    const realUserId = apiDataExtractor.getRandomUserId();
    const testKey = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`Creating managed post with real user ID: ${realUserId} (key: ${testKey})`);
    
    try {
      const payload: PostCreatePayload = {
        title: title || `Framework Test Post - ${testKey}`,
        body: body || `Test post created by framework at ${new Date().toISOString()}`,
        userId: realUserId
      };
      
      const result = await postsCreateService.createPost(payload);
      
      if (result.response.status() !== 201) {
        throw new Error(`Failed to create post. Status: ${result.response.status()}`);
      }
      
      const managedPost: ManagedPost = {
        id: result.data.id,
        title: result.data.title,
        body: result.data.body,
        userId: result.data.userId,
        isCreatedByFramework: true
      };
      
      this.managedPosts.set(testKey, managedPost);
      
      logger.info(`Successfully created managed post: ID=${managedPost.id}, UserID=${managedPost.userId}, Key=${testKey}`);
      return managedPost;
      
    } catch (error) {
      logger.error(`Failed to create managed post with key ${testKey}`, error as Error);
      throw error;
    }
  }

  /**
   * Retrieve a managed post by its test key
   */
  public getManagedPost(testKey: string): ManagedPost | null {
    const post = this.managedPosts.get(testKey);
    if (post) {
      logger.info(`Retrieved managed post with key ${testKey}: ID=${post.id}`);
    } else {
      logger.warn(`No managed post found with key: ${testKey}`);
    }
    return post || null;
  }

  /**
   * Find a managed post by its ID
   */
  public findManagedPostById(id: number): ManagedPost | null {
    for (const [key, post] of this.managedPosts) {
      if (post.id === id) {
        logger.info(`Found managed post with ID ${id} (key: ${key})`);
        return post;
      }
    }
    
    logger.warn(`No managed post found with ID: ${id}`);
    return null;
  }

  /**
   * Get all managed posts as an array
   */
  public getAllManagedPosts(): ManagedPost[] {
    const posts = Array.from(this.managedPosts.values());
    logger.info(`Retrieved ${posts.length} managed posts`);
    return posts;
  }

  /**
   * Get only posts created by the framework (excludes real API posts)
   */
  public getFrameworkCreatedPosts(): ManagedPost[] {
    const createdPosts = Array.from(this.managedPosts.values())
      .filter(post => post.isCreatedByFramework);
    
    logger.info(`Retrieved ${createdPosts.length} framework-created posts`);
    return createdPosts;
  }

  /**
   * Remove a managed post from tracking (does not delete from API)
   */
  public removeManagedPost(testKey: string): boolean {
    const post = this.managedPosts.get(testKey);
    if (post) {
      this.managedPosts.delete(testKey);
      logger.info(`Removed managed post from tracking: Key=${testKey}, ID=${post.id}`);
      return true;
    } else {
      logger.warn(`No managed post found to remove with key: ${testKey}`);
      return false;
    }
  }

  /**
   * Clean up all framework-created posts (delete from API and remove from tracking)
   */
  public async cleanupAllManagedPosts(): Promise<{ success: number; failed: number }> {
    const createdPosts = this.getFrameworkCreatedPosts();
    
    if (createdPosts.length === 0) {
      logger.info('No framework-created posts to cleanup');
      return { success: 0, failed: 0 };
    }
    
    logger.info(`Starting cleanup of ${createdPosts.length} framework-created posts`);
    
    let successCount = 0;
    let failedCount = 0;
    
    // Find keys for created posts and delete them
    const keysToRemove: string[] = [];
    
    for (const [key, post] of this.managedPosts) {
      if (post.isCreatedByFramework) {
        try {
          await postsDeleteService.deletePost(post.id);
          keysToRemove.push(key);
          successCount++;
          logger.info(`Successfully cleaned up post: ID=${post.id}, Key=${key}`);
        } catch (error) {
          failedCount++;
          logger.error(`Failed to cleanup post with ID ${post.id}`, error as Error);
        }
      }
    }
    
    // Remove successfully deleted posts from tracking
    keysToRemove.forEach(key => this.managedPosts.delete(key));
    
    logger.info(`Cleanup completed: ${successCount} successful, ${failedCount} failed`);
    return { success: successCount, failed: failedCount };
  }

  /**
   * Get count of managed posts
   */
  public getManagedPostsCount(): number {
    return this.managedPosts.size;
  }

  /**
   * Clear all managed posts from tracking (does not delete from API)
   */
  public clearAllManagedPosts(): void {
    this.managedPosts.clear();
    logger.info('Cleared all managed posts from tracking');
  }

  /**
   * Get summary of managed posts
   */
  public getSummary(): { total: number; created: number; real: number } {
    const total = this.managedPosts.size;
    const created = Array.from(this.managedPosts.values()).filter(p => p.isCreatedByFramework).length;
    const real = total - created;
    
    return { total, created, real };
  }
}

// Export singleton instance
export const postsTestDataManager = PostsTestDataManager.getInstance();
