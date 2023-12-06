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

        // second param is the BODY/URLParams of request, mock data on object
        switch (method) {
            case 'post':
                data = await Boilerplates.post(dbConnection, {})
                break
            case 'update':
                data = await Boilerplates.update(dbConnection, { id: null })
                break
            case 'list':
                data = await Boilerplates.list(dbConnection, { 
                    limit: 10, 
                    offset: 0,
                    empresa: '42813402000155|4718066680003|14',
                    v_tipo: 0,
                    data_ini: '2023-01-01',
                    data_fim: '2023-02-01',
                    v_filtro_cpf_cnpj: 'T',
                    v_filtro_manifesto: 0
                })
                break
            case 'get':
                data = await Boilerplates.get(dbConnection, { id: null })
                break
            case 'delete':
                data = await Boilerplates.$delete(dbConnection, { id: null })
                break
        }

        return {
            method,
            data
        }
    }))

    values.forEach(val => {
        console.log(val.data)
        console.log(`metodo: ${val.method.toUpperCase()}\nresposta: ${JSON.stringify(val.data?.length ? val.data : { data: {} })}\n`)
    })
})()