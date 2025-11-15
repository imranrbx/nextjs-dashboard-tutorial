// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {

    interface Session {
        user: {
            id: string | unknows;
            role: string | undefined; // Declare your custom field here
        } & DefaultSession["user"];
    }
    interface User {
        id: string | unknown;
        role: string | undefined;
    }
}