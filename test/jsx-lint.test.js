import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';

test('the project lint configuration rejects undeclared JSX components', async () => {
  const [result] = await new ESLint().lintText('export default function Screen() { return <MissingIcon />; }', { filePath: 'src/lint-probe.jsx' });
  assert.ok(result.messages.some(message => message.ruleId === 'react/jsx-no-undef'));
});

test('JSX lint resolves imported, member and callback-local components', async () => {
  const [result] = await new ESLint().lintText(`
    import { motion } from 'framer-motion';
    import { Star } from 'lucide-react';
    export default function Screen() {
      return <motion.div>{[Star].map((Icon, index) => <Icon key={index} />)}</motion.div>;
    }
  `, { filePath: 'src/lint-probe.jsx' });
  assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
});
