from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:8000/folio.html")

    # Wait for the app to be fully initialized by waiting for a key element to appear
    page.wait_for_function("document.querySelector('#skills-list .skill-group-header')")

    # Click the 'Skills' tab and take a screenshot
    page.get_by_role("button", name="Skills").click()
    skills_tab_content = page.locator("#skills-tab")
    expect(skills_tab_content.locator("#skills-list")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/skills_tab.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
