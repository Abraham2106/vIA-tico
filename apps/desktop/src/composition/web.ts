import { QvacLanguageModelStub } from '../adapters/driven/qvac-llm/stub.ts'
import { openWebSqlite } from '../adapters/driven/persistence/open-web.ts'
import { assembleDesktopWorkspace } from './assemble-workspace.ts'

/** Preview Vite: sin Bare ni @qvac/sdk. Expediente SQLite en IndexedDB. */
export async function createWebWorkspace() {
  const opened = await openWebSqlite()
  return assembleDesktopWorkspace(new QvacLanguageModelStub(), opened)
}
