const fs = require('fs');
let content = fs.readFileSync('src/components/GalleryProjects.jsx', 'utf8');
content = content.split('\\`').join('`');
content = content.split('\\$').join('$');
fs.writeFileSync('src/components/GalleryProjects.jsx', content);
console.log('Fixed syntax errors.');
