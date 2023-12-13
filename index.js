require('dotenv').config()

const Boilerplates = require('./http'),
    DB = require('./ORM'),
    args = process.argv;

(async () => {
    const db = new DB(),
        dbConnection = await db.getConnection(),
        methodsToExecute = args[2]?.replace('execute=', '')?.split(',')

    const values = await Promise.all(methodsToExecute.map(async method => {
        let data = {}

        const simplerest = {
            queryString: {
                limit: 10, 
                offset: 0
            },
            body: {},
            session: {}
        }

        // second param is the simplerest supervar, mock data on object
        switch (method) {
            case 'list':
                data = await Boilerplates.list(simplerest, dbConnection)
                break
            case 'get':
                data = await Boilerplates.get(simplerest, dbConnection)
                break
            case 'post':
                data = await Boilerplates.post(simplerest, dbConnection)
                break
            case 'update':
                data = await Boilerplates.update(simplerest, dbConnection)
                break
            case 'delete':
                data = await Boilerplates.$delete(simplerest, dbConnection)
                break
        }

        return {
            method,
            data
        }
    }))

    values.forEach(val => {
        console.log(`metodo: ${val.method.toUpperCase()}\nresposta: ${JSON.stringify(val.data?.length ? val.data : { data: {} })}\n`)
    })
})()