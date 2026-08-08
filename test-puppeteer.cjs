const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <audio id="audio" controls src="https://drive.usercontent.google.com/download?id=1BPFNdE9-1nA9Xm-TNCbaKRRtAboD4XRX&export=download"></audio>
      <script>
        const audio = document.getElementById('audio');
        audio.onerror = (e) => console.log('Audio Error:', audio.error ? audio.error.code : 'unknown');
        audio.oncanplay = () => console.log('Audio can play!');
      </script>
    </body>
    </html>
  `);
  
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})();
