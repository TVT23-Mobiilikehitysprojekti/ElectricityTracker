const citiesStatus = [
  { name: 'Helsinki', status: 'Normal' },
  { name: 'Turku', status: 'Normal' },
  { name: 'Tampere', status: 'Normal' },
  { name: 'Vaasa', status: 'Normal' },
  { name: 'Seinäjoki', status: 'Normal' },
  { name: 'Jyväskylä', status: 'Normal' },
  { name: 'Lappeenranta', status: 'Normal' },
  { name: 'Joensuu', status: 'Normal' },
  { name: 'Kuopio', status: 'Normal' },
  { name: 'Kajaani', status: 'Normal' },
  { name: 'Oulu', status: 'Normal' },
  { name: 'Tornio', status: 'Normal' },
  { name: 'Rovaniemi', status: 'Normal' },
  { name: 'Tallinn', status: 'Normal' },
  { name: 'Riga', status: 'Normal' },
  { name: 'Vilnius', status: 'Normal' },
  { name: 'Stockholm', status: 'Normal' },
  { name: 'Copenhagen', status: 'Normal' },
  { name: 'Oslo', status: 'Normal' },
  { name: 'Hamburg', status: 'Normal' },
  { name: 'Berlin', status: 'Normal' },
  { name: 'Cologne', status: 'Normal' },
  { name: 'Stuttgart', status: 'Normal' },
  { name: 'Warsaw', status: 'Normal' },
  { name: 'Vienna', status: 'Normal' },
  { name: 'Paris', status: 'Normal' },
  { name: 'Rotterdam', status: 'Normal' },
];

const citiesMean = [
  // Mean daily maximum and minimum
  {
    name: 'Helsinki',
    monthlyData: [
      { month: 'January', meanMax: -0.7, meanMin: -5.6 },
      { month: 'February', meanMax: -1.3, meanMin: -6.3 },
      { month: 'March', meanMax: 2.3, meanMin: -3.6 },
      { month: 'April', meanMax: 8.1, meanMin: 1.1 },
      { month: 'May', meanMax: 14.6, meanMin: 6.4 },
      { month: 'June', meanMax: 18.8, meanMin: 11.2 },
      { month: 'July', meanMax: 21.9, meanMin: 14.5 },
      { month: 'August', meanMax: 20.5, meanMin: 13.5 },
      { month: 'September', meanMax: 15.4, meanMin: 9.3 },
      { month: 'October', meanMax: 9.2, meanMin: 4.2 },
      { month: 'November', meanMax: 4.4, meanMin: 0.4 },
      { month: 'December', meanMax: 1.4, meanMin: -2.9 },
    ],
  },
  {
    name: 'Turku',
    monthlyData: [
      { month: 'January', meanMax: -0.8, meanMin: -6.2 },
      { month: 'February', meanMax: -0.6, meanMin: -6.5 },
      { month: 'March', meanMax: 3.1, meanMin: -4.4 },
      { month: 'April', meanMax: 9.6, meanMin: 0.1 },
      { month: 'May', meanMax: 16.1, meanMin: 5.7 },
      { month: 'June', meanMax: 20.5, meanMin: 10.4 },
      { month: 'July', meanMax: 23.3, meanMin: 13.8 },
      { month: 'August', meanMax: 21.7, meanMin: 12.9 },
      { month: 'September', meanMax: 16.4, meanMin: 8.6 },
      { month: 'October', meanMax: 9.6, meanMin: 3.5 },
      { month: 'November', meanMax: 4.9, meanMin: 0.5 },
      { month: 'December', meanMax: 1.6, meanMin: -3.3 },
    ],
  },
];

function isMeasurementInRange(city, month, dailyMax, dailyMin) {
  const cityData = citiesMean.find(cityEntry => cityEntry.name === city);
  if (!cityData) {
    console.error(`City ${city} not found.`);
    return;
  }

  const monthData = cityData.monthlyData.find(m => m.month === month);
  if (!monthData) {
    console.error(`Month ${month} not found for city ${city}.`);
    return;
  }

  const dailyMean = (dailyMax + dailyMin) / 2;
  const { meanMax, meanMin } = monthData;

  const cityStatus = citiesStatus.find(cityEntry => cityEntry.name === city);
  if (!cityStatus) {
    console.error(`City ${city} status not found.`);
    return;
  }

  if (dailyMean > meanMax) {
    cityStatus.status = 'Exceeds Max';
  } else if (dailyMean < meanMin) {
    cityStatus.status = 'Below Min';
  } else {
    cityStatus.status = 'Normal';
  }
}

// isMeasurementInRange('Helsinki', 'January', -1, -6);