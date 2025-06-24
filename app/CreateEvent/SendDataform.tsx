import { Alert } from "react-native";
// import { useAuth } from "@/context/AuthContext"; // jeśli masz

const FormDataSend = async (DataForm: {
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  spots: string;
  activity: string;
  creatorId: number;
}) => {
  try {
    const res = await fetch("http://192.168.1.26:3000/Create-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(DataForm),
    });

    if (res.status === 201) {
      console.log("Dane:", DataForm);
      Alert.alert("Sukces", "Dane wysłane");
    } else if (res.status === 403) {
      Alert.alert("Błąd", "Niepoprawne dane");
    }
  } catch (error) {
    Alert.alert("Błąd", "Nie udało się połączyć z serwerem");
  }
};

export default FormDataSend;
