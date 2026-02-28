from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://127.0.0.1:8000/index.html")

        # Ensure simulator mode is active to click btnPadraoHelp
        page.locator("button[data-mode='simulador']").click()
        page.locator("#btnPadraoHelp").click()
        page.wait_for_selector("#simHelpCloseBtn")

        # Hover the close button
        page.locator("#simHelpCloseBtn").hover()
        page.screenshot(path="verification/hover_sim_help_close.png")

        # Close the popover
        page.locator("#simHelpCloseBtn").click()

        # Switch to controle mode
        page.locator("button[data-mode='controle']").click()

        # We need to fill something to make btnLimparControleJudicial visible? It's always in the DOM but check visibility.
        page.locator("#btnLimparControleJudicial").wait_for(state="visible")
        page.locator("#btnLimparControleJudicial").hover()
        page.screenshot(path="verification/hover_btn_red.png")

        # Dark mode red button
        page.locator("#toggleDark").check()
        page.locator("#btnLimparControleJudicial").hover()
        page.screenshot(path="verification/hover_btn_red_dark.png")

        browser.close()

if __name__ == "__main__":
    verify()
