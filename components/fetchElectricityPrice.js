export const getTodayDateISO = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export const getPastDateISO = (daysAgo) => {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - daysAgo);
  return pastDate.toISOString().split("T")[0];
};

export const fetchElectricityPrice = async () => {
  const date = getTodayDateISO();
  const start = `${date}T00:00:00.000Z`;
  const end = `${date}T23:59:59.999Z`;

  const apiUrl = `https:sahkotin.fi/prices?fix&vat&start=${start}&end=${end}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`erroria pukkaa: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Sähkön hinta hukassa:", error.message);
    return null;
  }
};

export const fetchElectricityPriceHistory = async (days = 30) => {
  const startDate = getPastDateISO(days);
  const endDate = getTodayDateISO();
  const apiUrl = `https:sahkotin.fi/prices?fix&vat&start=${startDate}T00:00:00.000Z&end=${endDate}T23:59:59.999Z`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`erroria pukkaa: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Sähkön hintahistoria hukassa:", error.message);
    return null;
  }
};
