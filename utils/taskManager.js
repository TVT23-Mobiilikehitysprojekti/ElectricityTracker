import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchElectricityPrice } from './fetchSpotPrice';

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND_NOTIFICATION_TASK";

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  console.log("Background task executed.");

  let notificationsEnabled = false;

  try {
    const storedValue = await AsyncStorage.getItem('notificationsEnabled');
    if (storedValue !== null) {
      notificationsEnabled = JSON.parse(storedValue);
    } else {
      console.warn("Failed to retrieve notifications state, proceeding with notifications.");
      notificationsEnabled = true;
    }
  } catch (error) {
    console.error("Error fetching notifications state:", error);
    notificationsEnabled = true;
  }

  const lowerLimit = parseFloat(await AsyncStorage.getItem('lowerLimit')) || 0.0;
  const upperLimit = parseFloat(await AsyncStorage.getItem('upperLimit')) || 10.0;
  let upperLimitNotificationSent = JSON.parse(await AsyncStorage.getItem('upperLimitNotificationSent')) || false;
  let lowerLimitNotificationSent = JSON.parse(await AsyncStorage.getItem('lowerLimitNotificationSent')) || false;

  try {
    const currentPrice = await fetchElectricityPrice();
    if (currentPrice === null || isNaN(currentPrice)) {
      console.error("Invalid or missing current price from fetchElectricityPrice.");
      return BackgroundFetch.Result.Failed;
    }

    console.log("Fetched current electricity price (adjusted):", currentPrice);

    if (notificationsEnabled) {
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
    } else {
      console.log("Notifications disabled. Skipping sending alerts.");
    }

    return BackgroundFetch.Result.NewData;
  } catch (error) {
    console.error("Error fetching electricity prices or processing notifications:", error.message);
    return BackgroundFetch.Result.Failed;
  }
});

export async function registerBackgroundTask() {
  const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);

  if (!isTaskRegistered) {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
        minimumInterval: 30,
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log("Background task registered.");
    } catch (error) {
      console.error("Error registering background task:", error.message);
    }
  } else {
    console.log("Background task already registered.");
  }
}
