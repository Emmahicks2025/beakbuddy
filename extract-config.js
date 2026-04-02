const fs = require('fs');
const path = 'dist/_expo/static/js/web/AppEntry-eb8d859bac22ba304e8498af28d9db6d.js';
try {
    const content = fs.readFileSync(path, 'utf8');
    const target = '452578545648';
    const index = content.indexOf(target);
    if (index >= 0) {
        console.log('CONTEXT START ---');
        console.log(content.substring(Math.max(0, index - 500), Math.min(content.length, index + 500)));
        console.log('--- CONTEXT END');
    } else {
        console.log('String not found');
    }
} catch (e) {
    console.error(e.message);
}
