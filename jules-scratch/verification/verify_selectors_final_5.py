from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:8000/dbm.html", wait_until="networkidle")

    # Manually log in and enable dev mode in the browser before running this script

    # Click on Species
    page.click('button:has-text("SPECIES")')

    # Click on "ADD NEW"
    page.click("#add-new-btn-species")

    # Open feature selector
    page.click('input[data-field-key="features"]')
    page.wait_for_selector("#selector-modal")
    page.screenshot(path="jules-scratch/verification/feature-selector.png")

    # Close feature selector
    page.click("#selector-cancel-btn")

    # Open skill selector
    page.click('input[data-field-key="skills"]')
    page.wait_for_selector("#selector-modal")
    page.screenshot(path="jules-scratch/verification/skill-selector.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)