from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:8000/dbm.html")

    # Wait for the app to load
    page.wait_for_selector("#app-sidebar")

    # The login process is not working in the test environment.
    # We will assume the user is logged in and dev mode is enabled.

    # Click on Species
    page.click('button:has-text("SPECIES")')

    # Click on "ADD NEW"
    page.click("#add-new-btn-species")

    # Open feature selector
    page.click('input[onclick*="openFeatureSelectorModal"]')
    page.wait_for_selector("#feature-selector-modal")
    page.screenshot(path="jules-scratch/verification/feature-selector.png")

    # Close feature selector
    page.click("#feature-selector-cancel-btn")

    # Open skill selector
    page.click('input[onclick*="openSkillSelectorModal"]')
    page.wait_for_selector("#skill-selector-modal")
    page.screenshot(path="jules-scratch/verification/skill-selector.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)