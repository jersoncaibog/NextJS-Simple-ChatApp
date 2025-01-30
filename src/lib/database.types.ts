import { supabase } from './supabase'

// Function to inspect database schema
export async function inspectDatabaseSchema() {
  try {
    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_schema', 'public')
    
    if (tablesError) throw tablesError

    // For each table, get its columns
    for (const table of tables) {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('*')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name)

      if (columnsError) throw columnsError

      console.log(`Table: ${table.table_name}`)
      console.log('Columns:', columns.map(col => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES'
      })))
      console.log('-------------------')
    }
  } catch (error) {
    console.error('Error inspecting database:', error)
  }
} 