import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

export function SelectionMark({ selected }: { selected: boolean }) {
  return (
    <Ionicons
      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
      size={22}
      color={selected ? colors.accent : colors.textMuted}
    />
  );
}
