import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

interface DropdownOption {
  label: string;
  value: string | null;
  color?: string;
}

interface DropdownSelectProps {
  options: DropdownOption[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
  placeholder?: string;
  style?: any;
  dropdownStyle?: any;
  maxHeight?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export function DropdownSelect({
  options,
  selectedValue,
  onSelect,
  placeholder = '请选择',
  style,
  dropdownStyle,
  maxHeight = 200,
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const selectedOption = options.find(option => option.value === selectedValue);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (value: string | null) => {
    onSelect(value);
    setIsOpen(false);
  };

  const onLayout = (event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setDropdownLayout({ x, y, width, height });
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.selector, isOpen && styles.selectorOpen]}
        onPress={handleToggle}
        onLayout={onLayout}
      >
        <Text style={[styles.selectorText, !selectedOption && styles.placeholderText]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        {isOpen ? (
          <ChevronUp size={20} color="#666" />
        ) : (
          <ChevronDown size={20} color="#666" />
        )}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[
              styles.dropdown,
              dropdownStyle,
              {
                top: dropdownLayout.y + dropdownLayout.height + 5,
                left: dropdownLayout.x,
                width: dropdownLayout.width,
                maxHeight,
              },
            ]}
          >
            <ScrollView
              style={styles.optionsContainer}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {options.map((option, index) => (
                <TouchableOpacity
                  key={`${option.value}-${index}`}
                  style={[
                    styles.option,
                    selectedValue === option.value && styles.selectedOption,
                    index === options.length - 1 && styles.lastOption,
                  ]}
                  onPress={() => handleSelect(option.value)}
                >
                  <View style={styles.optionContent}>
                    {option.color && (
                      <View style={[styles.colorIndicator, { backgroundColor: option.color }]} />
                    )}
                    <Text
                      style={[
                        styles.optionText,
                        selectedValue === option.value && styles.selectedOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  selectorOpen: {
    borderColor: '#3498db',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3498db',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1001,
  },
  optionsContainer: {
    maxHeight: 200,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  selectedOption: {
    backgroundColor: '#f8f9fa',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#3498db',
    fontWeight: '500',
  },
}); 