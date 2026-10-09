# NovaCart — E-Commerce College Project

A simple full-stack e-commerce demo with a separate static frontend and Node.js/Express API.

## Folder structure

```text
NovaCart_GitHub_Ready/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── config.js
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

## Technologies

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB / MongoDB Atlas
- Hosting: Vercel for frontend; Render for backend

## Run locally

1. Install Node.js LTS and make sure MongoDB is running locally, or create a MongoDB Atlas database.
2. Open the whole `NovaCart_GitHub_Ready` folder in VS Code.
3. Open a terminal and run:

   ```bash
   cd backend
   npm install
   ```

4. Copy `backend/.env.example` to `backend/.env`.
5. In `backend/.env`, set `MONGO_URI` to your local or Atlas connection string.
6. Start the API from the `backend` directory:

   ```bash
   npm start
   ```

7. Open `frontend/index.html` in a local web server (for example, VS Code Live Server). If Live Server uses a different port, update `FRONTEND_URL` in `backend/.env` to that exact origin. For local API requests, `frontend/config.js` defaults to `http://localhost:5000`.

The backend automatically inserts demo products if the products collection is empty.

## Push to GitHub

1. Create a new GitHub repository.
2. Extract this ZIP and open the extracted `NovaCart_GitHub_Ready` folder in VS Code.
3. Use Source Control in VS Code to initialize Git, stage the files, commit, and publish to GitHub; or use Git Bash in this folder:

   ```bash
   git init
   git add .
   git commit -m "Add NovaCart frontend and backend"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```

   Replace the URL with your own GitHub repository URL. Do not upload your real `.env` file or database password.

## Deploy frontend to Vercel

1. Import this GitHub repository in Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Other**. No build command is needed for plain HTML/CSS/JS.
4. Deploy.
5. Copy the deployed frontend URL.

## Deploy backend to Render

1. Create a new **Web Service** and select the same GitHub repository.
2. Set **Root Directory** to `backend`.
3. Runtime: **Node**.
4. Build command: `npm install`.
5. Start command: `npm start`.
6. Add environment variables:
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `FRONTEND_URL` = your Vercel frontend URL
7. Deploy and copy the Render service URL.

For Render, do not use `mongodb://127.0.0.1:27017/novacart`; that points to the Render instance, not your laptop or Atlas database.

## Connect the frontend to the deployed backend

After Render deployment, open `frontend/config.js` and replace the localhost URL with your Render service URL, for example:

```js
window.NOVACART_API_URL = "https://YOUR-SERVICE.onrender.com";
```

Commit and push that change to GitHub. Vercel will redeploy the frontend. Also set Render's `FRONTEND_URL` to the exact Vercel domain and redeploy if needed.

## Demo note

This is a college demo, not production-ready. It does not process real payments and does not include user authentication or admin authorization. Do not use it for real customer or payment data.
