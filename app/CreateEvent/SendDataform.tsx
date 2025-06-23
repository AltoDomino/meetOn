import { Alert } from "react-native";
const FormDataSend = async (DataForm: {
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  spots: string;

}) => {
  try {
    const res = await fetch("http://192.168.1.26:3000/api/Create-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(DataForm),
    });
    console.log("Dane:", DataForm);
    if (res.status === 201) {
      Alert.alert("Sukces", "Dane wysłane");
    } else if (res.status === 403) {
      Alert.alert("Błąd", "Niepoprawne dane");
    }
  } catch (error) {
    Alert.alert("Błąd", "Nie udało się połączyć z serwerem");
  }
};

export default FormDataSend;
