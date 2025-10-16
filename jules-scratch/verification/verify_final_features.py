import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        page.set_default_timeout(60000)

        # Go to the page
        await page.goto('http://localhost:8000/dbm.html')
        await page.wait_for_selector('body')
        await page.wait_for_timeout(2000) # Give Firebase time to auth

        # Check for an error modal first
        error_modal = await page.query_selector('#error-modal:not(.hidden)')
        if error_modal:
            error_message = await page.locator('#error-message').text_content()
            print(f"Error modal appeared with message: {error_message}")
            await page.screenshot(path='jules-scratch/verification/error-modal.png')
            await browser.close()
            return

        # --- Test Settings Icon ---
        await page.click('#settings-icon')
        await expect(page.locator('#settings-modal')).to_be_visible()
        await page.screenshot(path='jules-scratch/verification/settings-modal.png')
        await page.click('#settings-cancel-btn')

        # --- Test Creative Assistant ---
        await page.click('.sidebar-tab:has-text("SPECIES")')
        await page.wait_for_timeout(500)
        await page.wait_for_selector('.data-table tbody tr')
        await page.click('.data-table tbody tr:first-child')
        await page.wait_for_selector('#entry-modal', state='visible')

        await page.click('#modal-data-btn')
        await page.click('text=Edit')
        await page.wait_for_timeout(500)

        await page.click('.ai-assistant-btn[data-field-key="description"]')
        await expect(page.locator('.ai-assistant-dropdown')).to_be_visible()
        await page.screenshot(path='jules-scratch/verification/creative-assistant-open.png')

        # --- Test Suggest Image Prompt ---
        page.on('dialog', lambda dialog: dialog.accept("test guidance"))
        await page.click('#modal-suggest-image-prompt-btn')
        await page.wait_for_timeout(500)
        await expect(page.locator('#custom-modal-title:has-text("Suggested Image Prompt")')).to_be_visible()
        await page.screenshot(path='jules-scratch/verification/suggest-image-prompt-modal.png')
        await page.click('#custom-modal-cancel-btn')
        await page.wait_for_timeout(200)

        # --- Test Pair-GM ---
        await page.click('#modal-cancel-btn')
        await page.click('#pair-gm-btn')
        await page.wait_for_selector('#pair-gm-modal', state='visible')
        await expect(page.locator('#persona-generator-inputs select[data-category="species"] option')).to_have_count.above(1)
        await page.screenshot(path='jules-scratch/verification/pair-gm-modal-loaded.png')

        await browser.close()

asyncio.run(main())