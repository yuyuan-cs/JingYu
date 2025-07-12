import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Shuffle, 
  Target, 
  AlertTriangle,
  BarChart3,
  Settings,
  Play,
  X
} from 'lucide-react-native';

import { useGaoPin, useGaoPinLearning } from '../hooks/useGaoPin';
import { GaoPinCard } from '../components/GaoPinCard';
import { DropdownSelect } from '../components/DropdownSelect';
import { ChengYuGaoPinApiRecord, GaoPinLearningMode } from '../services/supabase';

export default function GaoPinPage() {
  const router = useRouter();
  const {
    gaoPinList,
    loading,
    error,
    refreshing,
    stats,
    categories,
    pagination,
    fetchGaoPinList,
    refreshGaoPinList,
    loadMoreGaoPin,
    searchGaoPin,
    toggleFavorite,
    clearError,
  } = useGaoPin();

  const {
    startLearningSession,
    setLearningMode,
    setCurrentCategory,
    setCurrentDifficulty,
  } = useGaoPinLearning();

  // 本地状态
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'high' | 'medium' | 'low' | null>(null);
  const [selectedMode, setSelectedMode] = useState<GaoPinLearningMode>(GaoPinLearningMode.RANDOM);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [studiedIds, setStudiedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // 学习模式配置
  const learningModes = [
    {
      mode: GaoPinLearningMode.RANDOM,
      title: '随机学习',
      description: '随机选择高频词语学习',
      icon: Shuffle,
      color: '#3498db',
    },
    {
      mode: GaoPinLearningMode.CATEGORY,
      title: '分类学习',
      description: '按分类系统学习',
      icon: BookOpen,
      color: '#2ecc71',
    },
    {
      mode: GaoPinLearningMode.CONFUSION,
      title: '易混淆学习',
      description: '专注学习易混淆词语',
      icon: Shuffle,
      color: '#e74c3c',
    },
    {
      mode: GaoPinLearningMode.ERROR_PRONE,
      title: '易错学习',
      description: '重点学习易错场景',
      icon: AlertTriangle,
      color: '#f39c12',
    },
    {
      mode: GaoPinLearningMode.REVIEW,
      title: '复习模式',
      description: '复习已学过的内容',
      icon: Target,
      color: '#9b59b6',
    },
  ];

  // 难度选项
  const difficultyOptions = [
    { value: null, label: '全部难度', color: '#95a5a6' },
    { value: 'low', label: '简单', color: '#2ed573' },
    { value: 'medium', label: '中等', color: '#ffa502' },
    { value: 'high', label: '高难度', color: '#ff4757' },
  ];

  // 初始化数据
  useEffect(() => {
    handleRefresh();
  }, []);

  // 搜索处理
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.trim()) {
        handleSearch();
      } else {
        handleRefresh();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  // 筛选处理
  useEffect(() => {
    handleFilter();
  }, [selectedCategory, selectedDifficulty]);

  const handleRefresh = async () => {
    try {
      await refreshGaoPinList({
        category: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
      });
    } catch (error) {
      console.error('刷新失败:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    
    try {
      await searchGaoPin(searchText.trim());
    } catch (error) {
      Alert.alert('搜索失败', error instanceof Error ? error.message : '请重试');
    }
  };

  const handleFilter = async () => {
    try {
      await fetchGaoPinList({
        page: 1,
        category: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
      });
    } catch (error) {
      console.error('筛选失败:', error);
    }
  };

  const handleLoadMore = async () => {
    if (!pagination?.hasMore || loading) return;
    
    try {
      await loadMoreGaoPin({
        category: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
      });
    } catch (error) {
      console.error('加载更多失败:', error);
    }
  };

  const handleCardPress = (gaoPin: ChengYuGaoPinApiRecord) => {
    // 标记为已学习
    setStudiedIds(prev => [...new Set([...prev, gaoPin.id])]);
    
    // 导航到详情页面
    router.push({
      pathname: '/gaopin/[id]',
      params: { id: gaoPin.id }
    });
  };

  const handleFavorite = (gaoPin: ChengYuGaoPinApiRecord) => {
    const isFavorite = favoriteIds.includes(gaoPin.id);
    if (isFavorite) {
      setFavoriteIds(prev => prev.filter(id => id !== gaoPin.id));
    } else {
      setFavoriteIds(prev => [...prev, gaoPin.id]);
    }
    
    toggleFavorite(gaoPin.id);
  };

  const startLearning = async () => {
    try {
      await startLearningSession({
        mode: selectedMode,
        category: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
        count: 20,
      });
      
      // 导航到学习页面，传递学习参数
      const queryParams = new URLSearchParams({
        mode: selectedMode,
        count: '20',
      });
      
      if (selectedCategory) {
        queryParams.append('category', selectedCategory);
      }
      
      if (selectedDifficulty) {
        queryParams.append('difficulty', selectedDifficulty);
      }
      
      router.push(`/gaopin/learning?${queryParams.toString()}`);
    } catch (error) {
      Alert.alert('开始学习失败', error instanceof Error ? error.message : '请重试');
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setSearchText('');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索高频词语..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
            <X size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* 筛选下拉菜单 */}
      <View style={styles.filtersRow}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>分类</Text>
          <DropdownSelect
            options={[
              { label: '全部分类', value: null },
              ...categories.map(category => ({ label: category, value: category }))
            ]}
            selectedValue={selectedCategory}
            onSelect={setSelectedCategory}
            placeholder="选择分类"
            style={styles.dropdown}
          />
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>难度</Text>
          <DropdownSelect
            options={difficultyOptions}
            selectedValue={selectedDifficulty}
            onSelect={(value) => setSelectedDifficulty(value as 'high' | 'medium' | 'low' | null)}
            placeholder="选择难度"
            style={styles.dropdown}
          />
        </View>

        <TouchableOpacity
          style={styles.startLearningButton}
          onPress={() => setShowModeSelector(true)}
        >
          <Play size={20} color="#fff" />
          <Text style={styles.startLearningButtonText}>开始学习</Text>
        </TouchableOpacity>
      </View>

      {/* 统计信息 */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>总词汇</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.withConfusion}</Text>
            <Text style={styles.statLabel}>易混淆</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.withErrorProne}</Text>
            <Text style={styles.statLabel}>易错</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Object.keys(stats.byCategory).length}</Text>
            <Text style={styles.statLabel}>分类</Text>
          </View>
        </View>
      )}

      {/* 当前筛选条件 */}
      {(selectedCategory || selectedDifficulty) && (
        <View style={styles.activeFilters}>
          {selectedCategory && (
            <View style={styles.filterTag}>
              <Text style={styles.filterTagText}>{selectedCategory}</Text>
              <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                <X size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {selectedDifficulty && (
            <View style={styles.filterTag}>
              <Text style={styles.filterTagText}>
                {difficultyOptions.find(d => d.value === selectedDifficulty)?.label}
              </Text>
              <TouchableOpacity onPress={() => setSelectedDifficulty(null)}>
                <X size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
            <Text style={styles.clearFiltersText}>清除全部</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderGaoPinItem = ({ item }: { item: ChengYuGaoPinApiRecord }) => (
    <GaoPinCard
      gaoPin={item}
      onPress={handleCardPress}
      onFavorite={handleFavorite}
      isFavorite={favoriteIds.includes(item.id)}
      isStudied={studiedIds.includes(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 错误提示 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError} style={styles.errorCloseButton}>
            <X size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={gaoPinList}
        renderItem={renderGaoPinItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />



      {/* 学习模式选择模态框 */}
      <Modal
        visible={showModeSelector}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModeSelector(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>选择学习模式</Text>
            <TouchableOpacity onPress={() => setShowModeSelector(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {learningModes.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <TouchableOpacity
                  key={mode.mode}
                  style={[
                    styles.modeOption,
                    selectedMode === mode.mode && styles.modeOptionActive
                  ]}
                  onPress={() => setSelectedMode(mode.mode)}
                >
                  <View style={[styles.modeIcon, { backgroundColor: mode.color }]}>
                    <IconComponent size={24} color="#fff" />
                  </View>
                  <View style={styles.modeContent}>
                    <Text style={styles.modeTitle}>{mode.title}</Text>
                    <Text style={styles.modeDescription}>{mode.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.startLearningButton} 
              onPress={() => {
                setShowModeSelector(false);
                startLearning();
              }}
            >
              <Play size={20} color="#fff" />
              <Text style={styles.startLearningButtonText}>开始学习</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  filterGroup: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  dropdown: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 0.48,
    justifyContent: 'center',
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  filterTagText: {
    color: '#fff',
    fontSize: 12,
    marginRight: 6,
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearFiltersText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  errorCloseButton: {
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterOptionActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeOptionActive: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  startLearningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingVertical: 12,
    flex: 1,
  },
  startLearningButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
}); 