# NoteNest

NoteNest is a full featured note taking application designed to help users capture, organize, and enhance information seamlessly across the web. It combines a browser extension with a web platform, allowing users to save content from anywhere and leverage AI to transform raw information into meaningful insights.

## Features

### Core Functionality
- Save notes directly from anywhere on the web using a browser extension
- Access all saved notes through a centralized web application
- Organize notes into folders and categories
- Delete and manage notes and folders بسهولة
- Search notes efficiently using keywords

### AI Capabilities
- Summarize notes instantly
- Explain saved content for better understanding
- Upload files including PDFs and generate summaries

### Performance and User Experience
- Lazy loading for improved performance
- Skeleton loading for smoother UI transitions
- Light mode and dark mode support
- Progressive Web App (PWA) support for offline access

## Tech Stack

### Frontend
- React
- Tailwind CSS

### Backend
- Node.js
- Express

### Database and Storage
- MongoDB
- Cloudinary

## Architecture Overview

NoteNest follows a full stack architecture:
- The frontend is built with React for a dynamic and responsive user interface
- The backend API is powered by Node.js and Express to handle business logic
- MongoDB is used for storing user data, notes, and metadata
- Cloudinary is used for file uploads and media management
- AI services are integrated to provide summarization and explanation features

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB connection (local or cloud)
- Cloudinary account for file uploads

### Installation

1. Clone the repository
```bash
git clone https://github.com/Succex7/notenest.git
```
2. Navigate into the project directory
```bash
cd notenest
```
3. Install dependencies for both client and server
```bash
npm install
```
4. Create a .env file in the root directory and add the following:
```bash
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
AI_API_KEY=your_ai_api_key
```
5. Start the development server
```bash
npm run dev
```
## Usage
Install the browser extension to start saving notes from any webpage
Access your notes through the web app dashboard
Use AI features to summarize or explain notes and documents
Organize your notes into folders for better productivity

## Live Demo

[https://note-nest-omega-five.vercel.app/]

## Future Improvements
Real time collaboration on notes
Advanced search and filtering
Tagging system for notes
Enhanced AI features and customization

## Contributing

Contributions are welcome. Feel free to fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.

## Author

Built by Suc_cex

