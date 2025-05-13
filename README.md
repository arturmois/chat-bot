# Chat Bot

A WhatsApp-based chat bot application built with Node.js, Express, and Prisma. This project integrates with the [WhatsApp Hard API](https://github.com/renatoiub/whatsapp-hard-api-node) for WhatsApp messaging functionality.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)
- SQLite (for database)
- WhatsApp Hard API instance running (default: http://localhost:3333)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/arturmois/chat-bot.git
cd chat-bot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following content:
```
DATABASE_URL="file:./dev.db"
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Configure WhatsApp Hard API:
Make sure you have the WhatsApp Hard API running and update the following configuration in `src/WhatsappService.ts`:
- `BASE_URL`: The URL where your WhatsApp Hard API is running
- `ADMIN_TOKEN`: Your WhatsApp Hard API admin token
- `BEARER_TOKEN`: Your WhatsApp Hard API bearer token

## Running the Application

### Development Mode
To run the application in development mode with hot-reload:
```bash
npm run dev
```

### Production Mode
To build and run the application in production mode:
```bash
npm run build
npm start
```

## Testing
Run the test suite:
```bash
npm test
```

## Project Structure

- `src/` - Source code directory
  - `WhatsappService.ts` - WhatsApp Hard API integration
  - `HandleWebhook.ts` - Webhook handler for incoming messages
  - Other core business logic files
- `prisma/` - Database schema and migrations
- `test/` - Test files
- `generated/` - Generated Prisma client

## Database Schema

The application uses SQLite with the following main models:
- Customer: Stores customer information and chat state
- Product: Product catalog
- Order: Customer orders

## WhatsApp Integration

This project uses the WhatsApp Hard API for sending and receiving WhatsApp messages. The integration is handled through the `WhatsappService` class which provides methods for:
- Sending text messages
- Handling incoming webhooks
- Managing customer conversations

## License

ISC
