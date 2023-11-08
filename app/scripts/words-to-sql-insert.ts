import cmd, { OptionDefinition } from 'command-line-args';
import fs from 'fs/promises';

interface CommandLineArgs {
  table: string;
  input: string;
  output: string;
}

const options: OptionDefinition[] = [
  { name: 'table', alias: 't', type: String, defaultValue: 'words' },
  { name: 'input', alias: 'i', type: String },
  { name: 'output', alias: 'o', type: String }
];

const args = cmd(options) as CommandLineArgs;

if (Object.keys(args).length !== 3) {
  console.error('Usage: -i <input file> -o <output file> [-t <table name>]');
  process.exit(1);
}

async function main() {
  const input = await fs.readFile(args.input, 'utf-8');
  const words = JSON.parse(input) as string[];

  const output = words
    .map(word => `INSERT INTO ${args.table} (word) VALUES ('${word}');`)
    .join('\n');

  await fs.writeFile(args.output, output);

  console.log(`Wrote ${words.length} words to ${args.output}`);
}

void main();
