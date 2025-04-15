import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchElectricityPrice } from './fetchSpotPrice';

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND_NOTIFICATION_TASK";

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  console.log("Background task executed.");

  try {
    const notificationsEnabled = JSON.parse(await AsyncStorage.getItem('notificationsEnabled')) || false;
    const lowerLimit = parseFloat(await AsyncStorage.getItem('lowerLimit')) || 0.0;
    const upperLimit = parseFloat(await AsyncStorage.getItem('upperLimit')) || 10.0;
    let upperLimitNotificationSent = JSON.parse(await AsyncStorage.getItem('upperLimitNotificationSent')) || false;
    let lowerLimitNotificationSent = JSON.parse(await AsyncStorage.getItem('lowerLimitNotificationSent')) || false;

    if (!notificationsEnabled) {
      console.log("Notifications are disabled. Skipping notification.");
      return BackgroundFetch.Result.NoData;
    }

    const pricesData = await fetchElectricityPrice();
    if (!pricesData || !pricesData.currentPrice) {
      console.error("Unable to fetch electricity prices or invalid data format.");
      return BackgroundFetch.Result.Failed;
    }

    const currentPrice = pricesData.currentPrice;

    if (currentPrice > upperLimit && !upperLimitNotificationSent) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Sähkö on nyt kallista.",
          body: `Viimeisin hinta: ${currentPrice} c/kWh. Asettamasi yläraja: ${upperLimit} c/kWh.`,
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
          body: `Viimeisin hinta: ${currentPrice} c/kWh. Asettamasi alaraja: ${lowerLimit} c/kWh.`,
        },
        trigger: null,
      });
      console.log("Notification sent: Price dropped below lower limit");
      await AsyncStorage.setItem('lowerLimitNotificationSent', JSON.stringify(true));
    } else if (currentPrice >= lowerLimit) {
      await AsyncStorage.setItem('lowerLimitNotificationSent', JSON.stringify(false));
    }

    return BackgroundFetch.Result.NewData;
  } catch (error) {
    console.error("Error in background task:", error.message);
    return BackgroundFetch.Result.Failed;
  }
});


export async function registerBackgroundTask() {
  const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);

  if (!isTaskRegistered) {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
      minimumInterval: 30,
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log("Background task registered.");
  } else {
    console.log("Background task already registered.");
  }
}
