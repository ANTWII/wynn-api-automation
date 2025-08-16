export class _PostsReadRequest {

    // 1. GET /posts - Get all posts
    getAllPosts(baseUrl: string) {
        return `${baseUrl}/posts`;
    }

    // 2. GET /posts/{id} - Get post by ID
    getPostById(baseUrl: string, id: string | number) {
        return `${baseUrl}/posts/${id}`;
    }

}

export const postsReadRequest = new _PostsReadRequest();
