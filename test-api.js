
const apiKey = 'AIzaSyDZ8Cm7sNY_Zw3qpC96xqKA9lO2NS1uwyE';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

async function testKey() {
    console.log('Testing Gemini 2.0 Flash Model...');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Hello! Can you help me take care of my parrot?' }] }],
                system_instruction: {
                    parts: [{ text: 'You are a helpful parrot care assistant.' }]
                },
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                }
            })
        });

        const data = await response.json();
        if (response.ok) {
            console.log('✅ SUCCESS! AI Response:');
            console.log(data.candidates[0].content.parts[0].text);
        } else {
            console.log('❌ FAILED');
            console.log('Status:', response.status);
            console.log('Error:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.log('❌ NETWORK ERROR');
        console.error(err);
    }
}

testKey();
