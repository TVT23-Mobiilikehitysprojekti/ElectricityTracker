import * as Notifications from 'expo-notifications';

export async function registerForNotificationsAsync() {
  console.log("Requesting notification permissions...");

  const { status } = await Notifications.requestPermissionsAsync();
  console.log(`Notification permissions status: ${status}`);

  if (status === 'granted') {
    console.log("Permissions granted.");
  } else {
    console.log("Permissions not granted.");
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
