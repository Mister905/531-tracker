import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

const httpLink = createHttpLink({
  uri: '/api/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`);
      
      // If authentication error, clear token (let App component handle state)
      if (message.includes('Not authenticated') || message.includes('Unauthorized')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Don't reload - let the App component handle the state change
        }
      }
    });
  }

  if (networkError) {
    console.log(`Network error: ${networkError}`);
  }
});

// Retry link for failed requests
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => !!error && !error.message.includes('Not authenticated')
  }
});

export const createApolloClient = () => {
  return new ApolloClient({
    link: from([errorLink, retryLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
    },
  });
};

export const client = createApolloClient();
