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

        # 2. Verify PAIR-GM button is in the new location (next to settings)
        settings_icon = page.locator("#settings-icon")
        pair_gm_button = page.locator("#pair-gm-btn")

        # Check that PAIR-GM is visible and near the settings icon
        expect(pair_gm_button).to_be_visible(timeout=10000)
        settings_box = settings_icon.bounding_box()
        pair_gm_box = pair_gm_button.bounding_box()

        # A simple check to see if they are roughly in the same y-position and on the left side of the screen
        assert abs(settings_box['y'] - pair_gm_box['y']) < 20, "PAIR-GM button is not vertically aligned with settings."
        assert pair_gm_box['x'] < page.viewport_size['width'] / 2, "PAIR-GM button is not on the left side."

        # 3. Verify the mode toggle is visible
        mode_toggle = page.locator("#mode-toggle-container")
        expect(mode_toggle).to_be_visible()

        # 4. Initially, "ADD NEW" should be hidden (GAME MODE)
        add_new_button = page.locator("#add-new-btn-species")
        expect(add_new_button).to_be_hidden()

        # 5. Toggle to DEV MODE and check that "ADD NEW" is visible
        mode_toggle_checkbox = page.locator("#mode-toggle-checkbox")
        mode_toggle_checkbox.check()
        expect(add_new_button).to_be_visible()

        # 6. Toggle back to GAME MODE and check that "ADD NEW" is hidden again
        mode_toggle_checkbox.uncheck()
        expect(add_new_button).to_be_hidden()

        # 7. Take a screenshot of the final state (GAME MODE with toggle visible)
        page.screenshot(path="jules-scratch/verification/verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)