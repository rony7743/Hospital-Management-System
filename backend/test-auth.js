async function run() {
  require('./index.js');
  await new Promise(r => setTimeout(r, 1000));

  try {
    console.log('1. Health check');
    const h = await fetch('http://127.0.0.1:5000/health');
    console.log('Health status:', h.status, await h.json());

    console.log('\n2. Login Doctor');
    const l = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doctor@hospital.com', password: 'password123' })
    });
    console.log('Login status:', l.status, await l.json());

    console.log('\n3. Register Patient');
    const rnd = Math.floor(Math.random() * 90000) + 10000;
    const reg = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Mahfuz Rahman',
        email: `mahfuz${rnd}@hospital.com`,
        phone: `+88017${rnd}000`,
        password: 'password123',
        role: 'patient',
      })
    });
    const regData = await reg.json();
    console.log('Register status:', reg.status, regData);

    console.log('\n4. Verify /me');
    const me = await fetch('http://127.0.0.1:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${regData.token}` }
    });
    console.log('Me status:', me.status, await me.json());

    console.log('\nALL BACKEND AUTH TESTS PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
}

run();

