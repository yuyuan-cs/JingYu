import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, FlatList, StatusBar, Platform, TextInput, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Search, BookOpen, Sparkles, Heart } from 'lucide-react-native';
import { idioms } from '@/data/idioms';
import IdiomCard from '@/components/IdiomCard';

const { width } = Dimensions.get('window');

// 8px grid system constants
const GRID = 8;
const SPACING = {
  xs: GRID,      // 8px
  sm: GRID * 2,  // 16px
  md: GRID * 3,  // 24px
  lg: GRID * 4,  // 32px
  xl: GRID * 5,  // 40px
  xxl: GRID * 6, // 48px
};

export default function IdiomIndexScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIdioms, setFilteredIdioms] = useState(idioms);

  // 获取所有分类
  const categories = ['全部', ...Array.from(new Set(idioms.map(idiom => idiom.category)))];

  // 过滤成语
  useEffect(() => {
    let filtered = idioms;
    
    // 按分类过滤
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(idiom => idiom.category === selectedCategory);
    }
    
    // 按搜索词过滤
    if (searchQuery.trim()) {
      filtered = filtered.filter(idiom => 
        idiom.idiom.includes(searchQuery) || 
        idiom.meaning.includes(searchQuery) ||
        idiom.pinyin.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredIdioms(filtered);
  }, [selectedCategory, searchQuery]);

  const handleBack = () => {
    router.back();
  };

  const handleIdiomPress = (idiomId: string) => {
    router.push(`/idiom/${idiomId}`);
  };

  const getCategoryColor = (category: string): [string, string] => {
    const colors: { [key: string]: [string, string] } = {
      '艺术创作': ['#FF6B6B', '#FFE66D'],
      '学习教育': ['#4ECDC4', '#45B7D1'],
      '志向理想': ['#96CEB4', '#FFEAA7'],
      '坚持努力': ['#DDA0DD', '#98D8C8'],
      '医术技艺': ['#F7DC6F', '#BB8FCE'],
    };
    return colors[category] || ['#FF8A80', '#FFD54F'];
  };

  const renderHeader = () => {
    const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
    
    return (
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: statusBarHeight + SPACING.sm }]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            
            <View style={styles.headerTitle}>
              <BookOpen size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.headerTitleText}>成语大全</Text>
            </View>
            
            <TouchableOpacity style={styles.headerButton}>
              <Heart size={18} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Search size={16} color="#6C757D" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索成语、释义或拼音..."
          placeholderTextColor="#ADB5BD"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.categoryButtonTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderIdiomCard = ({ item }: { item: any }) => (
    <IdiomCard 
      idiom={item} 
      onPress={() => handleIdiomPress(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Sparkles size={48} color="#ADB5BD" strokeWidth={1} />
      <Text style={styles.emptyTitle}>没有找到相关成语</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? `试试其他搜索词，或者清空搜索条件` : '请选择其他分类查看成语'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      {renderHeader()}
      
      <View style={styles.content}>
        {renderSearchBar()}
        {renderCategoryFilter()}
        
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            共找到 {filteredIdioms.length} 个成语
          </Text>
        </View>
        
        <FlatList
          data={filteredIdioms}
          renderItem={renderIdiomCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          numColumns={1}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    zIndex: 10,
  },
  headerGradient: {
    paddingBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: SPACING.xs,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerTitleText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.xs,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#495057',
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  categoryScroll: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  categoryButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  statsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '500',
  },
  listContainer: {
    padding: SPACING.md,
  },
  separator: {
    height: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#495057',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    fontWeight: '400',
  },
}); 