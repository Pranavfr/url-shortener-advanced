# QuickLink - Full Stack URL Shortener

QuickLink is a modern, high-performance URL shortener built with a React/Vite frontend, a Node.js/Express backend, and a custom C++ DSA module for ultra-fast, deterministic short code generation. 

## 🚀 Features
- **Custom C++ DSA Module**: Generates unique short codes using a Polynomial Rolling Hash and Base62 encoding, utilizing Separate Chaining for collision resolution.
- **Full Stack Integration**: Seamless interaction between Node.js and the compiled C++ executable via child processes.
- **Advanced Analytics**: Tracks total clicks, daily trends, device types (Desktop/Mobile), browsers, and referrer IPs.
- **User Dashboard**: Manage your links, toggle them on/off, delete them, or download auto-generated QR codes.
- **Authentication**: Secure JWT-based auth with bcrypt password hashing.
- **Future-Proof Database**: Currently uses SQLite for zero-config local development but is perfectly structured to migrate to PostgreSQL without code changes using Prisma ORM.

## 📁 Folder Structure
```
QuickLink/
├── client/           # React, Vite, TailwindCSS Frontend
├── server/           # Node.js, Express, Prisma Backend
├── cpp/              # C++ DSA Module (HashTable & Base62)
└── README.md
```

## 🧠 DSA Implementation Details (C++) - 
The core hashing logic avoids built-in `std::unordered_map` and relies on a completely custom implementation in `cpp/HashTable.cpp`.
- **Hash Function**: Polynomial Rolling Hash converts a URL string into a 64-bit integer.
- **Encoding**: Converts the 64-bit integer into a Base62 string (A-Z, a-z, 0-9).
- **Collision Resolution**: Separate Chaining with Linked Lists. If two distinct URLs yield the same hash, the algorithm appends a counter, re-hashes, and tests again until a unique short code is generated.
- **Time Complexity**: Average `O(1)` for Insert, Search, and Delete. Worst Case `O(n)`.

## 🛠️ Installation & Setup

1. **Clone the repository** (or extract the project files).
2. **Compile the C++ Module**:
   Ensure you have `g++` (or another C++ compiler) installed.
   ```bash
   cd cpp
   g++ -O3 main.cpp HashTable.cpp Base62.cpp -o hash_gen.exe
   ```
3. **Start the Backend**:
   ```bash
   cd server
   npm install
   npx prisma db push
   npx prisma generate
   npm run dev      # or: npx tsx src/index.ts
   ```
   *The backend runs on `http://localhost:5000`*

4. **Start the Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *The frontend runs on `http://localhost:5173`*

## 📦 Future PostgreSQL Migration
To migrate to PostgreSQL:
1. Open `server/.env`.
2. Change `DATABASE_URL="file:./database.db"` to your Postgres connection string:
   `DATABASE_URL="postgresql://user:password@localhost:5432/quicklink"`
3. Open `server/prisma/schema.prisma` and change `provider = "sqlite"` to `provider = "postgresql"`.
4. Run `npx prisma db push`.
5. That's it! No code changes required.
