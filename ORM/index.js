const Knex = require('knex')

class DB {

    #connection = null

    constructor () {
        const dbType = process.env.DB_CLIENT

        let conn = {
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
            }
        }

        if(dbType == 'pg') {
            connection = {
                host,
                port,
                user,
                password,
                database,
                ssl: {
                    rejectUnauthorized: false
                }
            }

            this.isPg = true
        } else if (dbType == 'mssql') {
            connection = {
                host,
                user,
                password,
                database,
                options: {
                    port:  Number(port) ?? 1443
                }
            }
        }

        this.#connection = Knex(conn)
    }

    async getConnection () {
        return this.#connection
    }

}

module.exports = DB