# Adding Backend Support for Children's Hope Foundation

This plan outlines setting up an extremely simple Node.js backend using a local SQLite file to fulfill the core requirements: collecting emails and enabling social links. **Crucially, all technologies chosen are 100% free and require zero budget.**

## Proposed Changes
### Step 1: Lightweight Backend Server & SQLite (100% Free)
- Create `server.js` to serve existing static files with Express.
- Set up an SQLite database (`database.sqlite`). SQLite is a file-based database that requires no external cloud database provider, meaning it costs nothing.

### Step 2: Form Connections
- Modify the donation form (`donate.html` and `donate.js`) to capture the user's email along with the donation details, and POST it to `/api/donations`.
- Modify the newsletter form (`index.html`) to POST emails to `/api/newsletter`.

### Step 3: Social Sharing Links
- Edit `index.html`, `donate.html`, and `thank_you.html` to include `<meta property="og:image" content="..." />` and related tags for a proper preview image.

## Verification Plan
### Manual Verification
- Run the server locally.
- Test both the donation form and the newsletter form, verifying that records are safely written into the SQLite local database file.
- Inspect the HTML headers to ensure OG tags are present.
