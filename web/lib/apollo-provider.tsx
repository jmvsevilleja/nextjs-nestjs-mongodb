"use client";

import { ApolloClient, InMemoryCache, ApolloProvider as Provider, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useSession } from "next-auth/react";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql",
});

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  
  const authLink = setContext((_, { headers }) => {
    // Get the authentication token from NextAuth session
    const token = session?.accessToken;
    
    // Return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });
  
  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
  
  return <Provider client={client}>{children}</Provider>;
}