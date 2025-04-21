export const fetchElectricityPrice = async () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const start = oneHourAgo.toISOString();
  const end = now.toISOString();

  const apiUrl = `https://sahkotin.fi/prices?fix&vat&start=${start}&end=${end}`;

  try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();

      if (!data || !data.prices || data.prices.length === 0) {
          throw new Error("Invalid data format or missing prices.");
      }

      const latestPrice = parseFloat(data.prices[data.prices.length - 1].value) / 10;
      if (isNaN(latestPrice)) {
          throw new Error("Invalid price value.");
      }

      console.log(`Fetched electricity price (adjusted): ${latestPrice} c/kWh`);
      return latestPrice;
  } catch (error) {
      console.error("Error fetching electricity price:", error.message);
      return null;
  }
};
