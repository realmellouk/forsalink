import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useUser } from '../utils/UserContext';
import { api } from '../config/api';

const ChatScreen = ({ route, navigation }) => {
  const { conversationId, otherPartyName, jobTitle } = route.params;
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: otherPartyName });
    loadMessages();
    markAsRead();

    const interval = setInterval(() => {
      loadMessages(true);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.getConversationMessages(conversationId);
      setMessages(data);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: !silent });
      }, 100);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await api.markMessagesAsRead(conversationId, user.id);
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      await api.sendMessage(conversationId, user.id, messageText);
      await loadMessages(true);
    } catch (error) {
      console.error('Send message error:', error);
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender_id === user.id;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
      ]}>
        {!isMyMessage && (
          <Text style={styles.senderName}>{item.sender_name}</Text>
        )}
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.theirMessageText
          ]}>
            {item.message}
          </Text>
        </View>
        <Text style={[
          styles.messageTime,
          isMyMessage ? styles.myMessageTime : styles.theirMessageTime
        ]}>
          {new Date(item.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobHeaderText}>📋 {jobTitle}</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={500}
        />
        {sending ? (
          <ActivityIndicator size="small" color="#2563eb" style={styles.sendButton} />
        ) : (
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb'
  },
  jobHeader: {
    backgroundColor: '#eff6ff',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#bfdbfe'
  },
  jobHeaderText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
    fontWeight: '600'
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%'
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end'
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start'
  },
  senderName: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    marginLeft: 12,
    fontWeight: '500'
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  myMessageBubble: {
    backgroundColor: '#2563eb'
  },
  theirMessageBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20
  },
  myMessageText: {
    color: '#ffffff'
  },
  theirMessageText: {
    color: '#1f2937'
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4
  },
  myMessageTime: {
    textAlign: 'right',
    marginRight: 12
  },
  theirMessageTime: {
    textAlign: 'left',
    marginLeft: 12
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8
  },
  sendButton: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 65,
    height: 40
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af'
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  }
});

export default ChatScreen;