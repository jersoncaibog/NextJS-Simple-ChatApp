# NextJS Simple Chat App

A modern chat application built with Next.js 14, Supabase, and Google Authentication.

## Features

- 🔐 Google Authentication
- 💬 Real-time messaging
- 🎨 Modern UI with Tailwind CSS
- 🔄 State management with Redux
- 📱 Responsive design

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React Framework
- [Supabase](https://supabase.com/) - Backend and Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Redux Toolkit](https://redux-toolkit.js.org/) - State Management
- [TypeScript](https://www.typescriptlang.org/) - Type Safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase account
- A Google Cloud project with OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jersoncaibog/NextJS-Simple-ChatApp.git
cd NextJS-Simple-ChatApp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Setup

### Supabase Setup
1. Create a new project in Supabase
2. Enable Google Auth in Authentication > Providers
3. Add your Google OAuth credentials
4. Copy the project URL and anon key to your `.env.local`

### Google OAuth Setup
1. Create a project in Google Cloud Console
2. Configure OAuth consent screen
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
