const fetchNotifications = async (userId: number) => {
  try {
    const res = await fetch(
      `https://meeton-backend-ffmo.onrender.com/api/notifications/${userId}`
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Błąd pobierania powiadomień:", err);
    return [];
  }
};

export default fetchNotifications;
