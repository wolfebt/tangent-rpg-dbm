from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("file:///app/dbm.html")

        # Navigate to the species view directly
        page.goto("file:///app/dbm.html#species")

        # Wait for the table to load
        page.wait_for_selector("table.data-table tbody tr", timeout=60000)

        # Open a species entry to get to the modal
        page.click("table.data-table tbody tr:first-child")
        page.wait_for_selector("#modal-title")

        # Open the AI Assistant
        page.click("#modal-ai-assist-btn")
        page.wait_for_selector("#ai-assistant-modal")

        # Take a screenshot of the AI assistant modal
        page.screenshot(path="jules-scratch/verification/ai_assistant_modal.png")

        browser.close()

if __name__ == "__main__":
    run()