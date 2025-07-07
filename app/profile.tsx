import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import UserProfile from '@/components/UserProfile';
import { router } from 'expo-router';

export default function ProfilePage() {
  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <UserProfile onClose={handleClose} isModal={true} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
}); 