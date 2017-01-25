const _ = require('lodash');
const fs = require('fs');
const Program = require('../build/Release/bcc.node').Program;

class BCCProgram {

    constructor(file, flags, cFlags) {
        if (!_.isString(file)) {
            throw new Error('The file argument must be a string');
        }

        // Check file exists
        const stats = fs.statSync(file);
        if (!stats.isFile()) {
            throw new Error(`${file} is not a file`);
        }

        if (!_.isInteger(flags)) {
            throw new Error('The flags argument must be an integer');
        }
        if (!_.isArray(cFlags)) {
            throw new Error('The cFlags argument must be an array');
        }
        if (_.filter(cFlags, (e) => !_.isString(e)).length !== 0) {
            throw new Error('All the cFlags elements must be strings');
        }
        
        this.program = new Program(file, flags, cFlags);
    }

    destroy() {
        return this.program.destroy();
    }

    license() {
        return this.program.license();
    }

    kernelVersion() {
        return this.program.kernelVersion();
    }

    nbFunctions() {
        return this.program.nbFunctions();
    }

    functionName(id) {
        this._checkId(id);
        return this.program.functionName(id);
    }

    startFunctionById(id) {
        this._checkId(id);
        return this.program.startFunctionById(id);
    }

    startFunctionByName(name) {
        this._checkName(name);
        return this.program.startFunctionByName(name);
    }

    functionSizeById(id) {
        this._checkId(id);
        return this.program.functionSizeById(id);
    }

    functionSizeByName(name) {
        this._checkName(name);
        return this.program.functionSizeByName(name);
    }

    nbTables() {
        return this.program.nbTables();
    }

    tableId(name) {
        this._checkTable(name);
        return this.program.tableId(name);
    }

    tableFd(name) {
        this._checkTable(name);
        return this.program.tableFd(name);
    }

    tableFdById(id) {
        this._checkTableId(id);
        return this.program.tableFdById(id);
    }

    tableType(name) {
        this._checkTable(name);
        return this.program.tableType(name);
    }

    tableTypeById(id) {
        this._checkTableId(id);
        return this.program.tableTypeById(id);
    }

    tableMaxEntries(name) {
        this._checkTable(name);
        return this.program.tableMaxEntries(name);
    }

    tableMaxEntriesById(id) {
        this._checkTableId(id);
        return this.program.tableMaxEntriesById(id);
    }

    // Verifies the function id is valid.
    _checkId(id) {
        if (!_.isInteger(id)) {
            throw new Error('ID must be an integer');
        }
        const nbFns = this.nbFunctions();
        if(id >= nbFns) {
            throw new Error(`ID ${id} is invalid. The program contains only ${nbFns} function${nbFns > 1 ? 's' : ''}`);
        }
    }

    // Verifies the function name is valid.
    _checkName(name) {
        if (!_.isString(name)) {
            throw new Error('Function name must be a string');
        }
        const names = _.map(_.range(0, this.nbFunctions()), (id) => this.functionName(id));
        if (!_.includes(names, name)) {
            throw new Error(`Function name ${name} is invalid. Valid function names are ${JSON.stringify(names)}`);
        }
    }

    // Verifies the table name is valid
    _checkTable(name) {
        if (!_.isString(name)) {
            throw new Error('Table name must be a string');
        }
        if (_.isEmpty(name)) {
            throw new Error('Table name cannot be empty');
        }
    }

    // Verifies the function id is valid.
    _checkTableId(id) {
        if (!_.isInteger(id)) {
            throw new Error('ID must be an integer');
        }
        const nbFns = this.nbTables();
        if(id >= nbFns) {
            throw new Error(`ID ${id} is invalid. The program contains only ${nbFns} table${nbFns > 1 ? 's' : ''}`);
        }
    }

}

module.exports = BCCProgram;