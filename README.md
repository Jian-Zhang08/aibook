# BookBuddy - AI Book Companion

BookBuddy is an AI-powered application that lets users ask questions about books and receive beautiful, interactive responses with rich UI components.

## Features

- **PDF Upload**: Upload any book in PDF format
- **Natural Language Questions**: Ask questions in plain English about characters, themes, plot, and more
- **Beautiful UI Responses**: Get contextually appropriate UI components based on your question type:
  - Character profiles
  - Timeline visualizations
  - Theme and symbol analysis
  - Quote analysis
  - Comparison cards
  - Text responses
- **Fast Processing**: Responses are generated within seconds
- **Pre-loaded Sample**: Try it out with "The Great Gatsby" example
- **OpenAI Integration**: Optional advanced AI responses using OpenAI's GPT models

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key (optional, for advanced features)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/bookbuddy.git
cd bookbuddy
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (optional, for OpenAI integration):

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` to add your OpenAI API key.

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to http://localhost:3000

## Usage

1. Upload a PDF book file using the drag-and-drop interface
2. Wait for the book to be processed
3. Ask questions about the book in natural language
4. Explore the beautiful UI responses tailored to your question type

## Technical Details

BookBuddy uses:

- **Next.js**: For the frontend and API routes
- **PDF Processing**: PDF.js and pdf-parse for text extraction
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **React**: For UI components

### AI Integration

BookBuddy supports two modes of operation:

1. **Basic Mode**: Works without any API keys, using simple text matching and pre-configured UI components
2. **Advanced Mode**: Requires an OpenAI API key to generate more accurate and detailed responses

The OpenAI integration:

- Analyzes questions to determine the most appropriate response format
- Extracts relevant passages from the book
- Generates structured responses using GPT models
- Creates rich UI components based on question context

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The Great Gatsby sample data is based on F. Scott Fitzgerald's novel
