const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'public', 'models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
    console.log('✅ Created models directory');
}

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const models = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2',
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2'
];

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function downloadModels() {
    console.log('📦 Downloading face-api.js models...\n');

    let downloaded = 0;
    let failed = 0;

    for (const model of models) {
        const url = `${baseUrl}/${model}`;
        const dest = path.join(modelsDir, model);

        process.stdout.write(`  Downloading ${model}...`);

        try {
            await downloadFile(url, dest);
            console.log(' ✅');
            downloaded++;
        } catch (error) {
            console.log(' ❌');
            console.log(`    Error: ${error.message}`);
            failed++;
        }
    }

    console.log('\n📊 Download Summary:');
    console.log(`  ✅ Downloaded: ${downloaded} files`);
    console.log(`  ❌ Failed: ${failed} files`);

    if (failed === 0) {
        console.log('\n🎉 All models downloaded successfully!');
        console.log(`   Models location: ${modelsDir}`);
    } else {
        console.log('\n⚠️  Some models failed to download. Please check your internet connection.');
    }
}

downloadModels();
