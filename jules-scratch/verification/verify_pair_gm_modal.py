import os
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Get the absolute path to the HTML file
        absolute_path = os.path.abspath("dbm.html")
        page.goto(f"file://{absolute_path}")

        # Wait for the appState to be available on the window object
        page.wait_for_function("() => window.appState", timeout=60000)

        # Manually trigger the application setup
        page.evaluate("""() => {
            window.appState.isAnonymous = false;
            window.appState.userRole = 'contributor';
            window.appState.userId = 'test-user-123';
            window.appState.authReady = true;
            window.renderAppHeader();
            window.navigateTo({ view: 'renderCategoryView', args: ['species'] }, false);
        }""")

        # Open the Pair-GM modal
        page.locator("#pair-gm-btn").click()
        pair_gm_modal = page.locator("#pair-gm-modal")
        expect(pair_gm_modal).to_be_visible()

        # Verify the new "Close" button is visible
        close_button = page.locator("#pair-gm-close-btn")
        expect(close_button).to_be_visible()

        # Enter some text into a textarea
        page.locator("#persona-user-guidance").fill("Test input")

        # Attempt to close the modal
        close_button.click()

        # Verify that the confirmation modal appears
        confirmation_modal = page.locator("#confirm-modal")
        expect(confirmation_modal).to_be_visible()
        expect(page.locator("#confirm-message")).to_have_text("You have unsaved changes in the Pair-GM assistant. Are you sure you want to close it?")

        # Take a screenshot of the confirmation modal
        page.screenshot(path="jules-scratch/verification/verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)