const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.send('Hello from CI/CD lab 👋');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'ci-cd-lab-app' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
