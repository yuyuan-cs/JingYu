import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Heart, LogIn, Filter, Tag } from 'lucide-react-native';
import { router } from 'expo-router';
import IdiomCard from '@/components/IdiomCard';
import { useAuthContext } from '@/hooks/useAuth';
import { useFavorites, FavoriteWithIdiom } from '@/hooks/useFavorites';
import { useQuickLearningRecord } from '@/hooks/useLearningRecords';

interface FilterState {
  tags: string[];
  priority: 'all' | 'low' | 'medium' | 'high';
}

export default function FavoritesScreen() {
  const { user } = useAuthContext();
  const { favorites, loading, error, getFavorites, removeFavorite, getAllTags } = useFavorites();
  const { recordView } = useQuickLearningRecord();
  
  const [refreshing, setRefreshing] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterState>({
    tags: [],
    priority: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  // 加载标签列表
  useEffect(() => {
    if (user) {
      getAllTags().then(setAvailableTags);
    }
  }, [user, getAllTags]);

  // 刷新收藏列表
  const handleRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      await getFavorites(50, 0, filter.tags.length > 0 ? filter.tags : undefined);
      const tags = await getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('刷新收藏列表失败:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 过滤收藏列表
  const filteredFavorites = favorites.filter(favorite => {
    // 优先级过滤
    if (filter.priority !== 'all' && favorite.priority !== filter.priority) {
      return false;
    }
    
    // 标签过滤
    if (filter.tags.length > 0) {
      return filter.tags.some(tag => favorite.tags.includes(tag));
    }
    
    return true;
  });

  const handleIdiomPress = async (favorite: FavoriteWithIdiom) => {
    // 记录查看行为
    await recordView(favorite.idiom_id, 'favorite');
    router.push(`/idiom/${favorite.idiom.derivation}`);
  };

  const handleRemoveFavorite = async (idiomId: string) => {
    Alert.alert(
      '确认取消收藏',
      '您确定要取消收藏这个成语吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFavorite(idiomId);
              Alert.alert('成功', '已取消收藏');
            } catch (error) {
              Alert.alert('错误', '取消收藏失败');
            }
          },
        },
      ]
    );
  };

  const toggleTagFilter = (tag: string) => {
    setFilter(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const clearFilters = () => {
    setFilter({
      tags: [],
      priority: 'all',
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>我的收藏</Text>
      <Text style={styles.subtitle}>珍藏的智慧结晶</Text>
      
      {user && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            共收藏 {favorites.length} 个成语
          </Text>
          {filteredFavorites.length !== favorites.length && (
            <Text style={styles.filterStatsText}>
              筛选后显示 {filteredFavorites.length} 个
            </Text>
          )}
        </View>
      )}

      {user && availableTags.length > 0 && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} color="#3498db" />
            <Text style={styles.filterButtonText}>筛选</Text>
          </TouchableOpacity>
          
          {(filter.tags.length > 0 || filter.priority !== 'all') && (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearFilterText}>清除筛选</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showFilters && user && (
        <View style={styles.filtersPanel}>
          {/* 标签筛选 */}
          {availableTags.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>标签</Text>
              <View style={styles.tagsContainer}>
                {availableTags.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagButton,
                      filter.tags.includes(tag) && styles.tagButtonActive,
                    ]}
                    onPress={() => toggleTagFilter(tag)}
                  >
                    <Tag size={12} color={filter.tags.includes(tag) ? '#fff' : '#666'} />
                    <Text
                      style={[
                        styles.tagButtonText,
                        filter.tags.includes(tag) && styles.tagButtonTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 优先级筛选 */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>优先级</Text>
            <View style={styles.priorityContainer}>
              {(['all', 'high', 'medium', 'low'] as const).map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    filter.priority === priority && styles.priorityButtonActive,
                  ]}
                  onPress={() => setFilter(prev => ({ ...prev, priority }))}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      filter.priority === priority && styles.priorityButtonTextActive,
                    ]}
                  >
                    {priority === 'all' ? '全部' : 
                     priority === 'high' ? '高' :
                     priority === 'medium' ? '中' : '低'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderAuthPrompt = () => (
    <View style={styles.authPrompt}>
      <LogIn size={48} color="#3498db" />
      <Text style={styles.authPromptTitle}>登录后查看收藏</Text>
      <Text style={styles.authPromptSubtitle}>
        登录账户，保存您喜爱的成语
      </Text>
      <TouchableOpacity
        style={styles.authButton}
        onPress={() => router.push('/auth')}
      >
        <Text style={styles.authButtonText}>立即登录</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Heart size={48} color="#CCCCCC" strokeWidth={1.5} />
      <Text style={styles.emptyText}>
        {filter.tags.length > 0 || filter.priority !== 'all' 
          ? '没有符合筛选条件的收藏' 
          : '还没有收藏任何成语'
        }
      </Text>
      <Text style={styles.emptySubtext}>
        {filter.tags.length > 0 || filter.priority !== 'all'
          ? '尝试调整筛选条件'
          : '浏览成语时点击心形图标来收藏'
        }
      </Text>
    </View>
  );

  const renderFavorite = ({ item }: { item: FavoriteWithIdiom }) => (
    <View style={styles.favoriteItem}>
      <IdiomCard
        idiom={{
          id: item.idiom.id,
          idiom: item.idiom.idiom,
          pinyin: item.idiom.pinyin,
          meaning: item.idiom.meaning,
          origin: item.idiom.origin,
          example: item.idiom.example,
          abbreviation: item.idiom.abbreviation || '',
          pinyin_r: item.idiom.pinyin_r || '',
          first: item.idiom.first || '',
          last: item.idiom.last || '',
        }}
        onPress={() => handleIdiomPress(item)}
        onFavorite={() => handleRemoveFavorite(item.idiom_id)}
        isFavorited={true}
      />
      
      {/* 收藏信息 */}
      <View style={styles.favoriteInfo}>
        <View style={styles.favoriteMetadata}>
          {item.tags.length > 0 && (
            <View style={styles.favoriteTagsContainer}>
              {item.tags.map(tag => (
                <View key={tag} style={styles.favoriteTag}>
                  <Text style={styles.favoriteTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.favoritePriority}>
            <Text style={[
              styles.favoritePriorityText,
              item.priority === 'high' && styles.priorityHigh,
              item.priority === 'medium' && styles.priorityMedium,
              item.priority === 'low' && styles.priorityLow,
            ]}>
              {item.priority === 'high' ? '高优先级' :
               item.priority === 'medium' ? '中优先级' : '低优先级'}
            </Text>
          </View>
        </View>

        {item.notes && (
          <Text style={styles.favoriteNotes}>{item.notes}</Text>
        )}
        
        <Text style={styles.favoriteDate}>
          收藏于 {new Date(item.created_at).toLocaleDateString('zh-CN')}
        </Text>
      </View>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {renderHeader()}
          {renderAuthPrompt()}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredFavorites}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3498db']}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          filteredFavorites.length === 0 && { flex: 1 }
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
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 24,
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
    marginBottom: 16,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  filterStatsText: {
    fontSize: 12,
    color: '#3498db',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    marginRight: 8,
  },
  filterButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearFilterText: {
    fontSize: 14,
    color: '#e74c3c',
  },
  filtersPanel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginHorizontal: -4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  tagButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  tagButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  tagButtonTextActive: {
    color: '#fff',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  priorityButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  priorityButtonTextActive: {
    color: '#fff',
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  authPromptTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  authPromptSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
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
  favoriteItem: {
    marginBottom: 16,
  },
  favoriteInfo: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  favoriteMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoriteTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 8,
  },
  favoriteTag: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  favoriteTagText: {
    fontSize: 10,
    color: '#3498db',
    fontWeight: '500',
  },
  favoritePriority: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  favoritePriorityText: {
    fontSize: 10,
    fontWeight: '500',
  },
  priorityHigh: {
    color: '#e74c3c',
  },
  priorityMedium: {
    color: '#f39c12',
  },
  priorityLow: {
    color: '#27ae60',
  },
  favoriteNotes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  favoriteDate: {
    fontSize: 10,
    color: '#999',
  },
});