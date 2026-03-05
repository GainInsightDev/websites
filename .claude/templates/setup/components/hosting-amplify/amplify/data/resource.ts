import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

/**
 * GraphQL Schema Definition
 *
 * Define your data models here. Each model becomes:
 * - A DynamoDB table
 * - GraphQL queries/mutations/subscriptions
 * - TypeScript types for the client
 *
 * See: https://docs.amplify.aws/gen2/build-a-backend/data/
 */
const schema = a.schema({
  // Example model - replace with your own
  HelloWorld: a.model({
    message: a.string().required(),
    timestamp: a.string().required(),
  }).authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ schema });
