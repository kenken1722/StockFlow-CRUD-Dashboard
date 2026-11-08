# StockFlow — Mobile CRUD Dashboard

A responsive inventory dashboard built with **Express.js**, **SQLite**, HTML, CSS, and JavaScript. It works on a phone browser and a desktop browser.

## Features
- Create, read, update, and delete products
- Search products by name or category
- Dashboard summary: product count, total stock, and inventory value
- SQLite database file is created automatically as `dashboard.db`
- Responsive layout for cellphone screens

## Run in Replit (phone or computer)
1. Open https://replit.com/ in Chrome and sign in.
2. Create a new **Node.js** Repl.
3. Upload/extract this project, or create the files using the same folder structure.
4. Open the Shell and run: `npm install`
5. Press **Run**. Replit will show a web preview URL.
6. Open the preview in a new browser tab on your phone.

## Run locally
Requires Node.js 18 or later.
```bash
npm install
npm start
```
Then open `http://localhost:3000`.

## Project structure
```text
mobile-crud-dashboard/
├── server.js
├── package.json
├── dashboard.db       # created automatically
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

## API routes
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/products` | Read all products |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| GET | `/api/summary` | Dashboard totals |

## Notes for submission
- Add screenshots of the dashboard, adding a product, editing a product, and deleting a product.
- Record a short screen demonstration showing all four CRUD operations.
- Push the project folder to your GitHub repository.
- If you deploy it, use a host that supports persistent SQLite storage. Some free hosting environments may reset local files when the app restarts.
