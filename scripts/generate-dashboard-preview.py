from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import os
import time

def generate_dashboard_preview():
    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--window-size=1280,1024")
    chrome_options.add_argument("--hide-scrollbars")

    # Create driver
    driver = webdriver.Chrome(options=chrome_options)

    try:
        # Get absolute path to the HTML file
        html_path = os.path.abspath("docs/dashboard-preview.html")
        file_url = f"file://{html_path}"
        
        # Load the page
        driver.get(file_url)
        
        # Wait for any animations/loading
        time.sleep(2)
        
        # Take screenshot
        driver.save_screenshot("docs/dashboard-preview.png")
        print("Dashboard preview generated: docs/dashboard-preview.png")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    generate_dashboard_preview() 