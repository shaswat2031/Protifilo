const { exec } = require('child_process');
exec('git status', { cwd: process.cwd() }, (err, stdout, stderr) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('stdout:', stdout);
  console.error('stderr:', stderr);
});
