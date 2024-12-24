import execa from 'execa';
import { globby } from 'globby';

async function runCypress() {
  const args = ['run', '--browser', 'chrome', '--headless'];

  if (process.env.CYPRESS_BAIL === 'true') {
    args.push('--bail');
  }

  const specs = await globby(['cypress/e2e/*spec*.js']);

  if (process.env.IS_FORK === 'true') {
    const machineIndex = parseInt(process.env.MACHINE_INDEX);
    const machineCount = parseInt(process.env.MACHINE_COUNT);
    const specsPerMachine = Math.floor(specs.length / machineCount);
    const start = (machineIndex - 1) * specsPerMachine;
    const machineSpecs =
      machineIndex === machineCount
        ? specs.slice(start)
        : specs.slice(start, start + specsPerMachine);

    args.push('--spec', machineSpecs.join(','));
  } else {
    args.push(
      '--record',
      '--parallel',
      '--ci-build-id',
      process.env.GITHUB_SHA,
      '--group',
      'GitHub CI',
      '--spec',
      specs.join(','),
    );
  }

  await execa('cypress', args, { stdio: 'inherit', preferLocal: true });
}

runCypress();
