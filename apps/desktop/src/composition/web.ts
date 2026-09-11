import { QvacLanguageModelStub } from '../adapters/driven/qvac-llm/stub.ts'
import { createDesktopWorkspace } from './desktop-workspace.ts'

/** Preview Vite: sin Bare ni @qvac/sdk. */
export async function createWebWorkspace() {
  return createDesktopWorkspace(new QvacLanguageModelStub())
}
