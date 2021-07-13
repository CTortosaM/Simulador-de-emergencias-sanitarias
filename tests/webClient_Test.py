# El programa debe estar en ejecución 
# para poder realizar el test
from enum import Flag
from os import system
import time
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
    var callback = arguments[arguments.length - 1]; 
    entidadesMapa.SVA[1].actualizarIsocrona(13, (res, err) => {
        if (res) {
            entidadesMapa.SVA[1].setVisibilidadIsocrona(true);
        }
        callback(res);
    })
    """
    
    return  driver.execute_async_script(js)

def test_numeroDeHabitantes(driver: WebDriver, performer: ActionChains):
    js = """
    elMapa.removeLayer(entidadesMapa.Base[3].marcador);

    return currentOverlap.marcador._icon;
    """
    performer.click(driver.execute_script(js)).perform()

def test_cargaVehiculosEnBase(driver: WebDriver, performer: ActionChains):
    js = """
    return entidadesMapa.Base[1].marcador._icon
    """
    js2 = """
    entidadesMapa.Base[1].anyadirVehiculo(entidadesMapa.SVB[0]);
    return entidadesMapa.Base[1].vehiculos.length;
    """

    performer.click(driver.execute_script(js)).perform()
    return driver.execute_script(js2)

def test_visibilidadIsocronas(driver: WebDriver):
    js = """
    let flag = false;
    entidadesMapa.SVA.forEach((sva) => {
        if (elMapa.hasLayer(sva.isocrona)) {
            flag = true;
        }
    })
    return flag;
    """
    return driver.execute_script(js)

def test_solapeIsocrona(driver: WebDriver, performer: ActionChains):
    js = """
    var callback = arguments[arguments.length - 1]; 
    entidadesMapa.SVB[3].actualizarIsocrona(10, (res, err) => {
        if (res) {
            entidadesMapa.SVB[3].setVisibilidadIsocrona(true);
            let geo = entidadesMapa.SVA[1].checkSolapeCon(entidadesMapa.SVB[3])
            currentOverlap = new Overlap(geo, elMapa);
            currentOverlap.show();
            callback(true)
        }
        callback(false)
    })"""


    return driver.execute_async_script(js)

# Testea el driver en el navegador
def test_driver(driver:WebDriver, nombreNavegador:str):

    try:
        print()
        print()
        tc = unittest.TestCase()
        driver.maximize_window()

        driver.get('http://localhost:8000/main.html')
        WebDriverWait(driver=driver, timeout=5).until(documento_cargado)
        

        print('Realizando test en {0}'.format(nombreNavegador))
        performer = ActionChains(driver=driver)

        # Carga el fichero CSV automáticamente
        inputCSV = driver.find_element(By.ID, 'ElInputDeCSV')
        rutaFichero = 'D:\Cuarto\TFG\Simulador\Datos\Datos.csv'
        
        driver.execute_script('document.getElementById("ElInputDeCSV").removeAttribute("hidden")')
        inputCSV.send_keys(rutaFichero)

        print("Comprobar que se ha cargado el grupo de bases")
        numeroDeBases = getNumeroDeBases(driver=driver)
        tc.assertEqual(numeroDeBases, 4, 'Numero de bases: '.format(numeroDeBases))

        numeroDeVehiculos = getNumeroDeVehiculos(driver=driver)
        tc.assertEqual(numeroDeVehiculos, 8, 'Faltan los vehiculos')

        print('Testeando generación de isócrona')
        tc.assertEqual(test_funcionalidadIsocrona(driver), 'Success', 'Error cargando isocrona')

        print('Testeando guardado de vehiculo en Base')
        guardadoElVehiculo = test_cargaVehiculosEnBase(driver=driver, performer=performer) == 1
        tc.assertTrue(guardadoElVehiculo, 'No ha guardado el vehiculo en la base')

        
        botonVisibilidadIsocronas = driver.find_element_by_id('botonToggleIsocronas')
        performer.click(botonVisibilidadIsocronas).perform()

        time.sleep(1)
        #test_numeroDeHabitantes(driver=driver)
        print('Testeando toggleIsocronas')
        quedaAlgunaIsocronaVisible = test_visibilidadIsocronas(driver)
        tc.assertFalse(quedaAlgunaIsocronaVisible, 'Quedan isocronas visibles tras pulsar toggleIsocrona')

        time.sleep(1)
        tc.assertTrue(test_solapeIsocrona(driver=driver, performer=performer), 'No hay solape')
        #test_numeroDeHabitantes(driver=driver, performer=performer)

        driver.quit()
    except AssertionError as error:
        print(error)

    finally:
        print()
    # Presencia de marcadores
    #marcadores = driver.find_elements_by_class_name('awesome-marker')


def documento_cargado(driver:WebDriver):
    return driver.execute_script("return DOCUMENTO_CARGADO")

driverChrome = Chrome(options=chrome_options)
test_driver(driver=driverChrome, nombreNavegador='Chrome')

driverEdge = Edge(executable_path='C:/Program Files/EdgeDriver/msedgedriver.exe')
test_driver(driver=driverEdge, nombreNavegador='Edge')
