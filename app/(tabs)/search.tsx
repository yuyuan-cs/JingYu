import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TextInput } from 'react-native';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { router } from 'expo-router';
import IdiomCard from '@/components/IdiomCard';
import { idioms } from '@/data/idioms';
import { TouchableOpacity } from 'react-native';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filteredIdioms = useMemo(() => {
    if (!searchQuery.trim()) return idioms;
    
    const query = searchQuery.toLowerCase().trim();
    return idioms.filter(idiom => 
      idiom.idiom.toLowerCase().includes(query) ||
      idiom.pinyin.toLowerCase().includes(query) ||
      idiom.meaning.toLowerCase().includes(query) ||
      idiom.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

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

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>搜索成语</Text>
      <View style={styles.searchContainer}>
        <SearchIcon size={20} color="#666666" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="输入成语、拼音或含义"
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X size={18} color="#666666" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
      {searchQuery.trim() && (
        <Text style={styles.resultCount}>
          找到 {filteredIdioms.length} 个相关成语
        </Text>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <SearchIcon size={48} color="#CCCCCC" strokeWidth={1.5} />
      <Text style={styles.emptyText}>
        {searchQuery.trim() ? '未找到相关成语' : '输入关键词开始搜索'}
      </Text>
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
        data={filteredIdioms}
        renderItem={renderIdiom}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          filteredIdioms.length === 0 && { flex: 1 }
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
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'NotoSerifSC-Medium',
    fontSize: 28,
    color: '#1A1A1A',
    letterSpacing: 2,
    marginBottom: 24,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#1A1A1A',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 12,
    marginRight: 8,
  },
  clearButton: {
    padding: 4,
  },
  resultCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 16,
  },
});