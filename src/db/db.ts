import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { helloTable } from './schema/hello'
import * as gameSchema from './schema/game'

const db = drizzle({
  connection: {
    url: process.env.DB_FILE_NAME || 'file:local.db',
  },
  schema: {
    helloTable,
    ...gameSchema,
  },
})

export { db, helloTable }
export * from './schema/game'
