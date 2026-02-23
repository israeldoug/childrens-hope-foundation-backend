const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = './Images';
const files = fs.readdirSync(dir);

async function resize() {
    let processed = 0;
    for (const file of files) {
        if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;
        
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        // Resize images larger than 250KB
        if (stats.size > 250000) {
            console.log(`Optimizing ${file} (${Math.round(stats.size / 1024)}KB)`);
            const tempPath = filePath + '.tmp';
            try {
                // Resize to max width 800px, keeping aspect ratio without enlarging
                await sharp(filePath)
                    .resize({ width: 800, withoutEnlargement: true })
                    .toFile(tempPath);
                
                fs.renameSync(tempPath, filePath);
                processed++;
            } catch (err) {
                console.error(`Failed to process ${file}:`, err);
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            }
        }
    }
    console.log(`\nFinished optimizing ${processed} images.`);
}

resize();
