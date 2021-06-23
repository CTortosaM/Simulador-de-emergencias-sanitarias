import csv
import json

def getDatos(tipoDeVehiculo='SVA'):

    try:
        with open('./Datos/Datos.json') as f:
            data = json.load(f)
            return data
    except (KeyError, TypeError, ValueError) as error:
      return 'Error'



losDatos = getDatos('SVA')
losSVA = losDatos['SVA']
losSVB = losDatos['SVB']

with open('./Datos/Datos.csv', mode='w', newline='') as vehiculos_file:
    fieldnames = ['Lat', 'Lng', 'Descripcion', 'Disponibilidad', 'Tipo']
    vehiculos_writer = csv.DictWriter(vehiculos_file, fieldnames=fieldnames, delimiter=',')

    vehiculos_writer.writeheader()

    for sva in losSVA:
        sva['Tipo'] = 'SVA'
        vehiculos_writer.writerow(sva)

    for svb in losSVB:
        svb['Tipo'] = 'SVB'
        vehiculos_writer.writerow(svb)

# Ahora voy a volver a montar los objetos
with open('./Datos/Datos.csv', mode='r') as vehiculos_file:
    csv_reader = csv.DictReader(vehiculos_file)

    sva = []
    svb = []
    vehiculos = {'SVA': sva, 'SVB': svb}
    line_count = 0
    for row in csv_reader:
        if len(row) > 1 and line_count > 0:
            if row['Tipo'] == 'SVA':
                sva.append(row)
            else:
                svb.append(row)
        line_count += 1
        
    print(json.dumps(vehiculos))