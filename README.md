# $PORK Twitter Bot

## Overview
The $PORK Twitter Bot is an automated tool designed to fetch and display real-time statistics for the $PORK cryptocurrency. It generates a visually appealing image that includes key metrics such as price, market cap, and trading volume, and posts this information to Twitter at regular intervals. The bot utilizes the CoinGecko API to retrieve cryptocurrency data and the Twitter API to post updates.

## Features
- Automatically fetches $PORK cryptocurrency statistics every hour.
- Generates a custom image displaying key metrics.
- Posts updates to Twitter with the latest statistics.

## Getting Started

### Prerequisites
To run this bot, you will need:
- A GitHub account
- A Twitter Developer account to access the Twitter API
- A CoinGecko API key
- An Alchemy API key (optional, depending on usage)

### Forking the Repository
1. Go to the [pork_bot repo](https://github.com/pondscan/pork_bot).
2. Click on the "Fork" button in the top right corner of the page.
3. Clone your forked repository to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pork_bot.git
   ```
4. Navigate to the project directory:
   ```bash
   cd pork_bot
   ```

### Setting Up the Bot
1. Install the required dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root of the project and add your API keys:
   ```plaintext
   TWITTER_API_KEY=your_twitter_api_key
   TWITTER_API_SECRET_KEY=your_twitter_api_secret_key
   TWITTER_ACCESS_TOKEN=your_twitter_access_token
   TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token
   COINGECKO_API_KEY=your_coingecko_api_key
   ALCHEMY_API_KEY=your_alchemy_api_key
   ```

3. Run the bot locally to test it:
   ```bash
   node coin.js
   ```

### Deploying on GitHub Actions
- The bot is set up to run automatically every hour using GitHub Actions. You can check the `.github/workflows/tweet-pork-stats.yml` file for the schedule configuration.

## Contact
I am available for hire to build Twitter bots and automation solutions. Feel free to reach out to me on X (formerly Twitter) at [@pondscan](https://twitter.com/pondscan).
