# grocery_store
Grocery (Node.js + TypeScript + MongoDB)
# Grocery ACL (Node.js + TypeScript + MongoDB)

## Tech
- Node.js, Express, TypeScript
- MongoDB, Mongoose (materialized path: `ancestors`)
- JWT auth (bcrypt), RBAC, ACL po hijerarhiji čvorova
- Jest + mongodb-memory-server (unit/integration)

## Run (Option A – Docker, recommended)
1) `docker compose up --build`
2) API: http://localhost:3000
3) Health: GET /health
4) Seeding is triggered automatically; default users:
   - manager.nb@company.rs / Test1234!
   - emp.r6@company.rs   / Test1234!

## Run (Option B – local + Atlas)
1) Create new `.env` from `.env.example`
   - `MONGO_URI=<atlas-connection-string>`
   - `JWT_SECRET=<your-secret>`
2) `npm ci`
3) `npm run seed`
4) `npm run dev`
5) API: http://localhost:3000

## Endpoints (primeri)


**POST** `/auth/login`

**Body:**
```json
{ "email": "user@example.com", "password": "••••••••" }
```
**Response:**
```json
{
  "message": "Logged in",
  "jwtToken": "<JWT>",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "userName": "John Doe",
    "role": "EMPLOYEE|MANAGER",
    "nodeId": "..."
  }
}

```
**Employees (Read-only)**

**GET /employees**

> - Query Parameters:
  > - nodeId (optional) – defaults to req.user.nodeId if not provided
  > - withDesc (optional, "true"|"false") – whether to include descendants (default: false)

 
- GET /employees
- GET /employees?nodeId=6711f...&withDesc=true

  **Response**
```json
{
  "users": [
    { "_id": "...", "name": "...", "email": "...", "role": "EMPLOYEE", "nodeId": "..." }
  ]
}

```

***Managers***

**List Managers**

**GET /managers (Requires MANAGER role)**

- Query params are the same as /employees (nodeId, withDesc).

***POST /managers (Requires MANAGER role)***

- Create User (Manager or Employee)

**Body**

```json
{
  "name": "New Manager",
  "email": "manager@company.rs",
  "role": "MANAGER",
  "nodeName": "Novi Beograd",
  "password": "Test1234!"
}

```

**Response**
```json
{
  "user": {
    "_id": "...",
    "name": "New Manager",
    "email": "manager@company.rs",
    "role": "MANAGER",
    "nodeId": "..."
  }
}

```
**PUT /managers/:id (Requires MANAGER role)**

- Update User

  **Body (all fields optional)**

   ```json
  {
    "name": "Updated Name",
    "email": "new@mail.rs",
    "role": "EMPLOYEE|MANAGER",
    "nodeName": "Bežanija"
  }

   ```
   **Response**
  
  ```json
  {
    "user": {
      "_id": "...",
      "name": "Updated Name",
      "email": "new@mail.rs",
      "role": "EMPLOYEE",
      "nodeId": "..."
    }
  }

  ```

***DELETE /managers/:id (Requires MANAGER role)***

- Delete User

  **Response**

  ```json
  { "message": "User deleted successfully" }

  ```


> Access Rules:
> - MANAGER: can view and modify users in their own node and all descendant nodes.
> - EMPLOYEE: can only view EMPLOYEE users within their own node (and descendants).
> - Access to endpoints is automatically restricted through req.accessNodeIds.

## Validation & Errors

- Validators: `loginValidators`, `listUsersQueryValidators`,
`createUserValidators`, `updateUserValidators`,
`deleteUserParamValidators`, and `validate middleware`.

- Standardized error handling via `AppError`, exapmles: `USER_NOT_FOUND`, `INVALID_CREDENTIALS`,
`FORBIDDEN`, `NODE_NOT_FOUND`, `EMAIL_EXISTS`

## Tests
`npm test` (Jest + in-memory Mongo)
 
