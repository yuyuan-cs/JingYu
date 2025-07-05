import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSupabaseIdioms, useSupabaseIdiomSearch, useSupabaseFavoriteActions } from '../hooks/useSupabaseApi';

/**
 * Supabase API 使用示例组件
 * 演示如何在 React Native 应用中使用 Supabase API
 */
export function SupabaseExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // 使用 Supabase Hook 获取成语列表
  const { data: idioms, loading, error, loadMore, pagination } = useSupabaseIdioms({
    search: undefined
  });

  // 使用搜索 Hook
  const { data: searchResults, loading: searchLoading, error: searchError } = useSupabaseIdiomSearch(
    searchQuery,
    'word'
  );

  // 收藏功能
  const { addFavorite, removeFavorite, checkFavorite, loading: favoriteLoading } = useSupabaseFavoriteActions();

  // 处理搜索
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  // 处理收藏
  const handleFavorite = async (idiomId: string) => {
    const userId = 'demo-user-id'; // 实际应用中应该从用户状态获取
    try {
      const isFavorite = await checkFavorite(userId, idiomId);
      if (isFavorite) {
        await removeFavorite(userId, idiomId);
        Alert.alert('成功', '已取消收藏');
      } else {
        await addFavorite(userId, idiomId);
        Alert.alert('成功', '已添加收藏');
      }
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  // 渲染成语卡片
  const renderIdiomCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.idiom}>{item.idiom}</Text>
      <Text style={styles.pinyin}>{item.pinyin}</Text>
      <Text style={styles.meaning}>{item.meaning}</Text>
      <Text style={styles.origin}>{item.origin}</Text>
      
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => handleFavorite(item.id)}
        disabled={favoriteLoading}
      >
        <Text style={styles.favoriteText}>
          {favoriteLoading ? '处理中...' : '收藏'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // 显示加载状态
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.status}>正在加载成语数据...</Text>
      </View>
    );
  }

  // 显示错误状态
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>加载失败: {error}</Text>
      </View>
    );
  }

  const displayData = isSearching ? searchResults : idioms;
  const displayLoading = isSearching ? searchLoading : loading;
  const displayError = isSearching ? searchError : error;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase API 示例</Text>
      
      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索成语..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>搜索</Text>
        </TouchableOpacity>
      </View>

      {/* 状态信息 */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isSearching ? '搜索结果' : '成语列表'}
          {pagination && ` (${pagination.total} 条)`}
        </Text>
      </View>

      {/* 成语列表 */}
      <FlatList
        data={displayData}
        renderItem={renderIdiomCard}
        keyExtractor={(item) => item.id}
        onEndReached={!isSearching ? loadMore : undefined}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {displayLoading ? '加载中...' : '没有找到成语'}
          </Text>
        }
        ListFooterComponent={
          pagination?.hasMore && !isSearching ? (
            <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
              <Text style={styles.loadMoreText}>加载更多</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* 操作按钮 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setSearchQuery('');
            setIsSearching(false);
          }}
        >
          <Text style={styles.buttonText}>清除搜索</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  idiom: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pinyin: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  meaning: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  origin: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  favoriteButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  favoriteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FF6B6B',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
  loadMoreButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  loadMoreText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonContainer: {
    paddingTop: 16,
  },
  button: {
    backgroundColor: '#6C757D',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default SupabaseExample; 