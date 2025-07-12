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

## Practice Modes

The application offers two practice modes to enhance vocabulary learning:

1. **Writing Practice**: Practice writing English words based on their Vietnamese meanings with instant feedback.
2. **Multiple Choice**: Test your knowledge with multiple-choice questions.

These modes are accessible from the Practice page and can be filtered by deck.

## Study Features

- **Flashcard Slider**: Navigate through flashcards with a slider interface.
- **Progress Tracking**: Visual progress bar and statistics for each study session.
- **Session Summary**: View a summary of your performance after completing a session.
- **Deck Selection**: Choose specific decks to study or review all available flashcards.

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Supabase](https://supabase.com/) - PostgreSQL database and API service

## Advanced React Usage

- **Suspense for Data Fetching**: The application uses React's `Suspense` to handle asynchronous operations like fetching search parameters and study data. This ensures a smooth user experience with fallback loading states.

- **Dynamic Routing**: Leverages Next.js dynamic routing to create user-specific and deck-specific pages for studying and practicing flashcards.
