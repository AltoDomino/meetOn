import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    backgroundColor: '#F9F9FF',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E2B5F',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 20,
  },
  cta: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F3C8F',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#7B5AFF', 
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});