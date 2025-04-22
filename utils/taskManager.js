import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchElectricityPrice } from './fetchSpotPrice';

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND_NOTIFICATION_TASK";

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  console.log("Background task executed.");

  const now = new Date();
  const hours = now.getHours();

  if (hours >= 22 || hours < 6) {
    console.error("Background task execution is disabled between 22:00 and 06:00.");
    return BackgroundFetch.Result.Failed;
  }

  let notificationsEnabled = false;
  try {
    const storedValue = await AsyncStorage.getItem('notificationsEnabled');
    notificationsEnabled = storedValue !== null ? JSON.parse(storedValue) : true;
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
      console.error("Invalid or missing current price.");
      return BackgroundFetch.Result.Failed;
    }

    console.log("Fetched electricity price:", currentPrice);

    if (notificationsEnabled) {
      if (currentPrice > upperLimit && !upperLimitNotificationSent) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Sähkö on nyt kallista.",
            body: `Viimeisin hinta: ${currentPrice.toFixed(2)} snt/kWh. Yläraja: ${upperLimit.toFixed(2)} snt/kWh.`,
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
            body: `Viimeisin hinta: ${currentPrice.toFixed(2)} snt/kWh. Alaraja: ${lowerLimit.toFixed(2)} snt/kWh.`,
          },
          trigger: null,
        });
        console.log("Notification sent: Price dropped below lower limit");
        await AsyncStorage.setItem('lowerLimitNotificationSent', JSON.stringify(true));
      } else if (currentPrice >= lowerLimit) {
        await AsyncStorage.setItem('lowerLimitNotificationSent', JSON.stringify(false));
      }
    } else {
      console.log("Notifications disabled. Skipping alerts.");
    }

    console.log("Returning BackgroundFetch.Result.NewData:", BackgroundFetch.Result.NewData);
    return BackgroundFetch.Result.NewData || "NewData";
  } catch (error) {
    console.error("Error in background task:", error.message);
    return BackgroundFetch.Result.Failed || "Failed";
  }
});

export async function registerBackgroundTask() {
  const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
  console.log("Is background task registered?", isTaskRegistered);

  if (!isTaskRegistered) {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
        minimumInterval: 15,
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
