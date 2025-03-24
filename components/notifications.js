import * as Notifications from 'expo-notifications';

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


export async function triggerNotification() {
    console.log("triggerNotification function called");

    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Test Notification",
                body: "This is a test notification triggered from the button.",
                sound: true,
            },
            trigger: { seconds: 2 },
        });
    } catch (error) {
        console.error("Error scheduling notification:", error);
    }
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});
