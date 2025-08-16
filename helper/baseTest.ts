import { test as baseTest } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';
import { _common } from '../utils/common';
import { _scheme } from './scheme';




const test = baseTest.extend<{
    common: _common;
    scheme: _scheme;


}>
    ({
        common: async ({ }, use) => {
            await use(new _common());
        },

        scheme: async ({ }, use) => {
            await use(new _scheme());
        },

       

    });

export default test;