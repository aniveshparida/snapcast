import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {db} from "@/drizzle/db";
import {schema} from '@/drizzle/schema';
import {nextCookies} from "better-auth/next-js";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema,
    }),
    socialProviders:{
        google:{
            clientId:process.env.GOOGLE_CLIENT_ID!,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET!,
            redirectUri: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
        }
    },
    plugins: [nextCookies()],
    baseURL: process.env.BETTER_AUTH_URL!
})