import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        page.set_default_timeout(60000)

        # --- Test Creative Assistant ---
        await page.goto('http://localhost:8000/dbm.html')
        await page.wait_for_selector('body')
        await page.wait_for_timeout(1000) # Give Firebase time to auth
        await page.click('.sidebar-tab:has-text("SPECIES")')
        await page.wait_for_timeout(500) # Give view time to render

        await page.wait_for_selector('.data-table tbody tr')
        await page.click('.data-table tbody tr:first-child')
        await page.wait_for_selector('#entry-modal', state='visible')

        await page.click('#modal-data-btn')
        await page.click('text=Edit')
        await page.wait_for_timeout(500)

        await page.click('.ai-assistant-btn[data-field-key="description"]')
        await expect(page.locator('.ai-assistant-dropdown[data-action="elaborate"]')).to_be_visible()
        await page.screenshot(path='jules-scratch/verification/creative-assistant-open.png')

        # --- Test Database Manager AI ---
        await page.click('.ai-suggest-btn[data-field-key="prerequisite"]')
        page.on('dialog', lambda dialog: dialog.accept())
        await page.wait_for_timeout(500) # Wait for modal to appear
        await expect(page.locator('#custom-modal')).to_be_visible()
        await page.screenshot(path='jules-scratch/verification/db-manager-ai-open.png')
        await page.click('#custom-modal-cancel-btn')

        # --- Test Pair-GM ---
        await page.click('#modal-cancel-btn')
        await page.click('#pair-gm-btn')
        await page.wait_for_selector('#pair-gm-modal', state='visible')

        # Check that the persona generator has options
        await expect(page.locator('#persona-generator-inputs select[data-category="species"] option')).to_have_count.above(1)
        await page.screenshot(path='jules-scratch/verification/pair-gm-modal-loaded.png')

        await browser.close()

asyncio.run(main())