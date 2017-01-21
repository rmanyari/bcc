const test = require('tape');
const BCCProgram = require('../index');

const VALID_PROGRAM_FILE = '../../examples/networking/distributed_bridge/tunnel.c';
const INVALID_PROGRAM_FILE = 'i_dont_exist.c';
const INVALID_PROGRAM_FOLDER = '/etc';

test('Creating a basic program should not return errors', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.pass('Program successfully created');
    t.end();
});

test('BCCProgram constructor should check that file exists', (t) => {
    t.throws(() => {
        const program = new BCCProgram(INVALID_PROGRAM_FILE, 0, []);
    }, /no such file/);
    t.end();
});

test('BCCProgram constructor should check that the file arg is a file', (t) => {
    t.throws(() => {
        const program = new BCCProgram(INVALID_PROGRAM_FOLDER, 0, []);
    }, /is not a file/);
    t.end();
});

test('BCCProgram constructor should validate flags args as int', (t) => {
    t.throws(() => {
        const program = new BCCProgram(VALID_PROGRAM_FILE, 'invalid_flag', []);
    }, /flags/);
    t.end();
});

test('BCCProgram constructor should validate cFlags is an array of strings', (t) => {
    t.throws(() => {
        const program = new BCCProgram(VALID_PROGRAM_FILE, 0, 'invalid');
    }, /cFlags/);
    t.throws(() => {
        const program = new BCCProgram(VALID_PROGRAM_FILE, 0, [0]);
    }, /cFlags/);
    t.end();
});