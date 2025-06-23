  const apiKey = "AIzaSyBYfWHFf7y7CHtddfWhCQX3u9TqPBbmND8";

  export type Place = {
  placeId: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  mapsUrl?: string;
};

export default async function fetchPlaces(
  keyword: string,
  lat: number,
  lng: number
): Promise<Place[]> {
  try {
    // 🔍 1. Wyszukiwanie miejsc
    const searchResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=30000&keyword=${encodeURIComponent(
        keyword
      )}&key=${apiKey}`
    );

    const searchData = await searchResponse.json();

    if (!searchData.results) return [];

    // 📋 2. Pobieranie szczegółów dla każdego miejsca
    const detailedPlaces: Place[] = await Promise.all(
      searchData.results.slice(0, 6).map(async (place: any) => {
        const placeId = place.place_id;
        const detailRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,url&key=${apiKey}`
        );
        const detailData = await detailRes.json();
        const result = detailData.result;

        return {
          placeId,
          name: result.name,
          address: result.formatted_address,
          phone: result.formatted_phone_number,
          website: result.website,
          mapsUrl: result.url,
        };
      })
    );

    return detailedPlaces;
  } catch (error) {
    console.error("Błąd w fetchPlaces:", error);
    return [];
  }
}