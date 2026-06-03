const http = require('http');

http.get('http://127.0.0.1:3000/api/content', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('API Response Profile Contact:', json.data?.profile?.contact);
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
      console.log('Response content was:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('Fetch error:', err.message);
});
