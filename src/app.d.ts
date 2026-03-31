/// <reference types="@cloudflare/workers-types" />
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

declare global {
  namespace App {
    interface Locals {
      session: {
        user: {
          id: string;
          email: string;
          role: string;
          nom: string;
          prenom: string;
        };
      } | null;
    }
    interface Platform {
      env: {
        DB: D1Database;
        R2: R2Bucket;
        RESEND_API_KEY: string;
        RESEND_FROM: string;
        APP_URL: string;
      };
    }
  }
}

export {};