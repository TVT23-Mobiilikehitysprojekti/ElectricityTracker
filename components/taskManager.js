import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchElectricityPrice } from './fetchElectricityPrice';

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND_NOTIFICATION_TASK";

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  console.log("Background task executed.");
  
  try {
    const notificationsEnabled = JSON.parse(await AsyncStorage.getItem('notificationsEnabled')) || false;
    const lowerLimit = parseFloat(await AsyncStorage.getItem('lowerLimit')) || 0.0;
    const upperLimit = parseFloat(await AsyncStorage.getItem('upperLimit')) || 10.0;

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

    if (currentPrice < lowerLimit || currentPrice > upperLimit) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Electricity Price Alert",
          body: `Current price: ${currentPrice} c/kWh. Limit: ${lowerLimit}-${upperLimit} c/kWh.`,
        },
        trigger: null,
      });
      console.log("Notification sent: Electricity price exceeded limits");
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
