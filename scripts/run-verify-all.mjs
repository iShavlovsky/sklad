import { spawnSync } from 'node:child_process';

const steps = [
  { label: 'fix:all', command: 'npm run fix:all' },
  { label: 'lint', command: 'npm run lint' },
  { label: 'typecheck', command: 'npm run typecheck' },
  { label: 'format:check', command: 'npm run format:check' },
  { label: 'stylelint', command: 'npm run stylelint' },
];

const failedSteps = [];

for (const step of steps) {
  console.log(`\n=== verify:all :: ${step.label} ===`);

  const result = spawnSync(step.command, {
    cwd: process.cwd(),
    shell: true,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    failedSteps.push(step.label);
  }
}

if (failedSteps.length > 0) {
  console.error(`\nverify:all failed. Failed steps: ${failedSteps.join(', ')}`);
  process.exit(1);
}

console.log('\nverify:all passed.');
