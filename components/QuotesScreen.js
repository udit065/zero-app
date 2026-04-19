import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const quotes = [
  {
    text: "KARM KRO DHARM KE SATH, PHAL KI CHINTA MT KRO",
    type: "primary",
  },
  {
    text: "Repair, don’t repeat.",
    type: "secondary",
  },
  {
    text: "It is OKAY.",
    type: "secondary",
  },
  {
    text: "Fix, don’t fixate.",
    type: "primary",
  },
];

export default function QuotesScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Quotes</Text>

      {quotes.map((quote, index) => (
        <View
          key={index}
          style={[
            styles.card,
            quote.type === "primary" && styles.primaryCard
          ]}
        >
          <Text
            style={[
              styles.quoteText,
              quote.type === "primary" && styles.primaryText
            ]}
          >
            “{quote.text}”
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    padding: 16,
  },

  heading: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },

  // 🔥 Card Style
  card: {
    backgroundColor: '#161616',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#333',
  },

  primaryCard: {
    borderLeftColor: '#4caf50',
  },

  // ✍️ Text
  quoteText: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 22,
  },

  primaryText: {
    color: '#fff',
    fontWeight: '600',
  },
});