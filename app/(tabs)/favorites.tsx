import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Heart } from 'lucide-react-native';
import { router } from 'expo-router';
import IdiomCard from '@/components/IdiomCard';
import { idioms } from '@/data/idioms';

export default function FavoritesScreen() {
  // For demo purposes, we'll simulate some favorited idioms
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['1', '3']));

  const favoriteIdioms = idioms.filter(idiom => favorites.has(idiom.id));

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
      <Text style={styles.title}>我的收藏</Text>
      <Text style={styles.subtitle}>珍藏的智慧结晶</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Heart size={48} color="#CCCCCC" strokeWidth={1.5} />
      <Text style={styles.emptyText}>还没有收藏任何成语</Text>
      <Text style={styles.emptySubtext}>点击成语卡片上的心形图标来收藏</Text>
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
        data={favoriteIdioms}
        renderItem={renderIdiom}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          favoriteIdioms.length === 0 && { flex: 1 }
        ]}
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
  title: {
    fontFamily: 'NotoSerifSC-Medium',
    fontSize: 32,
    color: '#1A1A1A',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666666',
    letterSpacing: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#999999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});