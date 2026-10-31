import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import StudentDetailScreen from './src/screens/StudentDetailScreen';
import StudentFormScreen from './src/screens/StudentFormScreen';
import { Toast } from './src/components/ui';

// Simple screen stack: [{ name: 'home' }, { name: 'detail', student }, { name: 'form', student? }]
export default function App() {
  const [stack, setStack] = useState([{ name: 'home' }]);
  const [reloadKey, setReloadKey] = useState(0);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const current = stack[stack.length - 1];

  const push = (screen) => setStack((s) => [...s, screen]);
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const goHomeAndReload = () => {
    setStack([{ name: 'home' }]);
    setReloadKey((k) => k + 1);
  };

  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  // Android hardware back button goes to the previous screen
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) {
        back();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, back]);

  let screen;
  if (current.name === 'detail') {
    screen = (
      <StudentDetailScreen
        key={`detail-${current.student.id}-${reloadKey}`}
        student={current.student}
        onBack={() => {
          back();
          setReloadKey((k) => k + 1);
        }}
        onEdit={(student) => push({ name: 'form', student })}
        onDeleted={goHomeAndReload}
        showToast={showToast}
      />
    );
  } else if (current.name === 'form') {
    screen = (
      <StudentFormScreen
        student={current.student}
        onBack={back}
        onSaved={() => {
          if (current.student) {
            // After editing, go back to the detail screen and refresh it
            setStack((s) => s.slice(0, -1));
            setReloadKey((k) => k + 1);
          } else {
            goHomeAndReload();
          }
        }}
        showToast={showToast}
      />
    );
  } else {
    screen = (
      <HomeScreen
        reloadKey={reloadKey}
        onOpenStudent={(student) => push({ name: 'detail', student })}
        onAdd={() => push({ name: 'form' })}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        {screen}
        <Toast message={toast} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
