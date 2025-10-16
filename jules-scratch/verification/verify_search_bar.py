from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the local file and increase timeout
    page.goto("file:///app/dbm.html")
    page.set_default_timeout(60000)

    # Wait for the initial content to load, then click the "SPECIES" button
    page.wait_for_selector('//button[text()="USER GUIDE"]')
    page.click('//button[text()="SPECIES"]')

    # Wait for the search input to be visible
    page.wait_for_selector('input[placeholder="Search by name..."]')

    # Take a screenshot to verify the search bar is initially empty
    page.screenshot(path="jules-scratch/verification/search-bar-verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)