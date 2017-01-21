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

}

module.exports = BCCProgram;