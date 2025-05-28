import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                mutation Login($input: LoginInput!) {
                  login(input: $input) {
                    accessToken
                    user {
                      id
                      name
                      email
                      profilePicture
                    }
                  }
                }
              `,
              variables: {
                input: {
                  email: credentials.email,
                  password: credentials.password,
                },
              },
            }),
          });

          const data = await response.json();

          if (data.errors) {
            throw new Error(data.errors[0].message);
          }

          const { accessToken, user } = data.data.login;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.profilePicture,
            accessToken,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in with Google
      if (account?.provider === "google" && user) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                mutation GoogleLogin($idToken: String!) {
                  googleLogin(idToken: $idToken) {
                    accessToken
                    user {
                      id
                      name
                      email
                      profilePicture
                    }
                  }
                }
              `,
              variables: {
                idToken: account.id_token,
              },
            }),
          });

          const data = await response.json();

          if (data.errors) {
            throw new Error(data.errors[0].message);
          }

          const { accessToken, user: googleUser } = data.data.googleLogin;

          token.accessToken = accessToken;
          token.id = googleUser.id;
        } catch (error) {
          console.error("Google login error:", error);
        }
      }

      // Initial sign in with credentials
      if (user && "accessToken" in user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
        if (token.id) {
          session.user.id = token.id as string;
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
