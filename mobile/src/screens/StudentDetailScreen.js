import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { deleteStudent, getStudent } from '../api/studentApi';
import { Button, ConfirmDialog, Header } from '../components/ui';
import { colors } from '../theme';

// Detail screen: opened by tapping a student. Has Edit (UPDATE) and Delete (DELETE).
export default function StudentDetailScreen({ student: initial, onBack, onEdit, onDeleted, showToast }) {
  const [student, setStudent] = useState(initial);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Pull the latest copy of this record from the API (GET by id)
  useEffect(() => {
    let active = true;
    getStudent(initial.id)
      .then((fresh) => active && fresh && setStudent(fresh))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [initial.id]);

  const handleDelete = async () => {
    setConfirmVisible(false);
    setDeleting(true);
    try {
      await deleteStudent(student.id);
      showToast(`${student.first_name} ${student.last_name} deleted`);
      onDeleted();
    } catch (e) {
      setDeleting(false);
      showToast(e.message);
    }
  };

  const fullName = `${student.first_name} ${student.last_name}`;
  const initials = `${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`.toUpperCase();

  return (
    <View style={styles.container}>
      <Header title="Student Details" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.number}>{student.student_number}</Text>

        <View style={styles.card}>
          <Row icon="card" label="Student No." value={student.student_number} />
          <Row icon="school" label="Course" value={student.course} />
          <Row icon="layers" label="Year Level" value={`Year ${student.year_level}`} />
          <Row icon="mail" label="Email" value={student.email} />
          {student.created_at ? <Row icon="calendar" label="Created" value={student.created_at} /> : null}
          {student.updated_at ? (
            <Row icon="time" label="Last Updated" value={student.updated_at} last />
          ) : null}
        </View>

        <View style={styles.actions}>
          <Button title="Edit" icon="create" onPress={() => onEdit(student)} disabled={deleting} style={{ flex: 1 }} />
          <Button
            title="Delete"
            icon="trash"
            variant="danger-outline"
            loading={deleting}
            onPress={() => setConfirmVisible(true)}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmVisible}
        title="Delete student?"
        message={`Are you sure you want to delete ${fullName} (${student.student_number})? This will permanently remove the record from the database.`}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}

function Row({ icon, label, value, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  avatar: {
    alignSelf: 'center',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 30, fontWeight: '700', color: colors.primary },
  name: { textAlign: 'center', fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 12 },
  number: { textAlign: 'center', color: colors.muted, marginBottom: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: 12, color: colors.muted },
  rowValue: { fontSize: 16, fontWeight: '500', color: colors.text },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
});
