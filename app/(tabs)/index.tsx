import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import IdiomCard from '@/components/IdiomCard';
import { idioms } from '@/data/idioms';

export default function HomeScreen() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleIdiomPress = (idiomId: string) => {
    router.push(`/idiom/${idiomId}`);
  };

  const toggleFavorite = (idiomId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(idiomId)) {
        newFavorites.delete(idiomId);
      } else {
        newFavorites.add(idiomId);
      }
      return newFavorites;
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.appTitle}>境语</Text>
      <Text style={styles.subtitle}>传承千年智慧，品味成语之美</Text>
    </View>
  );

  const renderIdiom = ({ item }) => (
    <IdiomCard
      idiom={item}
      onPress={() => handleIdiomPress(item.id)}
      onFavorite={() => toggleFavorite(item.id)}
      isFavorited={favorites.has(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={idioms}
        renderItem={renderIdiom}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  appTitle: {
    fontFamily: 'NotoSerifSC-SemiBold',
    fontSize: 42,
    color: '#1A1A1A',
    letterSpacing: 8,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666666',
    letterSpacing: 1,
  },
});