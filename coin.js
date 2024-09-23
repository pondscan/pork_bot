require('dotenv').config();
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment-timezone');
const { TwitterApi } = require('twitter-api-v2');
const { fetchPorkData, formatPrice, formatLargeNumber, formatMarketCap } = require('./fetch.js');

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET_KEY,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const rwClient = client.readWrite;

async function generateImage(porkData) {
  const canvas = createCanvas(500, 500);
  const ctx = canvas.getContext('2d', { antialias: 'subpixel' });

  // Enable font smoothing
  ctx.textDrawingMode = 'glyph';

  // Set background
  ctx.fillStyle = '#fea7dd';
  ctx.fillRect(0, 0, 500, 500);

  // Load and draw logo on left
  const logo = await loadImage(path.join(__dirname, 'pork_logo.png'));
  ctx.drawImage(logo, 20, 20, 58, 58);

  // Draw mirrored logo on right
  ctx.save();
  ctx.translate(480, 20);
  ctx.scale(-1, 1);
  ctx.drawImage(logo, 0, 0, 58, 58);
  ctx.restore();

  // Draw centered title
  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText('$PORK', 250, 60);

  // Function to draw rounded rectangle
  function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  // Draw sparkline (moved up)
  const prices = porkData.market_data.sparkline_7d.price;
  const sparklineWidth = 160;
  const sparklineHeight = 60;
  const sparklineX = (500 - sparklineWidth) / 2;
  const sparklineY = 90;  // Moved up, adjust this value if needed
  const xScale = sparklineWidth / (prices.length - 1);
  const yMin = Math.min(...prices);
  const yMax = Math.max(...prices);
  const yScale = sparklineHeight / (yMax - yMin);

  ctx.beginPath();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  prices.forEach((price, i) => {
    const x = sparklineX + i * xScale;
    const y = sparklineY + sparklineHeight - (price - yMin) * yScale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Add a subtle shadow to the sparkline
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.stroke();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Draw stats (moved down)
  const currentPrice = porkData.market_data.current_price.usd;
  const porkPerDollar = 1 / currentPrice;

  const stats = [
    [
      { label: 'Price', value: `$${formatPrice(currentPrice)}` },
      { label: 'Market Cap', value: `$${formatMarketCap(porkData.market_data.market_cap.usd)}` }
    ],
    [
      { label: '24h', value: `${porkData.market_data.price_change_percentage_24h.toFixed(2)}%`, isPercentage: true, align: 'left' },
      { label: '7d', value: `${porkData.market_data.price_change_percentage_7d.toFixed(2)}%`, isPercentage: true, align: 'center' },
      { label: '30d', value: `${porkData.market_data.price_change_percentage_30d.toFixed(2)}%`, isPercentage: true, align: 'right' }
    ],
    [
      { label: '24h Trading Volume', value: `$${formatLargeNumber(porkData.market_data.total_volume.usd)}` }
    ],
    [
      { label: '$1 buys', value: `~${formatLargeNumber(porkPerDollar)} $PORK` }
    ]
  ];

  let y = sparklineY + sparklineHeight + 20;  // Start stats below sparkline
  stats.forEach((row, rowIndex) => {
    if (rowIndex === 0) {
      // Price on the left, Market Cap on the right
      const leftX = 50;
      const rightX = 300;
      
      row.forEach((stat, statIndex) => {
        const x = statIndex === 0 ? leftX : rightX;
        const labelWidth = ctx.measureText(stat.label).width + 16;
        const labelHeight = 24;
        
        // Draw white pill
        ctx.fillStyle = 'white';
        roundRect(x, y, labelWidth, labelHeight, 12);
        
        // Draw black label text
        ctx.font = '14px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(stat.label, x + labelWidth / 2, y + 17);

        // Draw value
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = 'black';
        const valueY = y + labelHeight + 25;
        ctx.fillText(stat.value, x + labelWidth / 2, valueY);
      });
    } else if (rowIndex === 1) {
      // Align 24h, 7d, and 30d stats
      const leftX = 50;
      const centerX = 250;
      const rightX = 450;
      
      row.forEach((stat, statIndex) => {
        const labelWidth = ctx.measureText(stat.label).width + 16;
        const labelHeight = 24;
        let x;
        if (stat.align === 'left') x = leftX;
        else if (stat.align === 'right') x = rightX - labelWidth;
        else x = centerX - labelWidth / 2;
        
        // Draw white pill
        ctx.fillStyle = 'white';
        roundRect(x, y, labelWidth, labelHeight, 12);
        
        // Draw black label text
        ctx.font = '14px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(stat.label, x + labelWidth / 2, y + 17);

        // Draw value
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = parseFloat(stat.value) >= 0 ? '#4caf50' : '#f44336';
        const valueY = y + labelHeight + 25;
        ctx.fillText(stat.value, x + labelWidth / 2, valueY);
      });
    } else {
      // Center other stats
      const labelWidth = ctx.measureText(row[0].label).width + 16;
      const labelHeight = 24;
      const x = (500 - labelWidth) / 2;
      
      // Draw white pill
      ctx.fillStyle = 'white';
      roundRect(x, y, labelWidth, labelHeight, 12);
      
      // Draw black label text
      ctx.font = '14px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText(row[0].label, x + labelWidth / 2, y + 17);

      // Draw value
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = 'black';
      const valueY = y + labelHeight + 25;
      ctx.fillText(row[0].value, x + labelWidth / 2, valueY);
    }

    y += rowIndex === 1 ? 80 : 70;  // Extra space after the percentage row
  });

  // Add a timestamp
  const pstTime = moment().tz('America/Los_Angeles').format('MMM D, h:mm A');
  ctx.font = '12px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText(`Last updated: ${pstTime} PST`, 250, 470);
  ctx.fillText('Data provided by CoinGecko.com', 250, 485);

  const buffer = canvas.toBuffer('image/png');
  const imagePath = path.join(__dirname, 'pork_stats.png');
  await fs.writeFile(imagePath, buffer);

  return imagePath;  // Make sure this line is present
}

async function postTweetWithImage(tweet, imagePath) {
  try {
    const mediaId = await rwClient.v1.uploadMedia(imagePath);
    const response = await rwClient.v2.tweet({
      text: tweet,
      media: { media_ids: [mediaId] }
    });
    console.log('Tweet posted successfully with image:', response.data.text);
  } catch (error) {
    console.error('Error posting tweet with image:', error);
  }
}

async function runBot() {
  try {
    const porkData = await fetchPorkData();

    if (porkData) {
      console.log('PORK data fetched successfully');

      const imagePath = await generateImage(porkData);
      console.log(`Image generated at: ${imagePath}`);

      await postTweetWithImage("$PORK Stats", imagePath);
      console.log('Tweet posted successfully');

      await fs.unlink(imagePath);
      console.log('Temporary image file deleted');
    }
  } catch (error) {
    console.error('Error running bot:', error);
  }
}

// Run the bot
runBot();