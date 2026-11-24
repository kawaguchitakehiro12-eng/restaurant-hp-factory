const {test}=require('node:test'),assert=require('node:assert/strict');
const config=require('./load-ts.cjs').load('next.config.ts').default;
test('app Sharp is a runtime dependency without a version change',()=>{const pkg=require('../package.json');assert.equal(pkg.dependencies.sharp,'^0.35.1');assert.equal(pkg.devDependencies.sharp,undefined);});
for(const prefix of ['./node_modules/','./node_modules/next/node_modules/'])test('function traces include both native module and matching libvips '+prefix,()=>{const patterns=config.outputFileTracingIncludes['/*'];for(const suffix of ['sharp/**/*','@img/sharp-linux-x64/**/*','@img/sharp-libvips-linux-x64/**/*'])assert.ok(patterns.includes(prefix+suffix));});
