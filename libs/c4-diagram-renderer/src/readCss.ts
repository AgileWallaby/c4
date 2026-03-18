import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'

/**
 * Reads the React Flow CSS from node_modules at runtime.
 * This CSS is required for correct rendering of the SSR output.
 */
export function readReactFlowCss(): string {
    // Walk up from this file to find node_modules
    const candidates = [
        // When running from the workspace root (typical Nx setup)
        resolve(process.cwd(), 'node_modules/@xyflow/react/dist/style.css'),
        // When running from the library directory
        resolve(dirname(new URL(import.meta.url).pathname), '../../node_modules/@xyflow/react/dist/style.css'),
        resolve(dirname(new URL(import.meta.url).pathname), '../../../../node_modules/@xyflow/react/dist/style.css'),
    ]

    for (const candidate of candidates) {
        try {
            return readFileSync(candidate, 'utf-8')
        } catch {
            // try next
        }
    }

    throw new Error(
        'Could not find @xyflow/react/dist/style.css. Make sure @xyflow/react is installed.',
    )
}
