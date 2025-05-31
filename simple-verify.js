// simple-verify.js - Simple database check

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'newsletter_subscribers',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function checkDatabase() {
    let client;
    try {
        console.log('🔍 Checking database content...\n');
        
        client = await pool.connect();
        console.log('✅ Connected to PostgreSQL');
        
        // Show database info
        const dbInfo = await client.query('SELECT current_database(), current_user');
        console.log(`📍 Database: ${dbInfo.rows[0].current_database}`);
        console.log(`📍 User: ${dbInfo.rows[0].current_user}\n`);
        
        // Check table structure
        console.log('📋 Table structure:');
        const structure = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'subscribers' 
            ORDER BY ordinal_position
        `);
        structure.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type}`);
        });
        
        // Check actual data
        console.log('\n📊 Current data in subscribers table:');
        const result = await client.query('SELECT * FROM subscribers ORDER BY id');
        console.log(`   Total records: ${result.rows.length}`);
        
        if (result.rows.length > 0) {
            console.log('\n   Records found:');
            result.rows.forEach((row, index) => {
                console.log(`   ${index + 1}. [ID: ${row.id}] ${row.name} <${row.email}>`);
                console.log(`      Topic: ${row.ai_topic}`);
                console.log(`      LinkedIn: ${row.linkedin_url || 'None'}`);
                console.log(`      Subscribed: ${row.subscribed_at}`);
                console.log('');
            });
        } else {
            console.log('   ❌ No records found in the database!');
            console.log('\n🔧 Possible reasons:');
            console.log('   1. Server is using in-memory storage instead of database');
            console.log('   2. Data is being written to a different database/table');
            console.log('   3. There might be multiple server instances running');
        }
        
        // Test a manual insert to verify write capability
        console.log('\n🧪 Testing manual insert...');
        try {
            const testResult = await client.query(`
                INSERT INTO subscribers (name, email, ai_topic, linkedin_url, subscribed_at)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING *;
            `, ['Manual Test', 'manual@test.com', 'Computer Vision', null]);
            
            console.log('✅ Manual insert successful!');
            console.log('📋 Inserted record:', testResult.rows[0]);
            
            // Clean up
            await client.query('DELETE FROM subscribers WHERE email = $1', ['manual@test.com']);
            console.log('🧹 Test record cleaned up');
            
        } catch (insertError) {
            console.log('❌ Manual insert failed:', insertError.message);
        }
        
    } catch (error) {
        console.error('❌ Database check failed:', error.message);
        console.error('Full error:', error);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
        console.log('\n✅ Database check completed!');
    }
}

checkDatabase(); 