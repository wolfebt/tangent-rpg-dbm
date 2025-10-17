import asyncio
from playwright.async_api import async_playwright, expect
import json

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Mock the Firestore responses
        async def handle_route(route):
            if "tangent-rpg-dbm.firebaseapp.com" in route.request.url:
                await route.fulfill(status=200, body="[]")
            elif "googleapis.com" in route.request.url:
                await route.fulfill(status=200, body="{}")
            else:
                await route.continue_()

        await page.route("**/*", handle_route)


        # Construct the file path to be absolute
        import os
        folio_path = "file://" + os.path.abspath("folio.html")

        await page.goto(folio_path)

        # Wait for the appState to be initialized by the application
        await page.wait_for_function("() => window.appState && window.appState.appInitialized")

        # Inject the mocked data and then call the render function
        await page.evaluate("""() => {
            window.appState.allSpecies = [{
                "name": "Human",
                "recommended_features": ["Adaptability"],
                "id": "human-id"
            }];
            window.appState.allFeatures = [{
                "name": "Adaptability",
                "cp_cost": 3,
                "id": "adapt-id"
            }];
            window.appState.allOccupations = [];
            window.appState.allOrigins = [];
            window.appState.allFactions = [];
            window.appState.allModifiersCache = [];
            renderPersonaFolioView(document.getElementById('folio-container'), {});
        }""")

        # Set the species to "Human"
        await page.evaluate("() => { document.getElementById('char-species').value = 'Human'; }")

        # Add the recommended feature "Adaptability"
        await page.evaluate("""() => {
            const featuresInput = document.getElementById('features-data');
            featuresInput.value = JSON.stringify(['Adaptability']);
            renderItemList(document.getElementById('features-display'), ['Adaptability'], 'features');
        }""")

        # Open the economy modal to see the CP cost
        await page.click("#economy-btn")

        # Wait for the modal to appear and for the content to be populated
        await page.wait_for_selector("#economy-modal .flex.justify-between")

        # Take a screenshot of the economy modal
        await page.screenshot(path="jules-scratch/verification/folio_verification.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())