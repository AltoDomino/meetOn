// import React, { useState } from "react";
// import {
//   FlatList,
//   Image,
//   Modal,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// export interface Participant {
//   id: number;
//   userName: string;
//   avatar: string | null;
//   description: string;
//   age: number;
//   isCreator?: boolean;
// }

// interface EventDetailsModalProps {
//   visible: boolean;
//   onClose: () => void;
//   participants: Participant[];
// }

// const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
//   visible,
//   onClose,
// }) => {
//     const [participants, setParticipants] = useState<any[]>([]);
//       const [isExpanded, setIsExpanded] = useState(false);
//   const fetchParticipantDetails = async (participantId: number) => {
//     try {
//       const res = await fetch(
//         `https://meeton-backend-ffmo.onrender.com/api/user/profile/${participantId}`
//       );
//       const data = await res.json();
//       console.log(data)
//     } catch (err) {
//       console.error("Błąd pobierania danych uczestnika:", err);
//     }
//   };

//   const creator = participants.find((p) => p.isCreator);
//   const others = participants.filter((p) => !p.isCreator);

//   return (
//     <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
//       <View style={styles.overlay}>
//         <View style={styles.modalContent}>
//           {/* Twórca wydarzenia */}
//           <Text style={styles.sectionHeader}>Twórca wydarzenia</Text>
//           {creator && (
//             <View style={styles.creatorContainer}>
//               <Image
//                 source={{ uri: creator.avatar || "https://via.placeholder.com/100" }}
//                 style={styles.creatorAvatar}
//               />
//               <View style={styles.creatorInfo}>
//                 <Text style={styles.creatorName}>{creator.userName}</Text>
//                 <Text style={styles.age}>Wiek: {creator.age}</Text>
//                 <Text style={styles.description}>
//                   {creator.description || "Brak opisu"}
//                 </Text>
//               </View>
//             </View>
//           // )}

//           {/* Lista uczestników */}
//           <Text style={styles.sectionHeader}>Lista uczestników</Text>
//           <View style={styles.participantsContainer}>
//             <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
//               <Text style={styles.participantsTitle}>
//                 {isExpanded ? "Ukryj uczestników ▲" : "Pokaż uczestników ▼"}
//               </Text>
//             </TouchableOpacity>

//             {isExpanded && (
//               <FlatList
//                 data={participants}
//                 keyExtractor={(item) => item.id.toString()}
//                 ListEmptyComponent={
//                   <Text style={styles.emptyText}>Brak uczestników</Text>
//                 }
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     onPress={() => fetchParticipantDetails(item.id)}
//                     style={styles.participantCard}
//                   >
//                     <View style={styles.avatar}>
//                       {item.avatar && item.avatar.trim() !== "" ? (
//                         <Image
//                           source={{ uri: item.avatar }}
//                           style={{ width: 40, height: 40, borderRadius: 20 }}
//                         />
//                       ) : (
//                         <Text style={styles.avatarText}>
//                           {item.userName?.charAt(0).toUpperCase()}
//                         </Text>
//                       )}
//                     </View>
//                     <Text style={styles.userName}>{item.userName}</Text>
//                   </TouchableOpacity>
//                 )}
//               />
//             )}
//           </View>

//           <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//             <Text style={styles.closeButtonText}>Zamknij</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default EventDetailsModal;

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     width: "90%",
//     maxHeight: "90%",
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   creatorContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
//     gap: 12,
//   },
//   creatorAvatar: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "#ccc",
//   },
//   creatorInfo: {
//     flex: 1,
//   },
//   creatorName: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   participantCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//     gap: 12,
//   },
//   participantAvatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#ccc",
//   },
//   participantInfo: {
//     flex: 1,
//   },
//   participantName: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   description: {
//     fontSize: 14,
//     color: "#666",
//   },
//   age: {
//     fontSize: 14,
//     color: "#555",
//     marginLeft: 8,
//   },
//   closeButton: {
//     marginTop: 20,
//     backgroundColor: "#00A9F4",
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   closeButtonText: {
//     color: "white",
//     fontWeight: "bold",
//   },
//   emptyText: {
//     textAlign: "center",
//     color: "#888",
//     marginTop: 8,
//   },
// });
