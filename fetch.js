const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";
const PORK_ID = "pepefork";

async function fetchPorkData() {
    try {
        const response = await fetch(`${COINGECKO_API_URL}/coins/${PORK_ID}?sparkline=true`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching Pork data:", error.message);
        return null;
    }
}

function formatPrice(price) {
    if (price < 0.000001) {
        return price.toFixed(12);
    } else {
        return price.toFixed(6);
    }
}

function formatLargeNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'm';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toFixed(0);
}

function formatMarketCap(num) {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

// Export the necessary functions
module.exports = {
    fetchPorkData,
    formatPrice,
    formatLargeNumber,
    formatMarketCap
};
