import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        game: resolve(__dirname, 'game.html'),
        season01: resolve(__dirname, 'season-01.html'),
        world: resolve(__dirname, 'world.html'),
        people: resolve(__dirname, 'people.html'),
        wildlife: resolve(__dirname, 'wildlife.html'),
        equipment: resolve(__dirname, 'equipment.html'),
        news: resolve(__dirname, 'news.html'),
        community: resolve(__dirname, 'community.html'),
        contribute: resolve(__dirname, 'contribute.html'),
        joinUs: resolve(__dirname, 'join-us.html'),
        media: resolve(__dirname, 'media.html'),
        about: resolve(__dirname, 'about.html'),
        play: resolve(__dirname, 'play.html'),
      },
    },
  },
});
