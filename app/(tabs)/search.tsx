import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TextInput, ActivityIndicator, Platform } from 'react-native';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { router } from 'expo-router';
import IdiomCard from '@/components/IdiomCard';
import { useSupabaseIdiomSearch, useSupabaseIdioms } from '@/hooks/useSupabaseApi';
import { TouchableOpacity } from 'react-native';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<any>(null);

  // 防抖处理搜索查询
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  // 搜索hook现在已经优化，会自动处理空查询
  const { data: searchResults, loading: searchLoading } = useSupabaseIdiomSearch(
    debouncedQuery, 
    undefined // 搜索所有字段
  );

  // 显示搜索结果
  const displayIdioms = useMemo(() => searchResults || [], [searchResults]);
  const isLoading = searchLoading;

  const handleIdiomPress = useCallback((idiomId: string) => {
    router.push(`/idiom/${idiomId}`);
  }, []);

  const toggleFavorite = useCallback((idiomId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(idiomId)) {
        newFavorites.delete(idiomId);
      } else {
        newFavorites.add(idiomId);
      }
      return newFavorites;
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const renderSearchHeader = useMemo(() => (
    <View style={styles.header}>
      <Text style={styles.title}>搜索成语</Text>
      <View style={styles.searchContainer}>
        <SearchIcon size={20} color="#666666" strokeWidth={2} />
        <TextInput
          ref={searchInputRef}
          style={[
            styles.searchInput,
            Platform.OS === 'web' && styles.webSearchInput
          ]}
          placeholder="输入成语、拼音或含义"
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X size={18} color="#666666" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), [searchQuery, clearSearch]);

  const renderResultsHeader = useMemo(() => {
    if (!debouncedQuery.trim() && !isLoading) return null;
    
    return (
      <View style={styles.resultsHeader}>
        {debouncedQuery.trim() && !isLoading && displayIdioms && (
          <Text style={styles.resultCount}>
            {displayIdioms.length > 0 
              ? `找到 ${displayIdioms.length} 个相关成语 · 按相关性排序`
              : '未找到相关成语'
            }
          </Text>
        )}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FF6B6B" />
            <Text style={styles.loadingText}>搜索中...</Text>
          </View>
        )}
      </View>
    );
  }, [debouncedQuery, displayIdioms, isLoading]);

  const renderEmptyState = useCallback(() => {
    // 默认状态：没有搜索查询
    if (!debouncedQuery.trim()) {
      return (
        <View style={styles.emptyState}>
          <SearchIcon size={48} color="#CCCCCC" strokeWidth={1.5} />
          <Text style={styles.emptyText}>请输入成语、拼音或含义开始搜索</Text>
          <Text style={styles.emptySubText}>支持搜索 30,000+ 条成语数据</Text>
        </View>
      );
    }
    
    // 有查询但没有结果，且不在加载中
    if (debouncedQuery.trim() && !isLoading && displayIdioms && displayIdioms.length === 0) {
      return (
        <View style={styles.emptyState}>
          <SearchIcon size={48} color="#CCCCCC" strokeWidth={1.5} />
          <Text style={styles.emptyText}>试试其他关键词</Text>
          <Text style={styles.emptySubText}>支持成语、拼音、含义、出处搜索</Text>
        </View>
      );
    }
    
    return null;
  }, [debouncedQuery, isLoading, displayIdioms]);

  const renderIdiom = useCallback(({ item }: { item: any }) => (
    <IdiomCard
      idiom={item}
      onPress={() => handleIdiomPress(item.id)}
      onFavorite={() => toggleFavorite(item.id)}
      isFavorited={favorites.has(item.id)}
    />
  ), [handleIdiomPress, toggleFavorite, favorites]);

  const keyExtractor = useCallback((item: any) => item.id, []);
  
  const listEmptyComponent = useMemo(() => {
    return !isLoading ? renderEmptyState : null;
  }, [isLoading, renderEmptyState]);

  return (
    <SafeAreaView style={styles.container}>
      {renderSearchHeader}
      <FlatList
        data={displayIdioms}
        renderItem={renderIdiom}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderResultsHeader}
        ListEmptyComponent={listEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          (!displayIdioms || displayIdioms.length === 0) && { flex: 1 }
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
  resultsHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
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
    // 确保在所有平台上都能正常工作
    minHeight: 20,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  webSearchInput: {
    // Web 平台特定样式
    outlineStyle: 'none' as any,
    borderWidth: 0,
    backgroundColor: 'transparent',
    // 确保输入框在 Web 上能正常工作
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1A1A1A',
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
  emptySubText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
});