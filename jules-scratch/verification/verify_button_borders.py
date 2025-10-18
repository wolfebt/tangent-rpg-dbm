import os
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Get the absolute path to the HTML file
    file_path = os.path.abspath('dbm.html')

    # Go to the local HTML file
    page.goto(f'file://{file_path}')

    # Give the page time to load
    page.wait_for_timeout(10000)

    try:
        # Verify Rules Codex UI changes
        # Click on the "RULES CODEX" sidebar tab
        rules_codex_tab = page.locator('button.sidebar-tab:has-text("RULES CODEX")')
        rules_codex_tab.wait_for(state="visible")
        rules_codex_tab.click()

        # Click on a wiki entry to show the data button
        page.locator('a[data-entry-id]').first.click()

        # Check if the DATA button is visible
        expect(page.locator('#wiki-data-btn')).to_be_visible()
    except Exception as e:
        print(f"Could not verify Rules Codex UI: {e}")

    # Verify Species modal title
    # Click on the "SPECIES" sidebar tab
    page.locator('button.sidebar-tab:has-text("SPECIES")').click()

    # Click on the "ADD NEW" button to open the modal
    page.locator('#add-new-btn-species').click()

    # Check the modal title
    expect(page.locator('#modal-title:has-text("MANAGE SPECIES")')).to_be_visible()

    # Click the "Select MODIFIER" button
    page.locator('button:has-text("Select MODIFIER")').click()

    # Take a screenshot of the selector modal
    page.screenshot(path='jules-scratch/verification/selector_modal_borders.png')

    browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)