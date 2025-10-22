export const activityImages: Record<string, any> = {
  "PLANSZÓWKI": require("../../assets/images/gry-planszowe.png"),
  "ESCAPE ROOM": require("../../assets/images/Escape-room.png"),
  "KRĘGLE": require("../../assets/images/kregle.png"),
  "LASER TAG": require("../../assets/images/laser-tag.png"),
  "KARAOKE": require("../../assets/images/karaoke.png"),
 "BILARD": require("../../assets/images/bilard.png"),
  "PAINTBALL": require("../../assets/images/Paintball.png"),
  "DART": require("../../assets/images/dart.png"),
  "PLAŻÓWKA": require("../../assets/images/siatkówka-plażowa.png"),
  "KOSZYKÓWKA": require("../../assets/images/koszykówka.png"),
  "PIŁKA NOŻNA": require("../../assets/images/piłka-nożna.png"),
  "TENIS ZIEMNY": require("../../assets/images/tenis-ziemny.png"),
  "TENIS STOŁOWY": require("../../assets/images/tenis-stołowy.png"),
  "BADMINTON": require("../../assets/images/badminton.png"),
  "ROWER": require("../../assets/images/jazda-na-rowerze.png"),
"KASYNO": require("../../assets/images/kasyno.png"),
"TANIEC": require("../../assets/images/taniec-towarzyski.png"),
"WSPINACZKA": require("../../assets/images/spinaczka.png"),
"GOKARTY": require("../../assets/images/gokarty.png"),
"STRZELNICA": require("../../assets/images/strzelnica.png"),
"SQUASH": require("../../assets/images/squash.png"),
"PADEL": require("../../assets/images/padel.png"),
"POKER": require("../../assets/images/poker.png"),
"KONCERT": require("../../assets/images/wyjście-na-koncert.png"),
"GRZYBY": require("../../assets/images/grzyby.png"),
"RYBY": require("../../assets/images/ryby.png"),
"STWÓRZ WŁASNE": require("../../assets/images/wlasne.png"),

};
export const getDefaultLocation = (activity: string): string | null => {
  const mosirActivities = [
    "Tenis ziemny",
    "Piłka nożna",
    "Koszykówka",
    "Tenis stołowy",
  ];

  return mosirActivities.includes(activity) ? "mosir" : null;
};