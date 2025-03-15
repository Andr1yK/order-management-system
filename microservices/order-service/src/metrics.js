const promClient = require('prom-client');
const express = require('express');

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'],
  registers: [register]
});

const httpRequestDurationMs = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register]
});

const httpRequestsInProgress = new promClient.Gauge({
  name: 'http_requests_in_progress',
  help: 'Number of HTTP requests in progress',
  labelNames: ['method', 'service'],
  registers: [register]
});

/**
 * @param app {express.Express}
 * @param serviceName {string}
 */
function setupMetricsMiddleware(app, serviceName) {
  app.use((req, res, next) => {
    if (req.path === '/metrics') {
      return next();
    }

    httpRequestsInProgress.inc({ method: req.method, service: serviceName });

    const startAt = Date.now();

    res.on('finish', () => {
      const endAt =  Date.now();

      httpRequestsInProgress.dec({ method: req.method, service: serviceName });

      httpRequestsTotal.inc({
        method: req.method,
        route: req.route
          ? req.route.path
          : req.path,
        status_code: res.statusCode,
        service: serviceName,
      });

      const duration = endAt - startAt;
      httpRequestDurationMs.observe({
        method: req.method,
        route: req.route
          ? req.route.path
          : req.path,
        status_code: res.statusCode,
        service: serviceName,
      }, duration);
    });

    next();
  });

  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
}

module.exports = { setupMetricsMiddleware, register };
