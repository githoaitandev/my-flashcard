# English Vocabulary Flashcard Application

A web application for learning English vocabulary using flashcards, built with Next.js, TypeScript, and TailwindCSS.

## Features

### 🔤 Add New Words

- Add vocabulary with English word, Vietnamese meaning, part of speech, and example sentence.

### 📁 Deck Management

- Create and manage multiple decks of flashcards.
- Organize words by topic or category.

### 🧠 Flashcard Study

- Review flashcards with flip animation.
- Mark cards as remembered or not remembered.
- Track learning progress.

### ✍️ Writing Practice

- Practice writing words based on their meaning.
- Instant feedback on correctness.

### 📥 Import/Export

- Export decks as JSON files.
- Import decks from JSON files.

## Getting Started

### Prerequisites

- Node.js 14.0 or higher
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up the Supabase connection:

```bash
npm run setup-supabase
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication

The application includes a comprehensive authentication system using Supabase Auth. Key features include:

- **User Registration and Login**: Supports email/password and Google OAuth.
- **Session Management**: Persistent user sessions with automatic token refresh.
- **Route Protection**: Middleware ensures only authenticated users can access certain pages.
- **User-Specific Data**: API routes and database queries are secured with Row Level Security (RLS) policies.

### Setting Up Authentication

1. Configure Supabase Auth in the Supabase dashboard.
2. Update the `.env` file with your Supabase project URL and API key.
3. Ensure RLS policies are enabled and properly configured in the database.

## Middleware

- Middleware is used to protect routes and redirect unauthenticated users to the login page.
- Located in `middleware.ts`, it checks the user's authentication status before granting access to protected pages.

## Database Schema

The application uses Supabase PostgreSQL database. The main models are:

- **User**: Stores user information.
- **Deck**: Includes a `user_id` column to associate decks with specific users.
- **Flashcard**: Includes a `user_id` column for user-specific flashcards.
- **StudySession**: Tracks study sessions per user.

Row Level Security (RLS) policies ensure that users can only access their own data.

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Supabase](https://supabase.com/) - PostgreSQL database and API service
