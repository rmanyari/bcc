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

test('nbTables fn should return the nb of tables created by the program', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.equals(program.nbTables(), 1);
    t.end();
});

test('tableId fn should return the id of a ebpf table given a valid name', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.equals(program.tableId('sessions'), 0);
    t.end();
});

test('tableId fn should validate the name is valid', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.throws(() => {
        program.tableId('');
    }, /name cannot be empty/);
    t.end();
});

test('tableId fn should validate the name is a string', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.throws(() => {
        program.tableId(999);
    }, /name must be a string/);
    t.end();
});

test('tableFd fn should return the fd pointing to an ebpf table given a valid name', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.ok(program.tableFd('sessions') > 0);
    t.end();
});

test('tableFdById fn should return the same fd pointing to an ebpf table retrieved by name', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.equals(program.tableFdById(0), program.tableFd('sessions'));
    t.end();
});

test('tableFdById fn should validate that the id is an integer', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.throws(() => {
        program.tableFdById('bad_input');
    }, /must be an integer/);
    t.end();
});

test('tableFdById fn should validate that the id is within a valid range', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.throws(() => {
        program.tableFdById(1);
    }, /The program contains only/);
    t.end();
});

test('tableType fn should return the type of the ebpf table (hash in this case)', (t) => {
    // https://www.kernel.org/doc/Documentation/networking/filter.txt
    // look at ./include/uapi/linux/pbf.h : hash is index 1
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.equals(program.tableType('sessions'), 1);
    t.end();
});

test('tableType fn should return table name suggestions when passed an invalid name', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.throws(() => {
        program.tableType('invalid_table_name');
    }, /sessions/);
    t.end();
});

test('tableTypeById fn should return the type of the ebpf table (hash in this case)', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.equals(program.tableTypeById(0), 1);
    t.end();
});

test('tableMaxEntries fn should return the size of the map', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.equals(program.tableMaxEntries('sessions'), 1024);
    t.end();
});

test('tableMaxEntriesById fn should return the same map as the one retrieved by name', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.equals(program.tableMaxEntriesById(0), program.tableMaxEntries('sessions'));
    t.end();
});

test('tableName fn should return the name of a ebpf table for when passed a valid id', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    t.equals(program.tableName(0), 'sessions');
    t.end();
});

test('tableKeyDesc fn should return the key info of a ebpf table', (t) => {
    const program = new BCCProgram(VALID_PROGRAM_FILE, 0, []);
    console.log(program.tableKeyDesc('sessions'));
    t.end();
});