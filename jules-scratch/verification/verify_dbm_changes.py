import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Construct the file path to be absolute
        import os
        dbm_path = "file://" + os.path.abspath("dbm.html")

        await page.goto(dbm_path)

        # Wait for the app to initialize
        await page.wait_for_selector("#app-sidebar .sidebar-tab")

        # Set user role to admin to make the dev toggle container potentially visible
        await page.evaluate("() => { window.appState.userRole = 'admin'; }")

        # Re-render the UI by navigating to a tab. This should show the dev toggle container.
        await page.click('button:has-text("User Guide")')

        # Click the dev mode toggle's label to enable it. This triggers another re-render.
        dev_mode_label = page.locator("#mode-toggle-container label")
        await expect(dev_mode_label).to_be_visible()
        await dev_mode_label.click()

        # Now that dev mode is on, navigate to the species tab
        await page.click('button:has-text("SPECIES")')

        # The "ADD NEW" button should now be visible
        add_new_button = page.locator('button:has-text("ADD NEW")')
        await expect(add_new_button).to_be_visible()
        await add_new_button.click()

        # Wait for the modal to appear
        await page.wait_for_selector("#entry-modal")

        # Scroll to the "Recommended Features" field to ensure it's in view
        recommended_features_label = page.locator('label:has-text("RECOMMENDED FEATURES")')
        await recommended_features_label.scroll_into_view_if_needed()

        # Give a little time for scrolling to settle
        await page.wait_for_timeout(500)

        # Take a screenshot of the modal
        await page.screenshot(path="jules-scratch/verification/dbm_verification.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())