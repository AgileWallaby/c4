import { test, expect } from '@playwright/test'
import * as path from 'path'
import { workspaceRoot } from '@nx/devkit'

const fixturePath = path.join(
    workspaceRoot,
    'apps/c4-viewer/src/parser/__fixtures__/sample-workspace.json'
)

test('shows workspace loader on initial load', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="workspace-loader"]')).toBeVisible()
})

test('upload workspace → view selector shows 3 views → nodes render', async ({ page }) => {
    await page.goto('/')

    // Upload the fixture file via the hidden file input
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(fixturePath)

    // Dropdown should have three view options
    const select = page.locator('[data-testid="view-selector"]')
    await expect(select).toBeVisible()
    await expect(select.locator('option')).toHaveCount(3)
    await expect(select.locator('option[value="landscape"]')).toBeVisible()
    await expect(select.locator('option[value="context-banking"]')).toBeVisible()
    await expect(select.locator('option[value="containers-banking"]')).toBeVisible()

    // At least one React Flow node should be rendered on the canvas
    const canvas = page.locator('[data-testid="diagram-canvas"]')
    await expect(canvas).toBeVisible()
    await expect(canvas.locator('.react-flow__node').first()).toBeVisible()
})
