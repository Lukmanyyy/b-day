import https from 'https';
https.get('https://drive.google.com/uc?export=download&id=1BPFNdE9-1nA9Xm-TNCbaKRRtAboD4XRX', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
});
