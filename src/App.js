import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import './App.css'; // Importamos el estilo CSS

const SensorData = () => {
  const [sensorData, setSensorData] = useState({
    pressure: '---',
    temperature: '---',
    humidity: '---',
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
      if (data.includes('Pressure') && data.includes('Temperature') && data.includes('Humidity')) {
        const [pressure, temperature, humidity] = data.split(', ').map((item) => item.split(': ')[1]);
        setSensorData({ pressure, temperature, humidity });
      } else {
        console.error("Formato de mensaje incorrecto:", data);
      }
    });

    return () => {
      mqttClient.end(); // Cierra la conexión al desmontar el componente
    };
  }, []);

  // Función para enviar el texto al broker MQTT
  const sendMessage = () => {
    if (client) { // Asegurarse de que el cliente está conectado antes de publicar
      client.publish('lcd/data', message);  // Publicar el mensaje en el tópico 'lcd/data'
      console.log(`Mensaje publicado: ${message}`);
      setMessage('');  // Limpiar el campo de entrada después de enviar el mensaje
    } else {
      console.log("Cliente MQTT no está conectado aún");
    }
  };

  return (
    <div className="container">
      <h1>Datos del Sensor</h1>
      <div className="sensor-card">
        <p><span className="label">Presión:</span> {sensorData.pressure} hPa</p>
        <p><span className="label">Temperatura:</span> {sensorData.temperature} °C</p>
        <p><span className="label">Humedad:</span> {sensorData.humidity} %</p>
      </div>
      <div className="message-section">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}  // Almacena el texto escrito
          placeholder="Escribe tu mensaje"
          className="input-message"
        />
        <button onClick={sendMessage} className="btn-send">Enviar mensaje</button>  {/* Botón para enviar */}
      </div>
    </div>
  );
};

export default SensorData;
