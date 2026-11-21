import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const colors = {
  background: '#FAF8F5',
  primary: '#4A2C2A',
};

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '700' },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="add" options={{ title: 'Log Caffeine', presentation: 'card' }} />
      </Stack>
    </>
  );
}
