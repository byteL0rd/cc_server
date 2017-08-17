import * as keystone from 'keystone';
import * as mongoose from 'mongoose';

var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var Instut = new keystone.List('Instut', {
    track: true,
});

// instut schema declaration
Instut.add({
    name: {
        type: Types.Text,
        required: true,
        unique: true,
        inital: true
    },
    town: {
        type: Types.Text
    },
    state: {
        type: Types.Text
    }
});

// properties to display in the dashboard
Instut.defaultColumns = 'name state town';
Instut.register();

export interface instut {
    name: string;
    town: string;
    state: string;
    _id: string;
}

export interface Instut extends mongoose.Document {
    name: string;
    town: string;
    state: string;
    _id: string;
}