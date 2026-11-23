import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/auth/useAuth';
import { DirectMessageBubble } from '@/features/messages/components/DirectMessageBubble';
import { useSendDirectMessage } from '@/features/messages/hooks/useMessageMutations';
import {
  useDirectConversation,
  useDirectMessageThread,
} from '@/features/messages/hooks/useMessageQueries';
import { normalizeRouteParam } from '@/features/navigation/normalize-route-param';
import { SocialCommentComposer } from '@/features/social/components/SocialCommentComposer';
import { SocialSubscreenHeader } from '@/features/social/components/SocialSubscreenHeader';
import { openSocialProfile } from '@/features/social/navigation/open-social-profile';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export default function DirectMessageThreadScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ conversationId?: string | string[] }>();
  const conversationId = useMemo(
    () => normalizeRouteParam(params.conversationId),
    [params.conversationId],
  );
  const conversation = useDirectConversation(conversationId);
  const thread = useDirectMessageThread(conversationId);
  const send = useSendDirectMessage(conversationId);
  const [draft, setDraft] = useState('');
  // The composer owns the bottom safe-area inset; with the keyboard up it must not add it again.
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardOpen(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardOpen(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  const invertedMessages = useMemo(() => [...thread.messages].reverse(), [thread.messages]);

  const handleSend = useCallback(() => {
    const body = draft.trim();
    if (!body || send.isPending) {
      return;
    }
    send.mutate(body, {
      onSuccess: () => setDraft(''),
    });
  }, [draft, send]);

  const otherUser = conversation.data?.otherUser;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={[styles.flex, styles.screen]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SocialSubscreenHeader
          title={otherUser?.displayName ?? t('messages.inbox')}
          subtitle={otherUser ? `@${otherUser.userName}` : undefined}
          onBack={() => router.back()}
          trailing={
            otherUser ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('messages.openProfile')}
                onPress={() => openSocialProfile(router, otherUser.id)}
                hitSlop={8}
              >
                <AppText style={styles.profileLink}>{t('messages.profile')}</AppText>
              </Pressable>
            ) : undefined
          }
        />
        {thread.isLoading && thread.messages.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : thread.isError && thread.messages.length === 0 ? (
          <View style={styles.center}>
            <AppText style={styles.muted}>
              {conversation.isError ? t('messages.conversationNotFound') : t('messages.loadError')}
            </AppText>
            <Pressable onPress={() => void thread.refetch()}>
              <AppText style={styles.retry}>{t('common.retry')}</AppText>
            </Pressable>
          </View>
        ) : (
          <FlatList
            style={styles.flex}
            data={invertedMessages}
            inverted={invertedMessages.length > 0}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messages}
            renderItem={({ item }) => (
              <DirectMessageBubble message={item} isMine={item.senderId === user?.id} />
            )}
            ListFooterComponent={
              thread.hasOlder ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('messages.loadEarlier')}
                  onPress={() => void thread.loadOlder()}
                  style={styles.earlier}
                >
                  {thread.isLoadingOlder ? (
                    <ActivityIndicator color={colors.accent} />
                  ) : (
                    <AppText style={styles.retry}>{t('messages.loadEarlier')}</AppText>
                  )}
                </Pressable>
              ) : null
            }
            keyboardShouldPersistTaps="handled"
          />
        )}
        <SocialCommentComposer
          draftText={draft}
          placeholder={t('messages.composePlaceholder')}
          isSending={send.isPending}
          sitAboveTabBar={keyboardOpen}
          onChangeText={setDraft}
          onSend={handleSend}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  messages: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
  },
  earlier: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  muted: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  retry: {
    color: colors.accent,
    fontWeight: '600',
  },
  profileLink: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
});
