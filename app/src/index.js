const express = require('express');
const client = require('prom-client');
const server = express();

const counter = require('prom-client').Counter;
const gauge = require('prom-client').Gauge;

const c = new counter({
    name: 'test_counter',
    help: 'Test Counter',
    labelNames: ['statusCode']
});

const g = new gauge({
    name: 'test_gauge',
    help: 'Test Gauge',
    labelNames: ['method', 'statusCode']
});

// cada 1 segundo incrementeamos el contador, con el label 200
setInterval(() => {
    c.inc(({ statusCode: 200 }))
}, 1000);

// PARA PROVOCAR UNA ALERTA, incrementeamos el contador cada medio segundo con el label 400
setInterval(() => {
    c.inc(({ statusCode: 400 }))
}, 500);

// 
server.get('/send', function (req, res) {
    // Llamando a este endpoint seteamos el gauge, probamos con diferentes sintaxis
    // https://github.com/siimon/prom-client#labels
    g.set({ method: 'GET', statusCode: 200 }, Math.random());
    g.set(Math.random());
    g.labels('post', '300').inc();
    res.end();
});

// registramos el endpoint en el que expondremos las métricas de Prometheus
server.get('/metrics', function (req, res) {
    res.end(client.register.metrics());
});

server.listen(8081, '0.0.0.0');