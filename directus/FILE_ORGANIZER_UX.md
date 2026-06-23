# File Organizer UX Plan

This is the simple mental model for the File Organizer. It should feel like a small records room: shelves hold boxes, boxes hold folders, and folders hold documents.

## Simple Words

- A `Shelf` is the big place where related things live.
- A `Container` is a box or section inside one shelf.
- A `Folder` is the smaller group inside one container.
- A `Document` is the actual uploaded file.

## How This Enhances The Experience

- Shelves make the first page feel like a real library or records room.
- Containers help divide a shelf into smaller, easier sections.
- Folders keep related documents together.
- Documents keep file details, QR code values, tags, and upload links in one record.
- Breadcrumbs show the path, for example: Shelf > Container > Folder > Document.
- Global search can look across all shelves, containers, folders, and documents.
- QR codes can identify and move a shelf, container, folder, or document quickly.

## Page Design

### Shelves Page

- Show shelves as large cards.
- Each card should show the shelf name, short description, color, QR action, and container count.
- Empty state: `No shelves yet. Create your first shelf to start organizing files.`
- Primary action: `New shelf`.

### Containers Page

- Show containers like boxes sitting on a shelf.
- Each container should show the name, description, folder count, QR action, and quick actions.
- Empty state: `No containers yet. Add a container inside this shelf.`
- Primary action: `New container`.

### Folders Page

- Show folders as clean cards or a compact list.
- Each folder should show the name, document count, created date, and quick actions.
- Empty state: `No folders yet. Create a folder for related documents.`
- Primary action: `New folder`.

### Documents Page

- Show documents as cards or a list.
- Each document should show file name, type, tags, upload date, and action menu.
- Main actions: `Open`, `Download`, `Edit`, `Move`, `QR Code`, `Delete`.
- Empty state: `No documents yet. Upload a file to this folder.`
- Primary action: `Upload document`.

## Actions

- `View` opens the item.
- `Edit` changes name or description.
- `Move` changes the shelf, container, or folder location.
- `QR Code` shows or prints the item QR code.
- `Delete` removes the item after confirmation.

## Search

- Global search should find shelves, containers, folders, and documents.
- Page search should filter only the current page.
- Search text should be simple: `Search shelves`, `Search containers`, `Search folders`, `Search documents`.

## Breadcrumbs

Use clear breadcrumbs on every level:

```text
Shelves > Shelf name > Containers
Shelves > Shelf name > Container name > Folders
Shelves > Shelf name > Container name > Folder name > Documents
```

## Visual Direction

- Keep the shelves page visual and card-based.
- Keep containers as shelf sections or boxes, because that matches the current UI.
- Keep folders clean and list/card based.
- Keep documents focused on upload, preview/open, tags, and file actions.
- Add counts everywhere: containers in a shelf, folders in a container, documents in a folder.
- Use one consistent action menu: View, Rename/Edit, Move, QR Code, Delete.

## Data Needed

- `Shelves`: name, description, generated code, QR code, color.
- `Containers`: name, description, shelf, generated code, QR code, color.
- `Folders`: name, description, container, generated code, QR code, color.
- `Documents`: name, description, file URL, type, tags, shelf, container, folder, generated code, QR code.

## Good Defaults

- Start with one shelf per major category.
- Use containers for physical or logical boxes.
- Use folders for document groups.
- Use tags for extra labels that do not belong in the folder name.
