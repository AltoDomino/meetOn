export const activityImages: Record<string, any> = {
  "Gry planszowe": require("../../assets/images/gry-planszowe.png"),
  "Escape room": require("../../assets/images/Escape-room.png"),
  "Kręgle": require("../../assets/images/kregle.png"),
  "Laser tag": require("../../assets/images/laser-tag.png"),
  "Karaoke": require("../../assets/images/karaoke.png"),
 "Bilard": require("../../assets/images/bilard.png"),
  "Paintball": require("../../assets/images/Paintball.png"),
  "Rzutki": require("../../assets/images/dart.png"),
  "Siatkówka plażowa": require("../../assets/images/siatkówka-plażowa.png"),
  "Koszykówka": require("../../assets/images/koszykówka.png"),
  "Piłka nożna": require("../../assets/images/piłka-nożna.png"),
  "Tenis ziemny": require("../../assets/images/tenis-ziemny.png"),
  "Tenis stołowy": require("../../assets/images/tenis-stołowy.png"),
  "Badminton": require("../../assets/images/badminton.png"),
  "Jazda na rowerze": require("../../assets/images/jazda-na-rowerze.png"),
"kasyno": require("../../assets/images/kasyno.png"),
"Taniec Towarzyski": require("../../assets/images/taniec-towarzyski.png"),
"Wspinaczka": require("../../assets/images/spinaczka.png"),
"Gokarty": require("../../assets/images/gokarty.png"),
"Stwórz własne": require("../../assets/images/wlasne.png"),

};
export const getDefaultLocation = (activity: string): string | null => {
  const mosirActivities = [
    "Tenis ziemny",
    "Piłka nożna",
    "Koszykówka",
    "Tenis stołowy"
  ];

  return mosirActivities.includes(activity) ? "mosir" : null;
};