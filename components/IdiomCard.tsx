import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Heart } from 'lucide-react-native';
import { Idiom } from '@/data/idioms';

interface IdiomCardProps {
  idiom: Idiom;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
}

const { width } = Dimensions.get('window');

export default function IdiomCard({ idiom, onPress, onFavorite, isFavorited = false }: IdiomCardProps) {
  const renderStickerCategory = () => {
    const characters = idiom.category.split('');
    
    return (
      <View style={styles.stickerContainer}>
        {characters.map((char, index) => (
          <View key={index} style={styles.stickerTag}>
            <View style={styles.stickerInner}>
              <Text style={styles.stickerText}>{char}</Text>
            </View>
            <View style={styles.stickerBorder} />
            <View style={styles.stickerShadow} />
          </View>
        ))}
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.card}>
        {/* Idiom Display with Traditional Styling */}
        <View style={styles.idiomContainer}>
          <Text style={styles.idiomText}>{idiom.idiom}</Text>
          <View style={styles.idiomFrame} />
        </View>
        
        {/* Pinyin */}
        <Text style={styles.pinyinText}>{idiom.pinyin}</Text>
        
        {/* Meaning Preview */}
        <Text style={styles.meaningText} numberOfLines={2}>
          {idiom.meaning}
        </Text>
        
        {/* Footer */}
        <View style={styles.footer}>
          {renderStickerCategory()}
          
          {onFavorite && (
            <TouchableOpacity 
              style={styles.favoriteButton} 
              onPress={onFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Heart 
                size={20} 
                color={isFavorited ? '#C93F3F' : '#666666'} 
                fill={isFavorited ? '#C93F3F' : 'transparent'}
                strokeWidth={2}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 24,
    shadowColor: '#1A1A1A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  idiomContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
  },
  idiomText: {
    fontFamily: 'NotoSerifSC-SemiBold',
    fontSize: 32,
    color: '#1A1A1A',
    letterSpacing: 4,
    textAlign: 'center',
    zIndex: 2,
  },
  idiomFrame: {
    position: 'absolute',
    top: 0,
    left: -8,
    right: -8,
    bottom: 0,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 6,
    backgroundColor: 'rgba(247, 247, 247, 0.3)',
    zIndex: 1,
  },
  pinyinText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  meaningText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stickerTag: {
    position: 'relative',
    width: 28,
    height: 28,
  },
  stickerInner: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  stickerBorder: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderWidth: 1.5,
    borderColor: '#C93F3F',
    borderRadius: 7,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  stickerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#C93F3F',
    borderRadius: 8,
    opacity: 0.15,
    zIndex: 1,
  },
  stickerText: {
    fontFamily: 'NotoSerifSC-Medium',
    fontSize: 12,
    color: '#C93F3F',
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 4,
  },
});