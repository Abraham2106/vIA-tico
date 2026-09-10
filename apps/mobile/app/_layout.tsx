import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0b1015' },
          headerTintColor: '#e8eef4',
          contentStyle: { backgroundColor: '#0e1318' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'ViáticoCero' }} />
        <Stack.Screen name="capture/index" options={{ title: 'Captura' }} />
        <Stack.Screen name="preview/index" options={{ title: 'Preview DTO' }} />
        <Stack.Screen name="pairing/index" options={{ title: 'Emparejar' }} />
      </Stack>
    </>
  )
}
