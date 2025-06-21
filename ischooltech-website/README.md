# iSchoolTech Website Project (MVP)

This project is a Minimum Viable Product (MVP) for the iSchoolTech website, designed to present services, collect registrations, and facilitate contact. It features a modern frontend built with React and TailwindCSS, and a backend powered by Node.js, Express, and MongoDB.

## Project Structure

The project is organized into two main directories:

-   `/frontend`: Contains the React application (Vite + TailwindCSS).
-   `/backend`: Contains the Node.js Express server and API logic.

## Tech Stack

**Frontend:**
-   React (with Vite)
-   TailwindCSS
-   `react-i18next` & `i18next` (for internationalization FR/AR)
-   `react-icons` (for icons)

**Backend:**
-   Node.js
-   Express.js
-   MongoDB (with Mongoose)
-   `dotenv` (for environment variables)
-   `cors` (for Cross-Origin Resource Sharing)

## Prerequisites

-   Node.js (v16 or later recommended)
-   npm (comes with Node.js)
-   MongoDB (a running instance, local or cloud-based like MongoDB Atlas)

## Setup & Running the Project

### 1. Clone the Repository (if applicable)

```bash
# If you have this project in a git repository:
# git clone <repository-url>
# cd ischooltech-website
```

### 2. Backend Setup

```bash
cd backend
npm install
```

-   Create a `.env` file in the `/backend` directory by copying `.env.example` (if provided) or creating it manually.
-   Update the `.env` file with your MongoDB connection string and desired port:
    ```env
    MONGO_URI=your_mongodb_connection_string_here
    PORT=5001
    ```
-   Start the backend server:
    ```bash
    npm start
    ```
The backend server should now be running (typically on `http://localhost:5001`).

### 3. Frontend Setup

```bash
cd ../frontend
# (If you are in the backend directory, otherwise navigate to frontend directly)
npm install
```
*(Note: If `react-icons` or other dependencies cause issues, ensure they are correctly listed in `package.json` and try installing them specifically if needed, e.g., `npm install react-icons`)*

-   The frontend is configured to proxy API requests starting with `/api` to the backend server (defaulting to `http://localhost:5001`). This is set up in `vite.config.js`.
-   Start the frontend development server:
    ```bash
    npm run dev
    ```
The frontend application should now be running (typically on `http://localhost:5173` or another port specified by Vite).

## Key Features (MVP)

-   **Homepage:** Displays services and general information.
-   **Registration Form:** Allows users to register for courses. Data is sent to the backend.
-   **Multilingual Support:** Basic French (FR) and Arabic (AR) translations implemented. A language switcher is available in the header.
-   **Contact Options:** WhatsApp and Email links.
-   **Responsive Design:** Styled with TailwindCSS for responsiveness across devices.

## Code Documentation

JSDoc comments and inline comments have been added to key components and functions in both the frontend and backend codebase to improve readability and maintainability.
