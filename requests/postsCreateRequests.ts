export interface PostCreatePayload {
    title: string;
    body: string;
    userId: number;
}

export class _PostsCreateRequest {

    // 3. POST /posts - Create a new post
    createPost(baseUrl: string) {
        return `${baseUrl}/posts`;
    }

}

export const postsCreateRequest = new _PostsCreateRequest();
