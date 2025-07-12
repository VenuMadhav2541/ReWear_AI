# 👕 ReWear AI — AI-Powered Sustainable Clothing Exchange Platform

ReWear AI is an intelligent clothing exchange platform that leverages Google Gemini AI to generate smart product listings based on image and title inputs. It promotes sustainable fashion by encouraging users to swap used clothing items instead of discarding them. The platform automates item description generation, content moderation, and natural language search parsing, making the reuse process seamless and user-friendly.

## 🌟 Features

- 🤖 AI-Powered Suggestions: Automatically generates appealing product descriptions, relevant tags, and estimated condition (New, Like New, Good, Fair).
- 🔎 Natural Language Search Parsing: Translates user-friendly search terms like "blue jeans for men in L size" into structured filter parameters.
- 🧼 Content Moderation: Ensures user-submitted content is appropriate and family-friendly.
- 🖼️ Image Upload Support: Accepts clothing item images to enrich AI suggestions.
- 🔄 Clothing Swap System: Allows users to offer, request, and exchange used clothing items sustainably.

## 🛠️ Tech Stack

| Layer        | Technology                              |
|--------------|------------------------------------------|
| Backend      | Node.js, Express, TypeScript             |
| Frontend     | React, Tailwind CSS, React Query         |
| AI Service   | Google Gemini (`@google/genai`)          |
| Database     | PostgreSQL, Supabase                     |
| Hosting      | Render / Vercel                          |
| File Storage | Supabase Storage or Local FS             |

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/VenuMadhav2541/ReWear_AI.git
cd ReWear_AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Environment Variables

Create a `.env` file in the root directory and paste the following:

```env
GEMINI_API_KEY=your_google_gemini_api_key
DATABASE_URL=your_postgres_connection_url
```

> Ensure you enable **Generative Language API** in Google Cloud Console for the Gemini key to work.

### 4. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 📁 Folder Structure

```
ReWear_AI/
├── client/                   # React Frontend
│   ├── components/
│   ├── pages/
│   └── ...
├── server/                   # Express Backend
│   ├── gemini.ts             # Gemini API Integration
│   ├── routes.ts             # API Routes
│   └── ...
├── screenshots/              # Screenshots for README
├── .env                      # Environment Variables
├── README.md                 # Project Documentation
└── package.json
```

## 🧠 Gemini AI Integration

### 📦 1. generateItemSuggestions(title, imagePath)
Generates a product description, 5 tags, and condition based on title and image.

**Input Example:**
```ts
generateItemSuggestions("Red Summer Dress", "uploads/dress.jpg");
```

**Output Example:**
```json
{
  "description": "Bright red summer dress perfect for casual outings and beach walks.",
  "tags": ["Red", "Summer", "Casual", "Dress", "Beachwear"],
  "condition": "Like New"
}
```

### 🔍 2. parseNaturalSearch(query)
Parses user queries into structured filters.

**Input:**  
"Men's black jacket size L in good condition"

**Output:**
```json
{
  "category": "Men",
  "size": "L",
  "condition": "Good",
  "search": "black jacket"
}
```

### 🚫 3. moderateContent(text)
Moderates the AI-generated description and returns `Yes` or `No` indicating appropriateness.

## 📸 Screenshots

> Add your screenshots inside a `/screenshots` folder in the root.

| Feature             | Screenshot                                |
|---------------------|--------------------------------------------|
| LandingPage            | ![LandingPage](./screenshots/landingpage.png)        |
| LandingPage            | ![LandingPage](./screenshots/landingpage1.png)        |
| 🔐 Login Page       | ![Login](./screenshots/login.png)         |
| 🔐 Register Page       | ![Register](./screenshots/register.png)         |
| 🏠 Dashboard        | ![Dashboard](./screenshots/dashboard.png) |
| 📤 Upload Item      | ![Upload](./screenshots/list_items.png)       |
| 📤 Item details      | ![ItemDetails](./screenshots/itemDetails.png)       |
| 🔍 Search Results   | ![Search](./screenshots/browseItems.png)       |
| Approvel        | ![Approvel](./screenshots/ApprovelRequist.png) |

## 🌐 Environment Example

Create a `.env` file with the following:

```env
GEMINI_API_KEY=AIzaSy***************
DATABASE_URL=postgres://postgres:password@db.supabase.co:5432/postgres
```

> The Gemini API Key must be active and unrestricted for **Generative Language API** in Google Cloud Console.

## 🧩 Future Enhancements

- ✅ Reward Points for Donations
- 🛍️ Add Wishlists and Swap Offers
- 🌍 Multi-language Support
- 📊 Admin Analytics Dashboard
- 🔔 Notifications for Offers/Requests

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repo  
2. Create a feature branch  
3. Commit your changes  
4. Submit a pull request

## 👨‍💻 Developer

**Venu Madhav Bandarupalli**

- 📧 Email: bandarupalli.venumadhav.2541@gmail.com  
- 🌐 LinkedIn: [linkedin.com/in/venumadhav-bandarupalli](https://www.linkedin.com/in/venumadhav-bandarupalli)  
- 💻 GitHub: [github.com/VenuMadhav2541](https://github.com/VenuMadhav2541)

## 📄 License

This project is licensed under the [MIT License](LICENSE).

### ♻️ Let’s make fashion sustainable — one swap at a time!
