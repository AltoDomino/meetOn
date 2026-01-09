// hooks/useEndEventListener.ts
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

type EndEventPayload = {
  eventId: string | number;
  // tutaj możesz dopisać inne pola, jeśli backend je wysyła
};

type UseEndEventListenerProps = {
  socket: Socket | null;
  /**
   * ID wydarzenia, dla którego nasłuchujemy zakończenia.
   * Może być string (z route), number albo null/undefined.
   */
  currentEventId?: string | number | null;
  /**
   * Opcjonalny callback wywoływany, gdy event się zakończy.
   */
  onEventEnded?: (payload: EndEventPayload) => void;
};

export function useEndEventListener({
  socket,
  currentEventId,
  onEventEnded,
}: UseEndEventListenerProps) {
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (!socket || currentEventId == null) return;

    const handleEventEnded = (payload: EndEventPayload) => {
      const payloadId = String(payload.eventId);
      const currentIdStr = String(currentEventId);

      if (payloadId === currentIdStr) {
        // 🔥 zakończyło się "nasze" wydarzenie
        setShowRatingModal(true);

        if (onEventEnded) {
          onEventEnded(payload);
        }
      }
    };

    socket.on("event:ended", handleEventEnded);

    return () => {
      socket.off("event:ended", handleEventEnded);
    };
  }, [socket, currentEventId, onEventEnded]);

  return {
    showRatingModal,
    setShowRatingModal,
  };
}
