// setup-database.js - Run this to set up the database schema

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'newsletter_subscribers',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
    let client;
    try {
        console.log('🔧 Setting up database schema...\n');
        
        client = await pool.connect();
        
        // Read and execute SQL file
        const sql = fs.readFileSync('database-setup.sql', 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement && !statement.startsWith('--')) {
                try {
                    console.log(`Executing statement ${i + 1}...`);
                    await client.query(statement);
                    console.log(`✅ Statement ${i + 1} completed`);
                } catch (error) {
                    console.log(`⚠️ Statement ${i + 1} failed (might already exist):`, error.message);
                }
            }
        }
        
        // Verify tables exist
        console.log('\n🔍 Verifying database setup...');
        
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('subscribers', 'verification_pins', 'admin_emails')
        `);
        
        console.log('📋 Tables found:', tables.rows.map(row => row.table_name));
        
        // Check columns in subscribers table
        const subscriberCols = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'subscribers' 
            ORDER BY ordinal_position
        `);
        
        console.log('📊 Subscribers table columns:', subscriberCols.rows.map(row => row.column_name));
        
        console.log('\n✅ Database setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}

setupDatabase(); 