import NextAuth from 'next-auth';

export default NextAuth({
  //   session: {
  //     jwt: true,
  //     maxAge: 0.5 * 24 * 60 * 60,
  //   },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      if (profile?.sub) {
        token.sub = profile.sub;
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      if (typeof user !== typeof undefined) {
        token.user = user;
      }
      return token;
    },
    session: async function session({ session, token }) {
      session.accessToken = token.accessToken;
      session.id = token.id;
      session.sub = token.sub;
      session.user = token.user;
      return session;
    },
  },
  providers: [
    {
      id: "zitadel",
      name: "zitadel",
      type: "oauth",
      version: "2",
      wellKnown: process.env.ZITADEL_ISSUER,
      authorization: {
        params: {
          scope:
            "openid email profile urn:zitadel:iam:org:project:id:163706957566443777:aud",
        },
      },
      idToken: true,
      checks: ["pkce", "state"],
      client: {
        token_endpoint_auth_method: "none",
      },
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          firstName: profile.given_name,
          lastName: profile.family_name,
          email: profile.email,
          loginName: profile.preferred_username,
          image: profile.picture,
          roles: profile["urn:zitadel:iam:org:project:roles"],
        };
      },
      clientId: process.env.ZITADEL_CLIENT_ID,
    },
  ],
});
