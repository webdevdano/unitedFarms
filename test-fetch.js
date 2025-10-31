import fetch from 'node-fetch';


fetch('https://www.usdalocalfoodportal.com/api/onfarmmarket/?apikey=DOizpwByEK&x=-84&y=42&radius=30')
  .then(res => res.json())
  .then(data => {
    console.log('Success:', Array.isArray(data) ? `Received ${data.length} records` : data);
  })
  .catch(err => {
    console.error('Fetch error:', err);
  });