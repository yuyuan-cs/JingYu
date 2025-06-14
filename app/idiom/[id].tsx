import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Heart, Volume2, BookOpen } from 'lucide-react-native';
import { idioms } from '@/data/idioms';

export default function IdiomDetailScreen() {
  const { id } = useLocalSearchParams();
  const [isFavorited, setIsFavorited] = useState(false);
  
  const idiom = idioms.find(item => item.id === id);

  if (!idiom) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>成语未找到</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleSimilarIdiom = (similarIdiom: string) => {
    // In a real app, you would find the similar idiom's ID and navigate to it
    console.log('Navigate to similar idiom:', similarIdiom);
  };

  const renderSimilarIdioms = () => {
    if (!idiom.similar.length) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <BookOpen size={20} color="#C93F3F" strokeWidth={2} />
          <Text style={styles.sectionTitle}>相似成语</Text>
        </View>
        <View style={styles.similarContainer}>
          {idiom.similar.map((similar, index) => (
            <TouchableOpacity
              key={index}
              style={styles.similarTag}
              onPress={() => handleSimilarIdiom(similar)}
            >
              <Text style={styles.similarText}>{similar}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#1A1A1A" strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
          <Heart 
            size={24} 
            color={isFavorited ? '#C93F3F' : '#666666'} 
            fill={isFavorited ? '#C93F3F' : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
        {/* Main Idiom Display */}
        <View style={styles.idiomDisplay}>
          <View style={styles.idiomContainer}>
            <Text style={styles.idiomText}>{idiom.idiom}</Text>
            <View style={styles.idiomFrame} />
          </View>
          <View style={styles.pinyinContainer}>
            <Text style={styles.pinyinText}>{idiom.pinyin}</Text>
            <TouchableOpacity style={styles.pronunciationButton}>
              <Volume2 size={18} color="#C93F3F" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Badge */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{idiom.category}</Text>
        </View>

        {/* Meaning Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>释义</Text>
          <Text style={styles.meaningText}>{idiom.meaning}</Text>
        </View>

        {/* Origin Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>出处</Text>
          <Text style={styles.originText}>{idiom.origin}</Text>
        </View>

        {/* Example Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>例句</Text>
          <Text style={styles.exampleText}>{idiom.example}</Text>
        </View>

        {/* Similar Idioms */}
        {renderSimilarIdioms()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#F7F7F7',
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  idiomDisplay: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  idiomContainer: {
    position: 'relative',
    paddingVertical: 24,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  idiomText: {
    fontFamily: 'NotoSerifSC-SemiBold',
    fontSize: 48,
    color: '#1A1A1A',
    letterSpacing: 8,
    textAlign: 'center',
    zIndex: 2,
  },
  idiomFrame: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    borderRadius: 8,
    backgroundColor: 'rgba(247, 247, 247, 0.5)',
    zIndex: 1,
  },
  pinyinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pinyinText: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#666666',
    letterSpacing: 2,
  },
  pronunciationButton: {
    padding: 4,
  },
  categoryContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#C93F3F',
    backgroundColor: '#C93F3F15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#1A1A1A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  meaningText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 26,
  },
  originText: {
    fontFamily: 'NotoSerifSC-Regular',
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  exampleText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  similarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  similarTag: {
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  similarText: {
    fontFamily: 'NotoSerifSC-Regular',
    fontSize: 16,
    color: '#1A1A1A',
    letterSpacing: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#999999',
  },
});