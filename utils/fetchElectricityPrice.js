export const fetchElectricityPrice = async () => {
  try {
    const response = await fetch(`http://electricitytracker-backend.onrender.com/api/electricity-prices`);
    if (!response.ok) {
      throw new Error('Network response error');
    }
    return await response.json();
  } catch (err) {
    console.error("Error fetching electricity prices:", err);
    return {
      EE: Array(24).fill(0),
      FI: Array(24).fill(0),
    };
  }
};

export const fetchElectricityPriceHistory = async (days = 30) => {
  try {
    const response = await fetch(`http://electricitytracker-backend.onrender.com/api/electricity-price-history?days=${days}`);
    if (!response.ok) {
      throw new Error('Network response error');
    }
    return await response.json();
  } catch (err) {
    console.error("Error fetching electricity price history:", err);
    return {
      EE: [],
      FI: [],
    };
  }
};