type Props = {
  userId: number;
  activities: string[];
};

const ActivityDataSend = async ({ userId, activities }: Props) => {
  const response = await fetch(`http://192.168.1.26:3000/api/interests/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ interests: activities }), 
  });

  if (!response.ok) {
    throw new Error("Błąd podczas zapisu aktywności");
  }

  return await response.json();
};

export default ActivityDataSend;
