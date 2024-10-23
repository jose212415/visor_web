import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import './App.css'; // Importamos el estilo CSS

const SensorData = () => {
  const [sensorData, setSensorData] = useState({
    lux: '---',
    tempAHT20: '---',
    humidity: '---',
    tempBMP280: '---',
    pressure: '---',
  });

  const [message, setMessage] = useState('');
  const [client, setClient] = useState(null); // Estado para almacenar el cliente MQTT

  useEffect(() => {
    // Conectarse al broker MQTT y guardarlo en el estado
    const mqttClient = mqtt.connect('wss://test.mosquitto.org:8081/mqtt');
    setClient(mqttClient); // Almacena el cliente en el estado

    mqttClient.on('connect', () => {
      console.log('Conectado a MQTT');
      mqttClient.subscribe('sensor/data', (err) => {
        if (!err) {
          console.log("Suscripción exitosa al tópico 'sensor/data'");
        } else {
          console.log("Error al suscribirse al tópico: ", err);
        }
      });
    });

    mqttClient.on('message', (topic, message) => {
      const data = message.toString();
      console.log('Mensaje recibido:', data);

      // Verificar el formato del mensaje antes de procesarlo
      if (data.includes('Luz') && data.includes('Temp AHT20') && data.includes('Humedad') && data.includes('Temp BMP280') && data.includes('Presión')) {
        // Dividir el mensaje por "|"
        const [lux, tempAHT20, humidity, tempBMP280, pressure] = data.split('|').map(item => item.split(': ')[1].trim());
        setSensorData({ lux, tempAHT20, humidity, tempBMP280, pressure });
      } else {
        console.error("Formato de mensaje incorrecto:", data);
      }
    });

    return () => {
      mqttClient.end(); // Cierra la conexión al desmontar el componente
    };
  }, []);

  return (
    <div className="container">
      <h1>Datos del Sensor</h1>
      <div className="sensor-card">
        <p><span className="label">Nivel Luz:</span> {sensorData.lux}</p>
        <p><span className="label">Temperatura AHT20:</span> {sensorData.tempAHT20}</p>
        <p><span className="label">Humedad:</span> {sensorData.humidity}</p>
        <p><span className="label">Temperatura BMP280:</span> {sensorData.tempBMP280}</p>
        <p><span className="label">Presión:</span> {sensorData.pressure}</p>
      </div>
    </div>
  );
};

export default SensorData;
