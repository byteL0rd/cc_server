import { authorizeRoute } from './../middleware'

const list = {};
const create = {};
const retrieve = {};

const order = {
    resources: {
        list,
        create,
        retrieve
    }
};

module.exports = order;