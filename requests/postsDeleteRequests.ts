export class _PostsDeleteRequest {

    // 5. DELETE /posts/{id} - Delete post by ID
    deletePost(baseUrl: string, id: string | number) {
        return `${baseUrl}/posts/${id}`;
    }

}

export const postsDeleteRequest = new _PostsDeleteRequest();
