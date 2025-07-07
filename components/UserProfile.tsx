import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuthContext } from '../hooks/useAuth';
import { User, Mail, Edit3, Save, X, Camera } from 'lucide-react-native';

interface UserProfileProps {
  onClose?: () => void;
  isModal?: boolean;
}

export function UserProfile({ onClose, isModal = false }: UserProfileProps) {
  const { user, updateProfile, loading } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        full_name: user.full_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // 开始编辑
  const startEditing = () => {
    setIsEditing(true);
  };

  // 取消编辑
  const cancelEditing = () => {
    setIsEditing(false);
    // 重置表单数据
    if (user) {
      setFormData({
        username: user.username || '',
        full_name: user.full_name || '',
        email: user.email || '',
      });
    }
  };

  // 保存更改
  const saveChanges = async () => {
    if (!formData.username.trim()) {
      Alert.alert('错误', '用户名不能为空');
      return;
    }

    if (formData.username.length < 2) {
      Alert.alert('错误', '用户名长度至少为2位');
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile({
        username: formData.username.trim(),
        full_name: formData.full_name.trim() || formData.username.trim(),
      });

      if (result.success) {
        setIsEditing(false);
        Alert.alert('成功', '资料更新成功');
      } else {
        Alert.alert('错误', result.error || '更新失败');
      }
    } catch (error) {
      Alert.alert('错误', '更新时发生错误');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>加载用户信息...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>用户信息加载失败</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 头部 */}
      {isModal && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>个人资料</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 头像区域 */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={40} color="#fff" />
            </View>
          )}
          <TouchableOpacity style={styles.cameraButton}>
            <Camera size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userTitle}>{user.full_name || user.username}</Text>
        <Text style={styles.userSubtitle}>@{user.username}</Text>
      </View>

      {/* 用户信息 */}
      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>基本信息</Text>
          {!isEditing && (
            <TouchableOpacity onPress={startEditing} style={styles.editButton}>
              <Edit3 size={20} color="#3498db" />
              <Text style={styles.editButtonText}>编辑</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 用户名 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>用户名</Text>
          {isEditing ? (
            <TextInput
              style={styles.fieldInput}
              value={formData.username}
              onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
              placeholder="请输入用户名"
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : (
            <Text style={styles.fieldValue}>{user.username}</Text>
          )}
        </View>

        {/* 姓名 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>姓名</Text>
          {isEditing ? (
            <TextInput
              style={styles.fieldInput}
              value={formData.full_name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
              placeholder="请输入姓名"
              autoCapitalize="words"
            />
          ) : (
            <Text style={styles.fieldValue}>{user.full_name || '未设置'}</Text>
          )}
        </View>

        {/* 邮箱 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>邮箱</Text>
          <View style={styles.fieldValue}>
            <Mail size={16} color="#666" style={styles.fieldIcon} />
            <Text style={styles.fieldText}>{user.email}</Text>
          </View>
        </View>

        {/* 注册时间 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>注册时间</Text>
          <Text style={styles.fieldValue}>
            {new Date(user.created_at).toLocaleDateString('zh-CN')}
          </Text>
        </View>

        {/* 编辑按钮 */}
        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={cancelEditing}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={saveChanges}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Save size={16} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.saveButtonText}>保存</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 统计信息 */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>学习统计</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>学习天数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>收藏成语</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>测试次数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>解锁成就</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  infoSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#e3f2fd',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    color: '#2c3e50',
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  fieldIcon: {
    marginRight: 8,
  },
  fieldInput: {
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#3498db',
    marginLeft: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 8,
  },
  statsSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default UserProfile; 