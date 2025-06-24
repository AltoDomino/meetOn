const fetchNotifications = async (userId: number) => {
  try {
    const res = await fetch(`http://192.168.1.26:3000/api/notifications/${userId}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Błąd pobierania powiadomień:", err);
    return [];
  }
};

export default fetchNotifications