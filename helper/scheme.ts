import { expect } from "@playwright/test";

export class _scheme {

    async validateSchema(schema: any, responseBody: any) {
        const result = schema.safeParse(responseBody);
        expect(result.success, `Schema validation failed:\n${JSON.stringify(result.error?.format(), null, 2)}`).toBe(true);
    }
    
}