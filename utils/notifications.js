import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { fetchElectricityPrice } from './fetchSpotPrice';

export async function registerForPushNotificationsAsync() {
  console.log("Requesting notification permissions...");

  const { status } = await Notifications.requestPermissionsAsync();
  console.log(`Notification permissions status: ${status}`);

  if (status === 'granted') {
    console.log("Permissions granted.");
  } else {
    console.log("Permissions not granted.");
  }
}

export async function triggerNotification(notificationsEnabled) {
  console.log("triggerNotification function called");

  if (!notificationsEnabled) {
    console.log("Notifications are disabled. Notification not sent.");
    return;
  }

  try {
    const lowerLimit = parseFloat(await AsyncStorage.getItem('lowerLimit')) || 0.0;
    const upperLimit = parseFloat(await AsyncStorage.getItem('upperLimit')) || 10.0;
    const upperLimitNotificationSent = JSON.parse(await AsyncStorage.getItem('upperLimitNotificationSent')) || false;
    const lowerLimitNotificationSent = JSON.parse(await AsyncStorage.getItem('lowerLimitNotificationSent')) || false;

    const currentPrice = await fetchElectricityPrice();
    if (currentPrice === null || isNaN(currentPrice)) {
      console.error("Invalid or missing price data from fetchElectricityPrice.");
      return;
    }
    console.log("Fetched current electricity price:", currentPrice);

    if (currentPrice > upperLimit && !upperLimitNotificationSent) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Sähkö on nyt kallista.",
          body: `Viimeisin hinta: ${currentPrice.toFixed(2)} c/kWh. Asettamasi yläraja: ${upperLimit.toFixed(2)} c/kWh.`,
        },
        trigger: null,
      });
      console.log("Notification sent: Price exceeded upper limit");
      await AsyncStorage.setItem('upperLimitNotificationSent', JSON.stringify(true));
    } else if (currentPrice <= upperLimit) {
      await AsyncStorage.setItem('upperLimitNotificationSent', JSON.stringify(false));
    }

    if (currentPrice < lowerLimit && !lowerLimitNotificationSent) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Sähkö on nyt edullista.",
          body: `Viimeisin hinta: ${currentPrice.toFixed(2)} c/kWh. Asettamasi alaraja: ${lowerLimit.toFixed(2)} c/kWh.`,
        },
        trigger: null,
      });
      console.log("Notification sent: Price dropped below lower limit");
      await AsyncStorage.setItem('lowerLimitNotificationSent', JSON.stringify(true));
    } else if (currentPrice >= lowerLimit) {
      await AsyncStorage.setItem('lowerLimitNotificationSent', JSON.stringify(false));
    }
  } catch (error) {
    console.error("Error in triggerNotification:", error.message);
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
