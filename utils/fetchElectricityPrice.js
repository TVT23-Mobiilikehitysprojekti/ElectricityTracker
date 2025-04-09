import { XMLParser } from 'fast-xml-parser';
import {ENTSOE_API_KEY} from'@env'

const AREAS = {
  EE: "10Y1001A1001A39I",
  FI: "10YFI-1--------U",
  SE: "10YSE-3--------H"
};
  
const getTodayPeriod = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const format = (date) => {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return (
      date.getUTCFullYear().toString() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) + '0000'
    );
  };
  
  return {
    start: format(today),
    end: format(tomorrow)
  };
};

const parsePriceData = (jsonData) => {
  try {
    const series = jsonData.Publication_MarketDocument?.TimeSeries;
    if (!series) return Array(24).fill(0);
    const prices = Array(24).fill(null);
    
    const timeSeries = Array.isArray(series) ? series[0] : series;
    const period = timeSeries.Period;
    const points = Array.isArray(period.Point) ? period.Point : [period.Point];

    points.forEach(point => {
      const hour = parseInt(point.position, 10) - 1;
      if (hour >= 0 && hour < 24) {
        prices[hour] = parseFloat(point['price.amount']) / 10;
      }
    });

    return prices;
  } catch (e) {
    console.error('Päivän hintojen parsiminen epäonnistui:', e);
    return Array(24).fill(0);
  }
};

export const fetchElectricityPrice = async () => {
  const parser = new XMLParser({
    ignoreAttributes: false
  });

  const fetchPrices = async (domainCode, countryName) => {
    const { start, end } = getTodayPeriod();

    const url = `https://web-api.tp.entsoe.eu/api?documentType=A44&in_Domain=${domainCode}&out_Domain=${domainCode}&Acquiring_Domain=${domainCode}&Connecting_Domain=${domainCode}&periodStart=${start}&periodEnd=${end}&securityToken=${ENTSOE_API_KEY}`;

    try {
      const response = await fetch(url);
      const xmlText = await response.text();
      const parsed = parser.parse(xmlText);
      const prices = parsePriceData(parsed);
      
      // console.log(`${countryName} hinnat:`, prices);
      return prices;
    } catch (err) {
      console.error(`${countryName} hintojen haku epäonnistui:`, err);
      return [];
    }
  };

  const [estoniaPrices, finlandPrices] = await Promise.all([
    fetchPrices(AREAS.EE, "Viro"),
    fetchPrices(AREAS.FI, "Suomi"),
  ]);

  return {
    EE: estoniaPrices,
    FI: finlandPrices
  };
};


export const getPastDateISO = (daysAgo) => {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - daysAgo);
  
  const year = pastDate.getFullYear();
  const month = String(pastDate.getMonth() + 1).padStart(2, '0');
  const day = String(pastDate.getDate()).padStart(2, '0');
  
  return `${year}${month}${day}0000`;
};

export const fetchElectricityPriceHistory = async (days = 30) => {
  const parser = new XMLParser({
    ignoreAttributes: false
  });

  const fetchHistoryPrices = async (domainCode, countryName) => {
    const endDate = getTodayPeriod().start;
    const startDate = getPastDateISO(days);

    const url = `https://web-api.tp.entsoe.eu/api?documentType=A44&in_Domain=${domainCode}&out_Domain=${domainCode}&periodStart=${startDate}&periodEnd=${endDate}&securityToken=${ENTSOE_API_KEY}`;

    try {
      const response = await fetch(url);
      const xmlText = await response.text();
      const parsed = parser.parse(xmlText);
      const prices = parseHistoricalPriceData(parsed);
      
      // console.log(`${countryName} ${days} historia:`, prices);
      return prices;
    } catch (err) {
      console.error(`${countryName} historian haku epäonnistui:`, err);
      return [];
    }
  };

  const [estoniaHistoryPrices, finlandHistoryPrices] = await Promise.all([
    fetchHistoryPrices(AREAS.EE, "Viro"),
    fetchHistoryPrices(AREAS.FI, "Suomi")
  ]);

  return {
    EE: estoniaHistoryPrices,
    FI: finlandHistoryPrices
  };
};

const parseHistoricalPriceData = (jsonData) => {
  try {
    const series = jsonData.Publication_MarketDocument?.TimeSeries;
    if (!series) return [];
    
    const allPrices = [];
    const timeSeriesArray = Array.isArray(series) ? series : [series];
    
    timeSeriesArray.forEach(timeSeries => {
      const period = timeSeries.Period;
      if (period) {
        const points = Array.isArray(period.Point) ? period.Point : [period.Point];
        points.forEach(point => {
          const price = parseFloat(point['price.amount']) / 10;
          allPrices.push({
            date: period.timeInterval.start,
            hour: parseInt(point.position, 10) - 1,
            price
          });
        });
      }
    });
    
    return allPrices;
  } catch (e) {
    console.error('Historian parsiminen epäonnistui:', e);
    return [];
  }
};