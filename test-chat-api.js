const https = require('https');

// The exact key from the user's config
const API_KEY = "AIzaSyArSX4nkc0B-tQa5gsNdDI6e1hhvR3NKuY";

const url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;

console.log(`Listing Available Models...`);

const req = https.get(url, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log(`\nStatus Code: ${res.statusCode}`);
        try {
            const json = JSON.parse(responseBody);
            if (res.statusCode === 200 && json.models) {
                console.log("✅ AVAILABLE MODELS:");
                json.models.forEach(m => {
                    if (m.name.includes('gemini')) {
                        console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
                    }
                });
            } else {
                console.log("❌ FAILURE");
                console.error("Error Details:", JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.log("Raw Response:", responseBody);
        }
    });
});

req.on('error', (error) => {
    console.error("Network Error:", error);
});
