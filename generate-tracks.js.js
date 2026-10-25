// generate-tracks.js
// Запускать: node generate-tracks.js
// Создаёт tracks.json на основе папки music/

const fs = require('fs');
const path = require('path');

const MUSIC_DIR = './music';
const OUTPUT = './tracks.json';
const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|flac|aac)$/i;

const tracks = [];

function scan(dir, genre) {
  let items;
  try { items = fs.readdirSync(dir, { withFileTypes: true }); }
  catch (e) { return; }

  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      // Папка = жанр. Если мы в корне music/ — определяем жанр по имени папки.
      // Если уже внутри жанра — оставляем его.
      const nextGenre = genre || capitalize(item.name);
      scan(full, nextGenre);
    } else if (AUDIO_EXT.test(item.name)) {
      const raw = item.name.replace(/\.[^.]+$/, '');

      // Парсим "Artist - Title" если есть
      let artist = '';
      let title = raw;
      if (raw.includes(' - ')) {
        const parts = raw.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }

      // Чистим название от подчёркиваний и дефисов
      title = title.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
      artist = artist.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();

      tracks.push({
        src: path.relative('.', full).replace(/\\/g, '/'),
        name: title,
        artist: artist,
        genre: genre || 'Default'
      });
    }
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

console.log('Scanning music/ ...');
scan(MUSIC_DIR, null);

tracks.sort((a, b) => a.genre.localeCompare(b.genre) || a.name.localeCompare(b.name));

fs.writeFileSync(OUTPUT, JSON.stringify(tracks, null, 2));

const byGenre = {};
tracks.forEach(t => { byGenre[t.genre] = (byGenre[t.genre] || 0) + 1; });

console.log(`\n✅ Готово: ${tracks.length} треков → ${OUTPUT}`);
console.log('\nПо жанрам:');
Object.entries(byGenre).forEach(([g, c]) => console.log(`  ${g}: ${c}`));