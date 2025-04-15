export const fetchElectricityPrice = async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const start = oneHourAgo.toISOString();
    const end = now.toISOString();

    const apiUrl = `https:sahkotin.fi/prices?fix&vat&start=${start}&end=${end}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error.message);
      return null;
    }
};
