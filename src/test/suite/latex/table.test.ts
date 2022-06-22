import assert from 'assert';
import { getLengthWithFontSize, repeatText } from '../../../latex/table';

suite('Table to LaTeX converter', () => {
  test('repeatText', () => {
    assert.strictEqual(repeatText('.', 3), '...');
    assert.strictEqual(repeatText('AB', 3), 'ABABAB');
  });
  test('getLengthWithFontSize', () => {
    assert.strictEqual(getLengthWithFontSize('aaa'), 3);
    assert.strictEqual(getLengthWithFontSize('あああ'), 6);
    assert.strictEqual(getLengthWithFontSize(''), 0);
  });
});
