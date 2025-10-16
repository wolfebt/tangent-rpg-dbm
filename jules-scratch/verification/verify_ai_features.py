import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto('http://localhost:8000/dbm.html')

        # Increase the default timeout and add a small delay
        page.set_default_timeout(60000)
        await page.wait_for_timeout(1000)

        # Wait for the table to load
        await page.wait_for_selector('.data-table tbody tr')

        # Open the first species entry
        await page.click('.data-table tbody tr:first-child')
        await page.wait_for_selector('#entry-modal', state='visible')

        # Open the modal in edit mode
        await page.click('#modal-data-btn')
        await page.click('text=Edit')
        await page.wait_for_timeout(500) # Wait for modal to re-render

        # Click the AI Assistant button
        await page.click('.ai-assistant-btn')
        await page.wait_for_selector('.ai-assistant-dropdown', state='visible')
        await page.screenshot(path='jules-scratch/verification/creative-assistant-dropdown.png')

        # Close the entry modal
        await page.click('#modal-cancel-btn')
        await page.wait_for_selector('#entry-modal', state='hidden')

        # Open the Pair-GM modal
        await page.click('#pair-gm-btn')
        await page.wait_for_selector('#pair-gm-modal', state='visible')
        await page.screenshot(path='jules-scratch/verification/pair-gm-modal.png')

        await browser.close()

asyncio.run(main())