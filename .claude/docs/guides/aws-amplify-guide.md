---
title: AWS Amplify Guide
created: 2025-12-02
updated: 2025-12-02
last_checked: 2025-12-02
tags: [guide, aws, amplify, infrastructure, deployment, cognito, dynamodb, appsync]
parent: ./README.md
children: []
related:
  - ../setup/README.md
  - ./setup-guide.md
---

# AWS Amplify Guide

AgentFlow uses AWS Amplify as its primary deployment platform. This guide covers the services, patterns, and workflows for working with Amplify in AgentFlow projects.

## Why AWS Amplify?

AWS Amplify provides an integrated serverless stack optimized for Next.js applications:

| Service | AWS Implementation | Purpose |
|---------|-------------------|---------|
| Hosting | Amplify Hosting | Next.js SSR/SSG deployment |
| Database | DynamoDB | NoSQL data storage |
| API | AppSync | GraphQL API layer |
| Auth | Cognito | User authentication |
| Storage | S3 | File uploads and media |

**Key benefits:**
- Pay-per-use pricing, automatic scaling
- First-class Next.js support including SSR
- Integrated services with consistent SDK
- Git-based deployments with preview environments
- Built-in monitoring via CloudWatch

**Trade-offs:**
- Vendor lock-in to AWS services
- NoSQL-only (no traditional SQL)
- Team needs AWS knowledge
- Can be expensive at scale

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      AWS Amplify Project                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Next.js App (Amplify Hosting)                                │
│   ├── SSR/SSG pages                                            │
│   ├── API routes                                               │
│   └── Static assets                                            │
│                                                                 │
│   ┌───────────────┐   ┌─────────────┐   ┌─────────────────┐   │
│   │    Cognito    │   │  AppSync    │   │       S3        │   │
│   │    (Auth)     │──▶│  (GraphQL)  │──▶│   (Storage)     │   │
│   └───────────────┘   └──────┬──────┘   └─────────────────┘   │
│                              │                                  │
│                       ┌──────▼──────┐                          │
│                       │  DynamoDB   │                          │
│                       │  (Database) │                          │
│                       └─────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

## Getting Started

### Initial Setup

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure AWS credentials
amplify configure

# Initialize Amplify in project
amplify init

# Add services
amplify add api     # GraphQL (AppSync)
amplify add auth    # Cognito
amplify add storage # S3

# Deploy to cloud
amplify push
```

### Project Structure

After `amplify init`, your project will have:

```
project/
├── amplify/
│   ├── backend/
│   │   ├── api/           # GraphQL schema
│   │   ├── auth/          # Cognito config
│   │   └── storage/       # S3 config
│   ├── .config/           # Local config
│   └── team-provider-info.json
├── src/
│   └── graphql/           # Generated types
└── amplify.yml            # Build config
```

## DynamoDB Data Modeling

DynamoDB is a NoSQL database—data modeling differs significantly from SQL.

### Key Concepts

| Concept | Description |
|---------|-------------|
| Partition Key (PK) | Primary identifier, determines data distribution |
| Sort Key (SK) | Optional secondary identifier for sorting/querying |
| GSI | Global Secondary Index for alternate access patterns |
| LSI | Local Secondary Index (same partition, different sort) |

### Single-Table Design

Amplify DataStore encourages single-table design where different entity types share one table:

```graphql
# schema.graphql
type User @model @auth(rules: [{allow: owner}]) {
  id: ID!
  email: String!
  name: String!
  orders: [Order] @hasMany
}

type Order @model @auth(rules: [{allow: owner}]) {
  id: ID!
  userId: ID! @index(name: "byUser")
  items: [OrderItem] @hasMany
  total: Float!
  status: OrderStatus!
  createdAt: AWSDateTime!
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
}
```

### Access Pattern Planning

**Design your data model based on access patterns, not entities!**

| Access Pattern | Key Design |
|----------------|------------|
| Get user by ID | PK = `USER#<userId>` |
| Get user's orders | PK = `USER#<userId>`, SK begins_with `ORDER#` |
| Get orders by date | GSI: PK = status, SK = createdAt |
| Get order items | PK = `ORDER#<orderId>`, SK begins_with `ITEM#` |

### Common Patterns

**Composite Keys:**
```typescript
// Store multiple entity types in same table
const userKey = { pk: `USER#${userId}`, sk: `PROFILE` };
const orderKey = { pk: `USER#${userId}`, sk: `ORDER#${orderId}` };
```

**Denormalization:**
```typescript
// Embed frequently-accessed data
const order = {
  id: orderId,
  userId,
  userName: user.name,  // Denormalized from User
  userEmail: user.email // Denormalized from User
};
```

**Adjacency Lists:**
```typescript
// For hierarchical data
const category = { pk: `CAT#${catId}`, sk: `METADATA` };
const subcategory = { pk: `CAT#${catId}`, sk: `SUBCAT#${subId}` };
```

## GraphQL API (AppSync)

AppSync provides the GraphQL API layer connecting your app to DynamoDB.

### Schema Definition

```graphql
# amplify/backend/api/myapp/schema.graphql

type Query {
  getUser(id: ID!): User
  listUsers(limit: Int, nextToken: String): UserConnection
  ordersByUser(userId: ID!, limit: Int): OrderConnection
}

type Mutation {
  createUser(input: CreateUserInput!): User
  updateUser(input: UpdateUserInput!): User
  deleteUser(id: ID!): User
}

type Subscription {
  onCreateOrder(userId: ID): Order
    @aws_subscribe(mutations: ["createOrder"])
}
```

### Authorization Rules

```graphql
type Todo @model @auth(rules: [
  { allow: owner },                    # Owner can CRUD
  { allow: groups, groups: ["Admin"] }, # Admins can CRUD
  { allow: public, operations: [read] } # Anyone can read
]) {
  id: ID!
  content: String!
  completed: Boolean!
}
```

### Using the API in Code

```typescript
// src/lib/api.ts
import { generateClient } from 'aws-amplify/api';
import { listUsers, getUser, createUser } from '@/graphql/queries';
import { createUserMutation } from '@/graphql/mutations';

const client = generateClient();

// Query
export async function fetchUsers() {
  const response = await client.graphql({
    query: listUsers,
    variables: { limit: 10 }
  });
  return response.data.listUsers.items;
}

// Mutation
export async function addUser(name: string, email: string) {
  const response = await client.graphql({
    query: createUserMutation,
    variables: {
      input: { name, email }
    }
  });
  return response.data.createUser;
}

// Subscription
export function subscribeToOrders(userId: string, callback: (order: Order) => void) {
  const subscription = client.graphql({
    query: onCreateOrder,
    variables: { userId }
  }).subscribe({
    next: ({ data }) => callback(data.onCreateOrder),
    error: (error) => console.error('Subscription error:', error)
  });

  return subscription; // Call .unsubscribe() to cleanup
}
```

## Authentication (Cognito)

### Configuration

```typescript
// amplify/backend/auth/myapp/resource.ts
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: { required: true },
    givenName: { required: true },
  },
  multifactor: {
    mode: 'OPTIONAL',
    sms: true,
  },
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
  },
});
```

### Using Auth in Code

```typescript
// src/lib/auth.ts
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  fetchAuthSession
} from 'aws-amplify/auth';

export async function login(email: string, password: string) {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username: email,
      password
    });

    if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
      // User needs to confirm email
      return { needsConfirmation: true };
    }

    return { isSignedIn };
  } catch (error) {
    if (error.name === 'UserNotConfirmedException') {
      return { needsConfirmation: true };
    }
    throw error;
  }
}

export async function register(email: string, password: string, name: string) {
  const { isSignUpComplete, nextStep } = await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        given_name: name,
      },
    },
  });

  return { isSignUpComplete, nextStep };
}

export async function logout() {
  await signOut();
}

export async function getSession() {
  const session = await fetchAuthSession();
  return session.tokens?.accessToken;
}
```

### Auth UI Component

```tsx
// src/components/AuthenticatedApp.tsx
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export function AuthenticatedApp({ children }) {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <header>
            <p>Welcome, {user.attributes.email}</p>
            <button onClick={signOut}>Sign out</button>
          </header>
          <main>{children}</main>
        </div>
      )}
    </Authenticator>
  );
}
```

## Storage (S3)

### Upload Files

```typescript
// src/lib/storage.ts
import { uploadData, getUrl, remove } from 'aws-amplify/storage';

export async function uploadFile(file: File, path: string) {
  const result = await uploadData({
    key: path,
    data: file,
    options: {
      contentType: file.type,
      onProgress: ({ transferredBytes, totalBytes }) => {
        console.log(`${transferredBytes}/${totalBytes} bytes transferred`);
      },
    },
  }).result;

  return result.key;
}

export async function getFileUrl(key: string) {
  const { url } = await getUrl({ key });
  return url.toString();
}

export async function deleteFile(key: string) {
  await remove({ key });
}
```

### Access Levels

```typescript
// Public - anyone can access
uploadData({ key: `public/${filename}`, data: file });

// Protected - authenticated users can read, owner can write
uploadData({
  key: `protected/${filename}`,
  data: file,
  options: { accessLevel: 'protected' }
});

// Private - only owner can access
uploadData({
  key: `private/${filename}`,
  data: file,
  options: { accessLevel: 'private' }
});
```

## Environment Management

### Multiple Environments

```bash
# Create environments
amplify env add dev
amplify env add staging
amplify env add prod

# Switch environments
amplify env checkout dev

# List environments
amplify env list

# Pull specific environment
amplify env pull --envName prod
```

### Environment Variables

```typescript
// src/lib/config.ts
export const config = {
  apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT,
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
  userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
};
```

### Branch-Based Deployments

```yaml
# amplify.yml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
    appRoot: ./
```

Configure in Amplify Console:
- `main` branch → production
- `develop` branch → staging
- Feature branches → preview environments

## Monitoring and Debugging

### CloudWatch Logs

```bash
# View logs for AppSync
aws logs tail /aws/appsync/apis/<api-id>/loggroup --follow

# View logs for Lambda (if using)
aws logs tail /aws/lambda/<function-name> --follow
```

### Local Development

```bash
# Mock API locally
amplify mock api

# Mock functions locally
amplify mock function

# Run with local mocking
npm run dev
```

### Debugging GraphQL

Enable detailed logging in `amplify/backend/api/myapp/parameters.json`:

```json
{
  "AppSyncAPIName": "myapp",
  "DynamoDBBillingMode": "PAY_PER_REQUEST",
  "DynamoDBEnableServerSideEncryption": true,
  "cloudWatchLogsRoleArn": "arn:aws:iam::<account>:role/...",
  "fieldLogLevel": "ALL"
}
```

### X-Ray Tracing

```typescript
// Enable X-Ray for performance tracing
import { AWSXRay } from 'aws-xray-sdk';

AWSXRay.setLogger(console);
```

## Common Patterns

### Optimistic Updates

```typescript
// Update UI immediately, sync in background
export async function updateTodo(id: string, completed: boolean) {
  // Optimistic update
  setTodos(prev => prev.map(t =>
    t.id === id ? { ...t, completed } : t
  ));

  try {
    await client.graphql({
      query: updateTodoMutation,
      variables: { input: { id, completed } }
    });
  } catch (error) {
    // Rollback on failure
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !completed } : t
    ));
    throw error;
  }
}
```

### Pagination

```typescript
export async function fetchAllOrders(userId: string) {
  const orders = [];
  let nextToken = null;

  do {
    const response = await client.graphql({
      query: ordersByUser,
      variables: { userId, limit: 100, nextToken }
    });

    orders.push(...response.data.ordersByUser.items);
    nextToken = response.data.ordersByUser.nextToken;
  } while (nextToken);

  return orders;
}
```

### Offline Support

```typescript
// DataStore handles offline automatically
import { DataStore } from 'aws-amplify/datastore';
import { Todo } from './models';

// Create (works offline)
await DataStore.save(new Todo({ content: 'New task', completed: false }));

// Query (from local cache)
const todos = await DataStore.query(Todo);

// Sync when online (automatic)
DataStore.start();
```

## Common Pitfalls

### 1. Schema Changes

**Problem:** Changing GraphQL schema can break existing data.

**Solution:** Use schema migrations carefully:
```bash
# Create backup first
amplify env pull

# Make schema changes incrementally
# Test with mock first
amplify mock api

# Then push
amplify push
```

### 2. Hot Partitions

**Problem:** Single partition key getting too much traffic.

**Solution:** Use composite keys or write sharding:
```typescript
// Bad: All writes to same partition
{ pk: 'ORDERS', sk: orderId }

// Good: Distribute across partitions
{ pk: `ORDER#${userId}`, sk: orderId }
```

### 3. Query vs Scan

**Problem:** Using Scan instead of Query (expensive, slow).

**Solution:** Design indexes for your access patterns:
```graphql
type Order @model
  @key(name: "byStatus", fields: ["status", "createdAt"]) {
  status: OrderStatus! @index(name: "byStatus")
  createdAt: AWSDateTime!
}
```

### 4. Missing Error Handling

**Problem:** GraphQL errors not properly handled.

**Solution:** Always check for errors:
```typescript
const response = await client.graphql({ query, variables });

if ('errors' in response && response.errors) {
  console.error('GraphQL errors:', response.errors);
  throw new Error(response.errors[0].message);
}

return response.data;
```

### 5. Auth Token Expiry

**Problem:** Tokens expire, API calls fail silently.

**Solution:** Implement token refresh:
```typescript
import { fetchAuthSession } from 'aws-amplify/auth';

// Amplify v6 handles refresh automatically
// Just ensure you're calling API through Amplify client
```

## Deployment Workflow

### Development

```bash
# Push changes to dev environment
amplify push

# Test locally
npm run dev
```

### Staging

```bash
# Switch to staging
amplify env checkout staging

# Push to staging
amplify push

# Deploy frontend
git push origin develop
```

### Production

```bash
# Switch to production
amplify env checkout prod

# Review changes
amplify status

# Push (be careful!)
amplify push

# Deploy via Git
git push origin main
```

## Cost Optimization

### DynamoDB

- Use `PAY_PER_REQUEST` for unpredictable workloads
- Use provisioned capacity for steady workloads
- Enable TTL for temporary data
- Use sparse indexes

### AppSync

- Batch requests when possible
- Use caching for frequently accessed data
- Limit subscription connections

### S3

- Set lifecycle policies for old files
- Use appropriate storage classes
- Enable transfer acceleration only when needed

## References

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Next.js on Amplify](https://docs.amplify.aws/nextjs/)
- [Amplify DataStore](https://docs.amplify.aws/lib/datastore/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [AppSync Developer Guide](https://docs.aws.amazon.com/appsync/)
- [Cognito Developer Guide](https://docs.aws.amazon.com/cognito/)
