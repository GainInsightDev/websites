'use client';

import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import outputs from '../../amplify_outputs.json';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Configure Amplify with the outputs from the backend
Amplify.configure(outputs);

// Create a typed client for GraphQL operations
const client = generateClient<Schema>();

interface HelloWorldData {
  message: string;
  timestamp: string;
}

export default function Home() {
  const [data, setData] = useState<HelloWorldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrCreateHelloWorld() {
    try {
      setLoading(true);
      setError(null);

      // Try to get existing HelloWorld entries
      const listResponse = await client.models.HelloWorld.list();

      if (listResponse.errors) {
        throw new Error(listResponse.errors[0].message);
      }

      if (listResponse.data && listResponse.data.length > 0) {
        // Use existing entry
        const item = listResponse.data[0];
        setData({
          message: item.message,
          timestamp: item.timestamp,
        });
      } else {
        // Create a new HelloWorld entry
        const createResponse = await client.models.HelloWorld.create({
          message: 'Hello World from Amplify Gen 2!',
          timestamp: new Date().toISOString(),
        });

        if (createResponse.errors) {
          throw new Error(createResponse.errors[0].message);
        }

        if (createResponse.data) {
          setData({
            message: createResponse.data.message,
            timestamp: createResponse.data.timestamp,
          });
        }
      }
    } catch (err) {
      console.error('Error with HelloWorld:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrCreateHelloWorld();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-muted">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl">Hello World</CardTitle>
          <CardDescription>AWS Amplify Gen 2 + Next.js + shadcn/ui</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Loading...</span>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {data && !loading && !error && (
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-lg text-primary font-medium">{data.message}</p>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Created:{' '}
                <span className="font-mono">
                  {new Date(data.timestamp).toLocaleString()}
                </span>
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button onClick={() => fetchOrCreateHelloWorld()} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
