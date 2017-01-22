const test = require('tape');
const BCCProgram = require('../index');

const VALID_PROGRAM_FILE = '../../examples/networking/http_filter/http-parse-complete.c';
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

test('license fn returns GPL', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.equals(program.license(), 'GPL');
    t.end();
});

test('kernelVersion fn returns the kernel version', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    // TODO: Improve this assertion, how to validate that the 
    //       number returned is correct?
    t.ok(program.kernelVersion() !== 0);
    t.end();
});

test('nbFunctions fn should return the correct nb of functions in the ebpf program', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.ok(program.nbFunctions() === 1);
    t.end();
});

test('functionName fn should return a fn name given a valid ID', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.ok(program.functionName(0) === 'http_filter');
    t.end();
});

test('functionName fn should validate ID is an integer', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.throws(() => {
        program.functionName('bad_input');
    }, /must be an integer/);
    t.end();
});

test('functionName fn should validate ID is within a valid range', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.throws(() => {
        program.functionName(1);
    }, /program contains only/);
    t.end();
});

test('startFunctionById fn should start a function given a valid id', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    // TODO: Enhance assertion. attach to socket and make sure that data is written
    //       to the tables
    program.startFunctionById(0);
    t.end();
});

test('startFunctionByName fn should start a function given a valid name', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    // TODO: Enhance assertion. attach to socket and make sure that data is written
    //       to the tables
    program.startFunctionByName('http_filter');
    t.end();
});

test('startFunctionByName fn should validate that the name is valid', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.throws(() => {
        program.startFunctionByName('invalid_fn');
    }, /Valid function names are/);
    t.end();
});

test('startFunctionByName fn should validate that the name is a string', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.throws(() => {
        program.startFunctionByName([]);
    }, /name must be a string/);
    t.end();
});

test('functionSizeById fn should be greater than 0 for a valid fn/program', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.ok(program.functionSizeById(0) > 0);
    t.end();
});

test('functionSizeByName fn should match the size of the same fn retreived by id', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.equals(program.functionSizeById(0), program.functionSizeByName('http_filter'));
    t.end();
});
