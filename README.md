This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## CDN Uploader

A Next.js 15 CDN file uploader with Vercel Blob storage, featuring public upload history and admin dashboard.

## Features

- 📤 Direct file uploads to Vercel Blob storage
- 📊 Public upload history with file verification
- 💾 Storage usage tracking (1 GB limit)
- 🛠️ Admin dashboard to manage files
- 🔐 Secure password-protected admin access
- 📋 One-click URL copy to clipboard

## Getting Started

### 1. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your admin password:

```env
ADMIN_PASSWORD=your_secure_password_here
```

⚠️ **Important**: `.env.local` is already in `.gitignore` and will NOT be committed to GitHub.

### 3. Configure Vercel Blob

Set up your Vercel Blob storage token:
- Go to your Vercel project dashboard
- Navigate to Storage → Create Database → Blob
- Copy the `BLOB_READ_WRITE_TOKEN` and add it to your environment variables

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the uploader.

## Admin Dashboard

Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

**Features:**
- View all uploaded files
- Delete individual files
- Clear all files at once
- See storage usage statistics

**Default password**: Set in your `.env.local` file

## Deployment on Vercel

1. Push your code to GitHub (`.env.local` will be ignored)
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `ADMIN_PASSWORD` - Your admin password
   - `BLOB_READ_WRITE_TOKEN` - From Vercel Blob storage

4. Deploy!

### Setting Environment Variables in Vercel

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add:
   - **Key**: `ADMIN_PASSWORD`
   - **Value**: Your secure password
   - **Environments**: Production, Preview, Development

## Security Notes

- Never commit `.env.local` to version control
- Use strong passwords for production
- The admin password is checked server-side only
- For production, consider adding proper authentication (JWT, NextAuth, etc.)

## Project Structure

```
app/
├── page.tsx              # Main uploader UI
├── layout.tsx            # Root layout
├── admin/
│   ├── page.tsx          # Admin login
│   └── dashboard/
│       └── page.tsx      # Admin dashboard
├── api/
│   ├── upload/
│   │   └── route.ts      # Upload handler
│   ├── history/
│   │   ├── route.ts      # History CRUD
│   │   └── cleanup/
│   │       └── route.ts  # Remove deleted files
│   └── admin/
│       ├── route.ts      # Admin file operations
│       └── auth/
│           └── route.ts  # Password authentication
└── cdn/
    └── [...path]/
        └── route.ts      # Blob storage proxy
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!