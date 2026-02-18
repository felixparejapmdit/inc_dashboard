const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://inc_elasticsearch:9200', // Default local setup
    // node: 'http://localhost:9200', // For local dev outside docker
    // auth: { ... } // Add if using security
});

const connectElasticsearch = async () => {
    try {
        const health = await client.cluster.health();
        console.log('✅ Elasticsearch connected:', health.status);
        return true;
    } catch (error) {
        console.error('❌ Elasticsearch connection failed:', error.message);
        return false;
    }
};

module.exports = { client, connectElasticsearch };
