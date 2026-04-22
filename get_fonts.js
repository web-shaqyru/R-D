const https = require('https');

https.get('https://online-shaqyru.kz/ru/uzatu/aq-bosaga/', (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        const fonts = data.match(/fonts\.googleapis\.com[^"']+/g);
        console.log("Google Fonts Links:", [...new Set(fonts)]);
    });
});
