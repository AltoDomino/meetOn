const fetchPlaces = async (activity: string, lat: number, lng: number) => {
  const apiKey = "AIzaSyBYfWHFf7y7CHtddfWhCQX3u9TqPBbmND8";
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&keyword=${encodeURIComponent(
    activity
  )}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log(data.results);
    return data.results;
  } catch (error) {
    console.error("Błąd przy pobieraniu miejsc:", error);
  }
};
export default fetchPlaces;
