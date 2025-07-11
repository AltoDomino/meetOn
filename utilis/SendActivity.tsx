type Props = {
  userId: number;
  activities: string[];
};

const ActivityDataSend = async ({ userId, activities }: Props) => {
  const response = await fetch(
    `https://meeton-backend-ffmo.onrender.com/api/interests/${userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ interests: activities }),
    }
  );

  if (!response.ok) {
    throw new Error("Błąd podczas zapisu aktywności");
  }

  return await response.json();
};

export default ActivityDataSend;
