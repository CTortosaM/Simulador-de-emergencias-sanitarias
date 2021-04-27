# El programa debe estar en ejecución 
# para poder realizar el test

from selenium.webdriver import Chrome, Firefox, Edge, ActionChains
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.firefox.webdriver import WebDriver
chrome_options = Options()
chrome_options.add_experimental_option("detach", True)

# Testea el driver en el navegador
def test_driver(driver:WebDriver, nombreNavegador:str):
    driver.get('http://localhost:8000/main.html')
    
    #Botón isocronas
    botonToggleIsocronas = driver.find_element_by_id('botonToggleIsocronas')

    # Presencia de marcadores
    marcadores = driver.find_elements_by_class_name('awesome-marker')
    assert marcadores.__len__() > 100, 'No se han encontrado marcadores en la página'

# Instancia navegadores
with Chrome() as driverChrome:
    test_driver(driver=driverChrome, nombreNavegador='Chrome')

with Firefox() as driverFirefox:
    test_driver(driver=driverFirefox, nombreNavegador='Firefox')

with Edge() as driverEdge:
    test_driver(driver=driverEdge)
