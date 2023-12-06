const Knex = require('knex')

class DB {

    #connection = null

    constructor () {
        this.#connection = Knex({
            client: process.env.DB_CLIENT ?? 'mysql',
            connection: {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
            },
            pool: {
                min: 2,
                max: 5
            },
            ssl: {
                rejectUnauthorized: false
            }
        })
    }

    async getConnection () {
        return this.#connection
    }

}

module.exports = DB