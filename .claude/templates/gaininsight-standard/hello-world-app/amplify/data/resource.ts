import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * GraphQL schema for the Hello World application.
 * Uses auto-generated queries with API key auth for simplicity.
 */
const schema = a.schema({
  // HelloWorld model - Amplify auto-generates CRUD operations
  HelloWorld: a
    .model({
      message: a.string().required(),
      timestamp: a.string().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
