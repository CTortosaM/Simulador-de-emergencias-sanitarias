# El programa debe estar en ejecución 
# para poder realizar el test
import selenium
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

from selenium.webdriver import Chrome, Firefox, Edge, ActionChains
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.firefox.webdriver import WebDriver
from selenium.common.exceptions import JavascriptException
import unittest

chrome_options = Options()
chrome_options.add_experimental_option("detach", True)
chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

def getNumeroDeBases(driver: WebDriver):
    result = None
    js = """
    const numeroDeBases = entidadesMapa;
    return numeroDeBases.Base.length;
    """
    try:
        result = driver.execute_script(js)
    except JavascriptException as jsError:
        print(jsError)

    finally:
        return result

def getNumeroDeVehiculos(driver: WebDriver):
    result = None
    js1 = "return entidadesMapa.SVA.length;"
    js2 = "return entidadesMapa.SVB.length;"
    try:
        result1 = int(driver.execute_script(js1))
        result2 = int(driver.execute_script(js2))

        result = result1 + result2
    except JavascriptException as jsError:
        print(jsError)

    finally:
        return result


def test_funcionalidadIsocrona(driver: WebDriver):
    js = """
    entidadesMapa.SVA[0].actualizarIsocrona(5, ((succ, fail) => {
        entidadesMapa.SVA[0].setVisibilidadIsocrona(true);
    }));
    """

    driver.execute_script(js)

# Testea el driver en el navegador
def test_driver(driver:WebDriver, nombreNavegador:str):

    tc = unittest.TestCase()

    driver.get('http://localhost:8000/main.html')
    WebDriverWait(driver=driver, timeout=5).until(documento_cargado)

    print('Realizando test en {0}'.format(nombreNavegador))
    performer = ActionChains(driver=driver)

    inputCSV = driver.find_element(By.ID, 'ElInputDeCSV')
    rutaFichero = 'D:\Cuarto\TFG\Simulador\Datos\Datos.csv'
    
    driver.execute_script('document.getElementById("ElInputDeCSV").removeAttribute("hidden")')
    inputCSV.send_keys(rutaFichero)
    #accionClick.click(on_element=botonCargarFicheroCSV).perform()

    numeroDeBases = getNumeroDeBases(driver=driver)
    tc.assertEqual(numeroDeBases, 4, 'Numero de bases: '.format(numeroDeBases))

    numeroDeVehiculos = getNumeroDeVehiculos(driver=driver)
    tc.assertEqual(numeroDeVehiculos, 8, 'Faltan los vehiculos')

    test_funcionalidadIsocrona(driver=driver)

    driver.quit()

    # Presencia de marcadores
    #marcadores = driver.find_elements_by_class_name('awesome-marker')


def documento_cargado(driver:WebDriver):
    return driver.execute_script("return DOCUMENTO_CARGADO")

driverChrome = Chrome(options=chrome_options)
test_driver(driver=driverChrome, nombreNavegador='Chrome')

driverEdge = Edge(executable_path='C:/Program Files/EdgeDriver/msedgedriver.exe')
test_driver(driver=driverEdge, nombreNavegador='Edge')
