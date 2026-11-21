import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UseMutationResult } from '@tanstack/react-query';
import type { SocialComment, SocialFeedItem } from '../types';
import type { SocialReportReason, SocialReportSheetKind } from '../components/SocialReportReasonSheet';

type ReportMutation = UseMutationResult<
  void,
  Error,
  { targetType: 'Activity' | 'Comment' | 'User'; targetId: string; reason: string }
>;

interface ReportTarget {
  kind: SocialReportSheetKind;
  targetType: 'Activity' | 'Comment' | 'User';
  targetId: string;
}

export function useSocialReportReasonSheet(report: ReportMutation) {
  const { t } = useTranslation();
  const [target, setTarget] = useState<ReportTarget | null>(null);

  const close = useCallback(() => setTarget(null), []);

  const openActivityReport = useCallback((item: SocialFeedItem) => {
    setTarget({ kind: 'activity', targetType: 'Activity', targetId: item.id });
  }, []);

  const openCommentReport = useCallback((comment: SocialComment) => {
    setTarget({ kind: 'comment', targetType: 'Comment', targetId: comment.id });
  }, []);

  const openUserReport = useCallback((userId: string) => {
    setTarget({ kind: 'user', targetType: 'User', targetId: userId });
  }, []);

  const handleSelectReason = useCallback(
    (reason: SocialReportReason) => {
      if (!target) return;
      report.mutate({
        targetType: target.targetType,
        targetId: target.targetId,
        reason,
      });
      close();
    },
    [close, report, target],
  );

  const sheetTitle = useMemo(() => {
    if (!target) return '';
    if (target.kind === 'comment') return t('social.commentReportTitle');
    if (target.kind === 'user') return t('social.reportUserTitle');
    return t('social.reportTitle');
  }, [t, target]);

  const sheetSubtitle = useMemo(() => {
    if (!target) return undefined;
    return target.kind === 'user' ? t('social.reportUserReason') : t('social.chooseReportReason');
  }, [t, target]);

  return {
    openActivityReport,
    openCommentReport,
    openUserReport,
    reportSheetProps: {
      visible: target !== null,
      kind: (target?.kind ?? 'activity') as SocialReportSheetKind,
      title: sheetTitle,
      subtitle: sheetSubtitle,
      onClose: close,
      onSelectReason: handleSelectReason,
    },
  };
}