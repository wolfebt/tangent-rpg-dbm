import os
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the local server
    page.goto("http://localhost:8000/dbm.html")

    # Wait for authentication to be ready
    page.wait_for_function("window.appState && window.appState.authReady")

    # Set user role to owner to enable dev mode
    page.evaluate("window.appState.userRole = 'owner'")
    page.evaluate("window.updateUIAfterAuthChange()")

    # Open the "Rules Codex" view
    page.click('button:has-text("RULES CODEX")')

    # Enable DEV MODE
    page.click('label[for="mode-toggle-checkbox"]')

    # Click the "Add New Entry" button
    page.click('button#add-wiki-entry-btn')

    # Take a screenshot of the modal
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
