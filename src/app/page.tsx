'use client';

import { ApolloProvider } from '@apollo/client/react';
import { createApolloClient } from '../lib/apollo-client';
import App from '../components/App';

const client = createApolloClient();

export default function HomePage() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}