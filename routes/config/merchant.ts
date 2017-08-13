import { authorizeRoute } from './../middleware'

const list = {};
const create = {};
const retrieve = {};

const merchant = {
    resources: {
        list,
        create,
        retrieve
    }
};

module.exports = merchant;