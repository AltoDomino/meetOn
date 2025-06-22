const fetchPlaces = async (activity: string, lat: number, lng: number) => {
  const apiKey = "AIzaSyBYfWHFf7y7CHtddfWhCQX3u9TqPBbmND8";
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&keyword=${encodeURIComponent(activity)}&key=${apiKey}`;

  console.log("Zapytanie do API:", activity, lat, lng);

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Wyniki z Google:", data.results);

    return data.results.map((place: any) => place.name); 
  } catch (error) {
    console.error("Błąd przy pobieraniu miejsc:", error);
    return [];
  }
};
export default fetchPlaces;
