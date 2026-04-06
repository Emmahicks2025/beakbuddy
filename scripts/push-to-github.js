const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

async function push() {
    const dir = path.resolve(__dirname, '..');
    const url = process.argv[2]; // GitHub Repo URL
    const token = process.argv[3]; // GitHub Personal Access Token

    if (!url || !token) {
        console.error('Usage: node scripts/push-to-github.js <REPO_URL> <TOKEN>');
        process.exit(1);
    }

    try {
        console.log('Initializing repository...');
        await git.init({ fs, dir });

        console.log('Adding files...');
        // Add all files except those in .gitignore (simplified)
        const files = fs.readdirSync(dir).filter(f => !['node_modules', '.git', '.expo'].includes(f));
        for (const file of files) {
            await git.add({ fs, dir, filepath: file });
        }

        console.log('Committing changes...');
        await git.commit({
            fs,
            dir,
            author: { name: 'Super Developer', email: 'dev@example.com' },
            message: 'Prepare project for GitHub Actions build'
        });

        console.log('Pushing to GitHub...');
        await git.push({
            fs,
            http,
            dir,
            remote: 'origin',
            ref: 'main',
            url: url,
            onAuth: () => ({ username: token })
        });

        console.log('Successfully pushed to GitHub!');
    } catch (err) {
        console.error('Error:', err);
    }
}

push();
