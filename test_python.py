import os, sys
key = "TEST_KEY_123"
content = '''// AUTO-GENERATED at build time — gitignored, never committed.
export const ENV = {
    GEMINI_API_KEY: \'''' + key + '''\',
    FIREBASE_API_KEY: \'AIzaSyAR358ih2f3iH_YwL9XMnpB7q-iCauhJto\',
    GOOGLE_WEB_CLIENT_ID: \'15460675966-dbcoafo2h8n1be48u3kll9kp5cfr9ok5.apps.googleusercontent.com\',
};
'''
print(content)
