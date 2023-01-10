//
// Copyright 2022 Vulcanize, Inc.
//

import * as readline from 'readline';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';

// @ts-expect-error https://github.com/microsoft/TypeScript/issues/49721#issuecomment-1319854183
import { PeerId } from '@libp2p/interface-peer-id';

interface Arguments {
  signalServer: string;
  relayNode: string;
}

async function main (): Promise<void> {
  const argv: Arguments = _getArgv();
  if (!argv.signalServer) {
    console.log('Using the default signalling server URL');
  }

  // https://adamcoster.com/blog/commonjs-and-esm-importexport-compatibility-examples#importing-esm-into-commonjs-cjs
  const { Peer } = await import('@cerc-io/peer');
  const peer = new Peer(true);
  await peer.init(argv.signalServer, argv.relayNode);

  peer.subscribeMessage((peerId: PeerId, message: string) => {
    console.log(`> ${peerId.toString()} > ${message}`);
  });

  console.log(`Peer ID: ${peer.peerId?.toString()}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', (input: string) => {
    peer.broadcastMessage(input);
  });

  console.log('Reading input...');
}

function _getArgv (): any {
  return yargs(hideBin(process.argv)).parserConfiguration({
    'parse-numbers': false
  }).options({
    signalServer: {
      type: 'string',
      describe: 'Signalling server URL'
    },
    relayNode: {
      type: 'string',
      describe: 'Relay node URL'
    }
  }).argv;
}

main().catch(err => {
  console.log(err);
});