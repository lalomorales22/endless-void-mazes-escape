
# TRON Database Interface
<img width="1082" alt="Screenshot 2025-06-15 at 11 02 46 AM" src="https://github.com/user-attachments/assets/07de4cd1-8c5e-43b6-a5fd-d284d2d89396" />

Welcome to your TRON-inspired 3D Database Interface! This application provides a unique, immersive way to visualize and interact with your database.

## About The Project

This project renders your database schema as a 3D landscape. Each table is represented as a "building" that you can navigate to. You can see table details, record counts, and even create new tables directly from the 3D interface.

### Key Features:

*   **3D Database Visualization:** Navigate a futuristic city where buildings represent your database tables.
*   **Interactive UI:** Click on buildings to view table details, and use the HUD to get an overview of your database status.
*   **Create Tables:** Dynamically add new tables to your database through the in-app interface.
*   **Real-time Data:** The interface reflects the current state of your database.

## How to Use

*   **Navigate:** Use `WASD` or `Arrow Keys` to move around the 3D world.
*   **Rotate View:** Click and drag your mouse to look around.
*   **Zoom:** Use the mouse scroll wheel to zoom in and out.
*   **Select a Table:** Click on a "Database Building" on the right-side panel, or click on a building in the 3D view to navigate to it.
*   **Create a Table:** Click the "CREATE TABLE" button or press the `Spacebar` to open the table creation dialog.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/38427bc0-010d-40b3-b956-341b812ae2ec) and start prompting.

Changes made via Lovable will be committed automatically to this repo if it's connected to GitHub.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
# You can get this URL after connecting your project to GitHub.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Three.js for 3D rendering
- Supabase for the backend and database


