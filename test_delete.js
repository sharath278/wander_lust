const axios = require('axios');
const http = require('http');

async function run() {
    try {
        // 1. Setup session cookies manually
        const client = axios.create({
            baseURL: 'http://localhost:8080',
            validateStatus: () => true, // Don't throw on error status
        });

        // We need to keep track of cookies (connect.sid)
        let cookie = '';

        // 2. Signup
        let res = await client.post('/signup', 'username=userdel3&email=userdel3@test.com&password=pass', {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');

        // 3. Create listing
        res = await client.post('/listings', 'title=Test&description=Test&imageurl=http://example.com/img.png&price=10&location=test&country=test', {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': cookie }
        });

        // The res should be 302 redirect. Fetch listings to get ID.
        res = await client.get('/listings', { headers: { 'Cookie': cookie } });
        const match = res.data.match(/\/listings\/([a-f0-9]{24})/);
        if (!match) {
            console.log('No listing created');
            return;
        }
        const id = match[1];
        console.log('Created listing ID:', id);

        // 4. Test delete route
        res = await client.post(`/listings/${id}?_method=DELETE`, '', {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': cookie }
        });
        console.log('Delete status:', res.status);
        console.log('HTML contains Oops?', res.data.includes('Oops'));
        if (res.status !== 302) {
            const fs = require('fs');
            fs.writeFileSync('del_error.html', res.data);
            console.log('Saved del_error.html');
        }

    } catch (e) {
        console.log('Script Error:', e.message);
    }
}

run();
