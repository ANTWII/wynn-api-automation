export interface PostUpdatePayload {
    id?: number;
    title?: string;
    body?: string;
    userId?: number;
}

export interface PostFullUpdatePayload {
    id: number;
    title: string;
    body: string;
    userId: number;
}

export class _PostsUpdateRequest {

    // 4. PUT /posts/{id} - Full update (replaces entire resource)
    putPost(baseUrl: string, id: string | number) {
        return `${baseUrl}/posts/${id}`;
    }

    // 4. PATCH /posts/{id} - Partial update (updates only specified fields)
    patchPost(baseUrl: string, id: string | number) {
        return `${baseUrl}/posts/${id}`;
    }

}

export const postsUpdateRequest = new _PostsUpdateRequest();
