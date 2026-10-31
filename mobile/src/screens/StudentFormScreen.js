import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { createStudent, updateStudent } from '../api/studentApi';
import { Button, Header } from '../components/ui';
import { colors } from '../theme';

// One form for CREATE (no student passed) and UPDATE (student passed -> pre-filled)
export default function StudentFormScreen({ student, onBack, onSaved, showToast }) {
  const isEdit = !!student;

  const [form, setForm] = useState({
    student_number: student?.student_number ?? '',
    first_name: student?.first_name ?? '',
    last_name: student?.last_name ?? '',
    course: student?.course ?? '',
    year_level: student ? String(student.year_level) : '',
    email: student?.email ?? '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (touched[key]) setErrors(validate(next));
  };

  const blur = (key) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(form));
  };

  const handleSave = async () => {
    const errs = validate(form);
    setErrors(errs);
    setTouched({ student_number: true, first_name: true, last_name: true, course: true, year_level: true, email: true });
    if (Object.keys(errs).length) {
      showToast('Please fix the highlighted fields');
      return;
    }

    const payload = {
      student_number: form.student_number.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      course: form.course.trim(),
      year_level: parseInt(form.year_level, 10),
      email: form.email.trim(),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await updateStudent(student.id, payload);
        showToast('Student updated successfully');
      } else {
        await createStudent(payload);
        showToast('Student added successfully');
      }
      onSaved();
    } catch (e) {
      setSaving(false);
      showToast(e.message);
    }
  };

  const field = (key, label, icon, props = {}) => {
    const err = touched[key] && errors[key];
    return (
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputBox, err && styles.inputError]}>
          <Ionicons name={icon} size={18} color={err ? colors.danger : colors.muted} />
          <TextInput
            style={styles.input}
            value={form[key]}
            onChangeText={(v) => setField(key, v)}
            onBlur={() => blur(key)}
            placeholderTextColor="#A0A7B4"
            {...props}
          />
        </View>
        {err ? <Text style={styles.errorText}>{err}</Text> : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title={isEdit ? 'Edit Student' : 'Add Student'} onBack={onBack} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {field('student_number', 'Student Number', 'card', { placeholder: '2023-00101' })}
          {field('first_name', 'First Name', 'person', { autoCapitalize: 'words' })}
          {field('last_name', 'Last Name', 'person-outline', { autoCapitalize: 'words' })}
          {field('course', 'Course', 'school', { placeholder: 'BS Information Technology', autoCapitalize: 'words' })}
          {field('year_level', 'Year Level (1–5)', 'layers', { keyboardType: 'number-pad', maxLength: 1 })}
          {field('email', 'Email', 'mail', {
            keyboardType: 'email-address',
            autoCapitalize: 'none',
            autoCorrect: false,
          })}

          <Button
            title={isEdit ? 'Save Changes' : 'Add Student'}
            icon={isEdit ? 'save' : 'add-circle'}
            onPress={handleSave}
            loading={saving}
            style={{ marginTop: 12 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ---------- validation ----------
function validate(f) {
  const e = {};
  const req = (k, label) => {
    if (!String(f[k]).trim()) e[k] = `${label} is required`;
  };

  req('student_number', 'Student number');
  req('first_name', 'First name');
  req('last_name', 'Last name');
  req('course', 'Course');
  req('year_level', 'Year level');
  req('email', 'Email');

  if (!e.student_number && !/^\d{4}-\d{5}$/.test(f.student_number.trim())) {
    e.student_number = 'Use the format YYYY-NNNNN (e.g. 2023-00101)';
  }
  ['first_name', 'last_name'].forEach((k) => {
    const v = f[k].trim();
    const label = k === 'first_name' ? 'First name' : 'Last name';
    if (!e[k] && v.length < 2) e[k] = `${label} must be at least 2 characters`;
    else if (!e[k] && !/^[a-zA-ZñÑ .'-]+$/.test(v)) e[k] = `${label} can only contain letters`;
  });
  if (!e.year_level) {
    const n = Number(f.year_level);
    if (!Number.isInteger(n) || n < 1 || n > 5) e.year_level = 'Year level must be 1 to 5';
  }
  if (!e.email && !/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(f.email.trim())) {
    e.email = 'Enter a valid email address';
  }
  return e;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 60 },
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  inputError: { borderColor: colors.danger, backgroundColor: colors.dangerLight },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4, marginLeft: 4 },
});
