import { Alert } from "react-native";

const ActivityDataSend = async (data: {
  userId: number;
  activities: string[];
}) => {
  try {
    const res = await fetch("http://192.168.1.26:3000/api/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.status === 200) {
      console.log("Dane wysłane:", data);
      Alert.alert("Sukces", "Zainteresowania zostały zapisane");
    } else {
      const errorData = await res.json();
      Alert.alert("Błąd", errorData.error || "Niepoprawne dane");
    }
  } catch (error) {
    Alert.alert("Błąd", "Nie udało się połączyć z serwerem");
  }
};

export default ActivityDataSend;
