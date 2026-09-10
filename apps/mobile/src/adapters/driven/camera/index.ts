import * as ImagePicker from 'expo-image-picker'
import type { CapturedImage, ICamera } from '@viaticocero/core'

export class ExpoImageCamera implements ICamera {
  async capture(): Promise<CapturedImage> {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      throw new Error('Permiso de cámara denegado')
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    })
    if (result.canceled || !result.assets[0]) {
      throw new Error('Captura cancelada')
    }
    const asset = result.assets[0]
    return {
      path: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
    }
  }
}

export class ExpoLibraryPicker implements ICamera {
  async capture(): Promise<CapturedImage> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      throw new Error('Permiso de galería denegado')
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (result.canceled || !result.assets[0]) {
      throw new Error('Selección cancelada')
    }
    const asset = result.assets[0]
    return {
      path: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
    }
  }
}
