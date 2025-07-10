import NextAuth from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  secret: process.env.NEXT_PUBLIC_SECRET,
  
  providers: [
    Auth0Provider({
      clientId: process.env.NEXT_AUTH_CLIENT_ID,
      clientSecret: process.env.NEXT_AUTH_CLIENT_SECRET,
      issuer: process.env.NEXT_AUTH_ISSUER_BASE_URL,
    }),
  ],
});
