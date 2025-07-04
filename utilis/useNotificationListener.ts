import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

// Konfiguracja zachowania powiadomień (ważne na iOS)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const setupNotificationListener = () => {
  const router = useRouter();
  // Nasłuchiwanie na odebrane powiadomienie
  const subscriptionReceived = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("📩 Odebrano powiadomienie:", notification);
    }
  );

  // Nasłuchiwanie na kliknięcie w powiadomienie
  const subscriptionResponse =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      console.log("👆 Kliknięto powiadomienie z danymi:", data);

      if (data.eventId && data.location && data.startDate && data.endDate) {
        router.push({
          pathname: "/screens/LocalEventRoom",
          params: {
            eventId: String(data.eventId),
            location: String(data.location),
            startDate: String(data.startDate),
            endDate: String(data.endDate),
          },
        });
      }
    });

  // Funkcja czyszcząca listener
  return () => {
    subscriptionReceived.remove();
    subscriptionResponse.remove();
  };
};
