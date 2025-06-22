import React, { useState } from 'react';
import { Copy, Key, Plus, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ApiDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKeys, setApiKeys] = useState([
    {
      id: '1',
      name: 'Production Key',
      key: 'fashn_sk_1234567890abcdef',
      createdAt: '2024-01-15',
      lastUsed: '2024-01-20',
    },
  ]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      toast.error('Failed to copy API key');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'endpoints', label: 'Endpoints' },
    { id: 'examples', label: 'Examples' },
    { id: 'keys', label: 'API Keys' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Developer API</h1>
        <p className="text-stone-600">
          Integrate FASHNAI's AI-powered fashion visualization into your applications
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Getting Started</h2>
            <p className="text-stone-600 mb-6">
              The FASHNAI API allows you to generate AI-powered fashion visualizations programmatically. 
              Upload model and garment images to create stunning fashion combinations.
            </p>
            
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
              <h3 className="font-semibold text-stone-900 mb-3">Base URL</h3>
              <code className="bg-stone-800 text-white px-3 py-2 rounded">
                https://api.fashn.ai/v1
              </code>
            </div>
          </div>
        )}

        {activeTab === 'authentication' && (
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Authentication</h2>
            <p className="text-stone-600 mb-6">
              All API requests require authentication using a Bearer token in the Authorization header.
            </p>
            
            <div className="bg-stone-800 text-white p-4 rounded-lg">
              <pre>{`curl -X POST https://api.fashn.ai/v1/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
            </div>
          </div>
        )}

        {activeTab === 'endpoints' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-stone-900 mb-4">Available Endpoints</h2>
              
              <div className="space-y-6">
                <div className="border border-stone-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                      POST
                    </span>
                    <code className="text-lg">/run</code>
                  </div>
                  <p className="text-stone-600 mb-4">Generate AI fashion visualization</p>
                  
                  <h4 className="font-medium text-stone-900 mb-2">Request Body</h4>
                  <div className="bg-stone-800 text-white p-4 rounded-lg text-sm">
                    <pre>{`{
  "model_image": "https://example.com/model.jpg",
  "garment_image": "https://example.com/garment.jpg",
  "category": "tops",
  "samples": 1,
  "seed": 12345
}`}</pre>
                  </div>
                </div>

                <div className="border border-stone-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                      GET
                    </span>
                    <code className="text-lg">/status/:id</code>
                  </div>
                  <p className="text-stone-600">Check generation status and retrieve results</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Code Examples</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-stone-900 mb-3">JavaScript</h3>
                <div className="bg-stone-800 text-white p-4 rounded-lg text-sm overflow-x-auto">
                  <pre>{`const response = await fetch('https://api.fashn.ai/v1/run', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model_image: 'https://example.com/model.jpg',
    garment_image: 'https://example.com/garment.jpg',
    category: 'tops'
  })
});

const data = await response.json();
console.log(data);`}</pre>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-stone-900 mb-3">Python</h3>
                <div className="bg-stone-800 text-white p-4 rounded-lg text-sm overflow-x-auto">
                  <pre>{`import requests

response = requests.post(
    'https://api.fashn.ai/v1/run',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
    },
    json={
        'model_image': 'https://example.com/model.jpg',
        'garment_image': 'https://example.com/garment.jpg',
        'category': 'tops'
    }
)

data = response.json()
print(data)`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-stone-900">API Keys</h2>
              <button className="bg-yellow-400 hover:bg-yellow-500 text-stone-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create New Key
              </button>
            </div>

            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="bg-white border border-stone-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-stone-900">{key.name}</h3>
                    <button className="text-stone-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-3">
                    <code className="bg-stone-100 px-3 py-2 rounded text-sm font-mono flex-1">
                      {key.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(key.key, key.id)}
                      className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {copiedKey === key.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  <div className="text-sm text-stone-500">
                    Created: {key.createdAt} • Last used: {key.lastUsed}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDocs;