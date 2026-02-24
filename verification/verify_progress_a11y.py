from playwright.sync_api import sync_playwright

def verify_progress_a11y():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000/index.html")

        # Navigate to Judicial Control to see the progress bar
        # Use exact match for the tab button
        page.get_by_role("button", name="Controle Judicial", exact=True).click()

        # Wait for the progress bar
        progress_bar = page.locator("#jcProgressBar")

        # Assert ARIA attributes
        role = progress_bar.get_attribute("role")
        valuenow = progress_bar.get_attribute("aria-valuenow")
        valuemin = progress_bar.get_attribute("aria-valuemin")
        valuemax = progress_bar.get_attribute("aria-valuemax")
        labelledby = progress_bar.get_attribute("aria-labelledby")

        print(f"Role: {role}")
        print(f"Value Now: {valuenow}")
        print(f"Value Min: {valuemin}")
        print(f"Value Max: {valuemax}")
        print(f"Labelled By: {labelledby}")

        if role != "progressbar":
            print("FAIL: role is not progressbar")
        if valuenow != "25":
            print("FAIL: aria-valuenow is not 25")
        if valuemin != "0":
            print("FAIL: aria-valuemin is not 0")
        if valuemax != "100":
            print("FAIL: aria-valuemax is not 100")
        if labelledby != "jcProgressLabel":
            print("FAIL: aria-labelledby is not jcProgressLabel")

        # Take screenshot of the progress bar section
        # Wait for the section to be visible
        page.locator("#judicialControlSection").wait_for()
        page.locator(".jc-progress-wrap").screenshot(path="verification/progress_bar.png")

        browser.close()

if __name__ == "__main__":
    verify_progress_a11y()
