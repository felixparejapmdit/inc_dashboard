# Directus Setup For File Organizer

This folder adds the Directus side needed by the existing File Organizer pages.

## Collections Created

- `Shelves`: top-level shelves, like cabinets or major areas.
- `Containers`: boxes or sections inside one shelf.
- `Folders`: folders inside one container.
- `Documents`: files inside a folder, container, or shelf.

The names use uppercase because the current React services call `/items/Shelves`, `/items/Containers`, `/items/Folders`, and `/items/Documents`.

## Run Locally

1. Add these values to the root `.env` when you want local Directus:

```env
DIRECTUS_KEY=replace-with-a-long-random-key
DIRECTUS_SECRET=replace-with-a-long-random-secret
DIRECTUS_ADMIN_EMAIL=admin@example.com
DIRECTUS_ADMIN_PASSWORD=change-this-password
DIRECTUS_PUBLIC_URL=http://localhost:8055
DIRECTUS_INTERNAL_URL=http://localhost:8055
REACT_APP_DIRECTUS_URL=/api/directus
REACT_APP_DIRECTUS_TOKEN=
```

2. Create the File Organizer tables and Directus metadata:

```powershell
npm run directus:apply-file-organizer-schema
```

3. Start Directus in detached mode:

```powershell
npm run directus:up
```

4. Open Directus:

```text
http://localhost:8055
```

5. In Directus, create a safe app role or token for the React app.

Give it read/create/update/delete access to:

- `Shelves`
- `Containers`
- `Folders`
- `Documents`

Then put that token in the root `.env` as `REACT_APP_DIRECTUS_TOKEN`.

## Where To Get `REACT_APP_DIRECTUS_TOKEN`

The token is a static Directus user token.

In the Directus UI:

1. Open `http://localhost:8055`.
2. Go to `Settings`.
3. Open `User Directory`.
4. Select the API user, for example `file.organizer@app.local`.
5. Find the `Token` field.
6. Copy that value into the root `.env` as `REACT_APP_DIRECTUS_TOKEN`.

For this local setup, a restricted File Organizer API user has already been created and the token was added to the root `.env`.

After changing any `REACT_APP_*` value, restart the React dev server. Create React App only reads these values when it starts.

## File Uploads

The current File Organizer document form uploads files through the existing backend endpoint:

```text
POST /api/upload-local
```

Directus stores the organizer record and the `file_url`. This keeps the current upload flow working while still giving Directus clean collections for shelves, folders, search, QR codes, and movement.
