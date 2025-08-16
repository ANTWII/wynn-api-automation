import { request } from "@playwright/test";

export class _common {

    async getResponse(url: string, body?: JSON, headers?: { [key: string]: string }) {
        const newRequest = await request.newContext();
        return await newRequest.get(url, {
            ...(body && { data: body }),
            ...(headers && { headers }),
        });
    }

    async postResponse(url: string, body?: JSON, headers?: { [key: string]: string }) {
        const newRequest = await request.newContext();
        return await newRequest.post(url, {
            ...(body && { data: body }),
            ...(headers && { headers }),
        });
    }

    async putResponse(url: string, body?: JSON, headers?: { [key: string]: string }) {
        const newRequest = await request.newContext();
        return await newRequest.put(url, {
            ...(body && { data: body }),
            ...(headers && { headers }),
        });
    }

    async patchResponse(url: string, body?: JSON, headers?: { [key: string]: string }) {
        const newRequest = await request.newContext();
        return await newRequest.patch(url, {
            ...(body && { data: body }),
            ...(headers && { headers }),
        });
    }

    async deleteResponse(url: string, body?: JSON, headers?: { [key: string]: string }) {
        const newRequest = await request.newContext();
        return await newRequest.delete(url, {
            ...(body && { data: body }),
            ...(headers && { headers }),
        });
    }
}
export const common = new _common();