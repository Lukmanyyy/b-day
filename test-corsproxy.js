import https from 'https';

https.get('https://api.allorigins.win/raw?url=https%3A%2F%2Fdrive.usercontent.google.com%2Fdownload%3Fid%3D1BPFNdE9-1nA9Xm-TNCbaKRRtAboD4XRX%26export%3Ddownload', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
});
