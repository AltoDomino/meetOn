
import { Alert } from "react-native";

const FormDataSend = async (DataForm: {
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  spots: string;
  activity: string;
  creatorId: number;
  latitude?: number;
  longitude?: number;
}) => {
  try {
    const res = await fetch(
      "https://meeton-backend-ffmo.onrender.com/api/event/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DataForm),
      }
    );
    if (res.status === 201) {
      Alert.alert("Stworzono Wydarzenie");
    } else if (res.status === 403) {
      Alert.alert("Błąd", "Niepoprawne dane");
    }
  } catch (error) {
    Alert.alert("Błąd", "Nie udało się połączyć z serwerem");
  }
  
};

export default FormDataSend;
