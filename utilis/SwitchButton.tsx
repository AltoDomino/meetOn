import { useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { LinkProps } from "expo-router";

type Props = {
  to: LinkProps["href"];
  label?: string;
};

export default function SwitchButton({ to, label = "Zmień widok" }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.replace(to)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eee",
        padding: 10,
        borderRadius: 12,
        alignSelf: "center",
        marginVertical: 10,
      }}
    >
      <Ionicons name="swap-vertical-outline" size={24} color="#333" />
      <Text style={{ marginLeft: 8, fontSize: 16 }}>{label}</Text>
    </TouchableOpacity>
  );
}
