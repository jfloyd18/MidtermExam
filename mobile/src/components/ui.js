import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme';

// Top bar with optional back button and right-side action
export function Header({ title, onBack, right }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
      ) : null}
      <Text style={styles.headerTitle}>{title}</Text>
      {right}
    </View>
  );
}

export function Button({ title, icon, onPress, variant = 'primary', loading, disabled, style }) {
  const outline = variant === 'danger-outline';
  const bg =
    variant === 'danger' ? colors.danger : outline ? 'transparent' : variant === 'secondary' ? colors.primaryLight : colors.primary;
  const fg = outline ? colors.danger : variant === 'secondary' ? colors.primary : colors.white;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        outline && { borderWidth: 1.5, borderColor: colors.danger },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
          <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

// Confirmation dialog (used before deleting a record)
export function ConfirmDialog({ visible, title, message, confirmText = 'Delete', onCancel, onConfirm }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <View style={styles.dialogIcon}>
            <Ionicons name="warning" size={30} color={colors.danger} />
          </View>
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogMessage}>{message}</Text>
          <View style={styles.dialogActions}>
            <Button title="Cancel" variant="secondary" onPress={onCancel} style={{ flex: 1 }} />
            <Button title={confirmText} variant="danger" onPress={onConfirm} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Small pop-up message at the bottom of the screen
export function Toast({ message }) {
  const insets = useSafeAreaInsets();
  if (!message) return null;
  return (
    <View pointerEvents="none" style={[styles.toast, { bottom: insets.bottom + 24 }]}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerTitle: { flex: 1, color: colors.white, fontSize: 20, fontWeight: '700' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  buttonText: { fontWeight: '600', fontSize: 15 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
  },
  dialogIcon: {
    backgroundColor: colors.dangerLight,
    borderRadius: 40,
    padding: 12,
    marginBottom: 12,
  },
  dialogTitle: { fontSize: 19, fontWeight: '700', color: colors.text, marginBottom: 8 },
  dialogMessage: { fontSize: 15, color: colors.muted, textAlign: 'center', marginBottom: 20 },
  dialogActions: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: '#323232',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toastText: { color: colors.white, textAlign: 'center' },
});
