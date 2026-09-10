import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import type { AnalysisJob } from '@viaticocero/contracts'
import type { IJobTransport } from '@viaticocero/core'

export class HttpJobTransport implements IJobTransport {
  constructor(private readonly inboxUrl: string) {}
  async send(job: AnalysisJob): Promise<void> {
    const response = await fetch(`${this.inboxUrl.replace(/\/$/, '')}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    })
    if (!response.ok) {
      throw new Error(`Inbox ${response.status}`)
    }
  }
}

export class ShareFileJobTransport implements IJobTransport {
  async send(job: AnalysisJob): Promise<void> {
    const path = `${FileSystem.cacheDirectory}job-${job.id}.json`
    await FileSystem.writeAsStringAsync(path, JSON.stringify(job, null, 2))
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, {
        mimeType: 'application/json',
        dialogTitle: 'Enviar analysis-job a escritorio',
      })
      return
    }
    throw new Error('Sharing no disponible; copia el JSON desde preview')
  }
}
