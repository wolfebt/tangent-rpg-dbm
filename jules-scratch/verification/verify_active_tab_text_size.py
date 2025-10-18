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

    # Click on the "SPECIES" sidebar tab to make it active
    page.locator('button.sidebar-tab:has-text("SPECIES")').click()

    # Take a screenshot of the main page to show the active tab
    page.screenshot(path='jules-scratch/verification/active_tab_text_size.png')

    browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)