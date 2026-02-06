const https = require('https');

const data = JSON.stringify({
    event: "manual_test_complete",
    step_0: "Eu não sei qual minha pontuação",
    phone: "48991553467",
    cpf: "14871704670",
    image_data: "data:image/webp;base64,UklGRkK1AABXRUJQVlA4IDa1AAAw5wOdASqbBOYGPlEokUajoqGhoRNYuHAKCWlu/DWztsNHv/8/4U/9+7XuaKfFHvilS1RZdx6uAlReriE6M5UDbtYGU1U+KFm3awMpqp/nlMCjCIMow5lKToKe4ZdSwd/Mk94sa9fVT4oWbdrAymqnxQs27WBlNVPihZ27WBlNVPihZt2sDKaqfFCzbtYGU1U+KFm3awMpqp",
});

const options = {
    hostname: 'n8n.araxa.app',
    port: 443,
    path: '/webhook-test/fluxo',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
    },
};

const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    let responseBody = '';
    res.on('data', (d) => {
        responseBody += d;
    });
    res.on('end', () => {
        console.log('Resposta:', responseBody);
    });
});

req.on('error', (error) => {
    console.error('Erro:', error);
});

req.write(data);
req.end();
