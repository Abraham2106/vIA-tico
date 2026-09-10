import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAppTheme } from '../src/theme'

export default function Layout() {
  const theme = useAppTheme()
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.header },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: theme.colors.surface },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'ViáticoCero' }} />
        <Stack.Screen name="capture/index" options={{ title: 'Capturar' }} />
        <Stack.Screen name="preview/index" options={{ title: 'Revisar gasto' }} />
        <Stack.Screen name="pairing/index" options={{ title: 'Emparejar' }} />
      </Stack>
    </>
  )
}
