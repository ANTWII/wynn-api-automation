import { logger } from './logger';
import { postsReadService } from '../services/postsReadService';

export interface ExtractedPostData {
  postId: number;
  userId: number;
  title: string;
  body: string;
}

export class ApiDataExtractor {
  private static instance: ApiDataExtractor;
  private cachedPosts: ExtractedPostData[] = [];

  private constructor() {}

  public static getInstance(): ApiDataExtractor {
    if (!ApiDataExtractor.instance) {
      ApiDataExtractor.instance = new ApiDataExtractor();
    }
    return ApiDataExtractor.instance;
  }

  /**
   * Fetches all posts from JSONPlaceholder API and extracts useful data
   */
  public async extractPostsData(): Promise<ExtractedPostData[]> {
    logger.info('Extracting posts data from JSONPlaceholder API...');
    
    try {
      const result = await postsReadService.getAllPosts();
      
      if (result.response.status() !== 200) {
        throw new Error(`Failed to fetch posts. Status: ${result.response.status()}`);
      }

      // Extract relevant data from the response
      this.cachedPosts = result.data.map((post: any) => ({
        postId: post.id,
        userId: post.userId,
        title: post.title,
        body: post.body
      }));

      logger.info(`Successfully extracted ${this.cachedPosts.length} posts data`);
      return this.cachedPosts;
      
    } catch (error) {
      logger.error('Failed to extract posts data from API', error as Error);
      throw error;
    }
  }

  /**
   * Get a random post data for testing
   */
  public getRandomPostData(): ExtractedPostData {
    if (this.cachedPosts.length === 0) {
      throw new Error('No cached posts available. Call extractPostsData() first.');
    }
    
    const randomIndex = Math.floor(Math.random() * this.cachedPosts.length);
    const randomPost = this.cachedPosts[randomIndex];
    
    logger.info(`Selected random post: ID=${randomPost.postId}, UserID=${randomPost.userId}`);
    return randomPost;
  }

  /**
   * Get a specific post by ID from cached data
   */
  public getPostById(postId: number): ExtractedPostData | null {
    const post = this.cachedPosts.find(p => p.postId === postId);
    
    if (post) {
      logger.info(`Found cached post: ID=${post.postId}, UserID=${post.userId}`);
    } else {
      logger.warn(`Post with ID=${postId} not found in cached data`);
    }
    
    return post || null;
  }

  /**
   * Get all unique user IDs from cached posts
   */
  public getUniqueUserIds(): number[] {
    const userIdSet = new Set<number>();
    this.cachedPosts.forEach(post => userIdSet.add(post.userId));
    const uniqueUserIds = Array.from(userIdSet);
    
    logger.info(`Found ${uniqueUserIds.length} unique user IDs: ${uniqueUserIds.slice(0, 5).join(', ')}${uniqueUserIds.length > 5 ? '...' : ''}`);
    return uniqueUserIds;
  }

  /**
   * Get posts by specific user ID
   */
  public getPostsByUserId(userId: number): ExtractedPostData[] {
    const userPosts = this.cachedPosts.filter(post => post.userId === userId);
    logger.info(`Found ${userPosts.length} posts for user ID ${userId}`);
    return userPosts;
  }

  /**
   * Get a random user ID from the extracted data
   */
  public getRandomUserId(): number {
    const uniqueUserIds = this.getUniqueUserIds();
    const randomUserId = uniqueUserIds[Math.floor(Math.random() * uniqueUserIds.length)];
    logger.info(`Selected random user ID: ${randomUserId}`);
    return randomUserId;
  }

  /**
   * Clear cached data
   */
  public clearCache(): void {
    this.cachedPosts = [];
    logger.info('Cleared cached posts data');
  }

  /**
   * Get total count of cached posts
   */
  public getCachedPostsCount(): number {
    return this.cachedPosts.length;
  }
}

// Export singleton instance
export const apiDataExtractor = ApiDataExtractor.getInstance();
