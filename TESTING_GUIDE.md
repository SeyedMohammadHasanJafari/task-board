# TaskFlow — Manual Verification & QA Acceptance Protocol

This document provides a systematic test suite for verifying TaskFlow's functional workflows, real-time synchronization, CRDT concurrent editing, and system resilience.

---

## 1. Environment Setup & Prerequisites

Ensure all core services are operational before conducting tests:

| Service | Target URL | Expected Port | Notes |
|---|---|---|---|
| Frontend Client | `http://localhost:5173` | `5173` | Vite development server |
| Backend Server | `http://localhost:5000` | `5000` | Express, Socket.io, Yjs WebSocket |
| Database | `mongodb://127.0.0.1:27017` | `27017` | MongoDB daemon / Docker container |

> **Multiplayer Testing Setup:**  
> Open two separate browser contexts side-by-side:
> - **Window A:** Standard browser window (User 1)
> - **Window B:** Incognito / Private browsing window (User 2)

---

## 2. Test Scenarios

### Scenario 1: Authentication & Guest Session Provisioning
**Objective:** Verify standard registration/login and single-click ephemeral guest access.

**Execution Steps:**
1. Navigate to `http://localhost:5173/login`.
2. Click **"Try Demo as Guest"** (or use the landing page CTA).
3. Verify that:
   - The session initializes immediately without requiring credentials.
   - A random identity (e.g., `Guest Neon Lynx #412`) and accent color are assigned.
   - A purple `GUEST` badge appears in the top navigation bar.
   - The connectivity indicator shows green for both `API` (with live latency) and `DB`.
   - The browser redirects to `/dashboard`.
4. Log out and navigate to `/register`.
5. Create an account with a new email and password.
6. Verify redirect to `/dashboard` with an empty board workspace state (`No Custom Workspaces Yet`).
7. Click **"Create Board"**, enter a title, and confirm immediate board provisioning.

---

### Scenario 2: Real-Time Presence & Spatial Cursor Tracking
**Objective:** Validate WebSocket room joins, user presence stacks, and throttled cursor broadcasts.

**Execution Steps:**
1. In **Window A**, open `http://localhost:5173/board/demo`.
2. In **Window B** (Incognito), open the same URL: `http://localhost:5173/board/demo`.
3. Observe the top right header:
   - Verify avatar icons for both active participants appear in the header stack with an online user counter.
4. Move the pointer across the board surface in **Window A**.
5. Observe **Window B**:
   - A colored pointer cursor matching User 1's avatar color should track smoothly across the canvas.
   - The collaborator's display name must float directly above the cursor.
   - Pointer updates should broadcast smoothly at 50ms throttled intervals without UI jitter.

---

### Scenario 3: Optimistic Drag-and-Drop Card Synchronization
**Objective:** Confirm horizontal and vertical task card movements with instant client-side updates and remote broadcast.

**Execution Steps:**
1. In **Window A**, drag a task card from the **Backlog** column to the **In Progress** column.
2. Verify local behavior:
   - The card snaps into place immediately with zero layout distortion (Optimistic UI).
   - The header status indicator switches briefly to `Syncing...` then returns to `Synced`.
3. Verify remote behavior in **Window B**:
   - Without page reload, the same card relocates to the **In Progress** column instantaneously.
4. In **Window B**, reorder cards within the same column:
   - Confirm new ordering updates persist across both windows.

---

### Scenario 4: Column & Task CRUD Operations
**Objective:** Verify card creation, inline column renaming, and deletions across clients.

**Execution Steps:**
1. **Task Creation:**
   - In any column, click **"+ Add Card"**.
   - Input task title: `Audit Socket Reconnect Policies`.
   - Select priority: `Urgent`.
   - Press `Enter` or click Add.
   - Confirm the new card renders immediately in both windows with the corresponding priority badge.
2. **Inline Column Rename:**
   - Double-click a column title (e.g., `In Progress`).
   - Change the text to `Active Sprint` and press `Enter`.
   - Confirm the column header updates immediately across both windows.
3. **Card Deletion:**
   - Open a card, click the delete icon, and confirm the prompt.
   - Confirm the card is removed from both active boards.

---

### Scenario 5: Conflict-Free Concurrent Rich-Text Editing (CRDT)
**Objective:** Validate simultaneous document editing in task descriptions without overwrite conflicts.

**Execution Steps:**
1. In both windows, click the same card to open its detail modal.
2. Verify the description header displays:
   - A pulsing green indicator labeled `LIVE SYNC`.
   - An active editor counter displaying `2 editing`.
3. In **Window A**, type a paragraph and apply formatting (Bold, Bullet List, or Inline Code).
4. Simultaneously in **Window B**, type additional text at the end of the document.
5. Confirm that:
   - Edits stream character-by-character across both windows in real time.
   - Text inserts merge deterministically via Yjs CRDTs with no lost keystrokes or collision locks.
6. Close the modal:
   - Verify that the card preview on the Kanban board displays an updated plaintext excerpt.

---

### Scenario 6: Card Activity Stream & Real-Time Comments
**Objective:** Confirm audit logging and comment propagation in the card activity feed.

**Execution Steps:**
1. Inside the open card modal, scroll to the **Activity & Comments** section.
2. In **Window A**, enter a comment: `Dependency audit completed on socket cluster.` and submit.
3. Verify:
   - The comment renders immediately in Window A with user avatar and relative timestamp.
   - In **Window B**, the new comment appears in the feed in real time without refreshing or closing the modal.

---

### Scenario 7: Real-Time Board Search & Filtering
**Objective:** Validate client-side search filtering by task title and tags.

**Execution Steps:**
1. On the main board view, locate the search input: `Filter tasks by title or tags...`.
2. Type a matching search keyword (e.g., `Socket` or `Design`).
3. Confirm:
   - Non-matching cards are hidden immediately.
   - Matching cards remain visible across their respective columns.
   - The result badge updates (e.g., `Showing X of Y tasks`).
4. Clear the search input:
   - All columns and cards must restore to their default states.

---

### Scenario 8: Workspace Sidebar & Board Lifecycle
**Objective:** Verify sidebar navigation, board creation, and board deletion.

**Execution Steps:**
1. Click the sidebar toggle icon in the top header.
2. Confirm the collapsible workspace sidebar expands smoothly.
3. Click **"+ New Board"**, provide a board title, and submit.
4. Verify:
   - The new board initializes with default Kanban columns (`Backlog`, `In Progress`, `Review`, `Done`).
   - The client routes to `/board/:id`.
5. Test board deletion:
   - Click the delete icon for a test board and confirm the dialog.
   - Confirm the board and all associated cards are removed from the database and sidebar.

---

### Scenario 9: Direct Guest Deep Links
**Objective:** Verify external collaborator onboarding via guest URL parameters.

**Execution Steps:**
1. On any active board, click **"Guest Link"** in the top header.
2. Verify clipboard feedback: `Link Copied!` (URL format: `http://localhost:5173/board/:id?guest=true`).
3. Open a completely new incognito session and paste the copied URL.
4. Verify:
   - The application automatically provisions a guest session.
   - The browser navigates directly into the target board.
   - The guest user immediately joins the board's WebSocket presence pool.

---

### Scenario 10: Service Health & Production Build Validation
**Objective:** Verify operational endpoints and container compilation integrity.

**Execution Steps:**
1. Query the health check endpoint:
   ```bash
   curl -s http://localhost:5000/api/health
   ```
2. Verify response payload:
   ```json
   {
     "success": true,
     "status": "healthy",
     "database": {
       "status": "connected",
       "name": "task-board"
     }
   }
   ```
3. Execute production builds from the workspace root:
   ```bash
   npm run build
   ```
4. Confirm both server (`tsc`) and client (`tsc -b && vite build`) compile with exit code `0`.

---

## 3. QA Acceptance Sign-Off Matrix

| Requirement | Test Method | Status |
|---|---|---|
| Single-click guest authentication | Manual browser flow | Pass |
| Multi-user presence & active avatar stack | Dual-window WebSocket inspection | Pass |
| Throttled 50ms remote cursor tracking | Dual-window pointer movement | Pass |
| Optimistic drag-and-drop task movements | Dual-window board manipulation | Pass |
| Concurrent rich-text editing (Yjs CRDT) | Simultaneous dual-window typing | Pass |
| Real-time activity comments | Dual-window modal stream | Pass |
| Search filter by title and tags | Client-side input filter | Pass |
| Deep-link guest onboarding (`?guest=true`) | Direct URL navigation | Pass |
| Service health check (`/api/health`) | HTTP GET verification | Pass |
| TypeScript & production bundle build | `npm run build` | Pass |
