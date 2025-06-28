import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import styles from "../styles/Registration.styles";

interface FormData {
  email: string;
  password: string;
  userName: string;
}

const Registration = () => {
  const handleBack = () => router.push("/");
  const { control, handleSubmit } = useForm<FormData>();

  const onSubmit = async (dataReg: FormData) => {
    try {
      const res = await fetch("http://192.168.1.26:3000/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataReg),
      });
      console.log("Dane:", dataReg);
      if (res.status === 201) {
        Alert.alert("Sukces", "Dane wysłane");
      } else if (res.status === 403) {
        Alert.alert("Błąd", "Niepoprawne dane");
      }
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się połączyć z serwerem");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nazwa użytkownika:</Text>
      <Controller
        control={control}
        name="userName"
        rules={{ required: "Hasło jest wymagane" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Nazwa użytkownika"
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
          />
        )}
      />
      <Text style={styles.label}>Email:</Text>
      <Controller
        control={control}
        name="email"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <Text style={styles.label}>Hasło:</Text>
      <Controller
        control={control}
        name="password"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Hasło"
            secureTextEntry
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>ZAREJESTRUJ</Text>
      </TouchableOpacity>

      <View style={styles.link}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.linkText}>← Wróć do logowania</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default Registration;
