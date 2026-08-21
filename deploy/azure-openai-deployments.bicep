// ─────────────────────────────────────────────────────────────
// Azure OpenAI Model Deployments (Bicep / ARM Template)
// Deploys:
//   1. text-embedding-3-small (RAG Vector Embeddings)
//   2. gpt-4o (Chat & Multi-Model Inference)
//
// Deploy via Azure CLI:
//   az deployment group create \
//     --resource-group rg-data-coffee \
//     --template-file deploy/azure-openai-deployments.bicep \
//     --parameters openAiAccountName=data-coffee-persona
// ─────────────────────────────────────────────────────────────

@description('Name of the existing or new Azure OpenAI account')
param openAiAccountName string = 'data-coffee-persona'

@description('Azure region')
param location string = resourceGroup().location

// Reference the Azure OpenAI Account
resource openAiAccount 'Microsoft.CognitiveServices/accounts@2023-05-01' existing = {
  name: openAiAccountName
}

// 1. Deploy text-embedding-3-small (Vector RAG)
resource embeddingDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  parent: openAiAccount
  name: 'text-embedding-3-small'
  sku: {
    name: 'Standard'
    capacity: 20
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'text-embedding-3-small'
      version: '1'
    }
    versionUpgradeOption: 'OnceNewDefaultVersionAvailable'
    raiPolicyName: 'Microsoft.Default'
  }
}

// 2. Deploy gpt-4o (Chat & Synthesis)
resource gpt4oDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  parent: openAiAccount
  name: 'gpt-4o'
  sku: {
    name: 'Standard'
    capacity: 30
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-4o'
      version: '2024-05-13'
    }
    versionUpgradeOption: 'OnceNewDefaultVersionAvailable'
    raiPolicyName: 'Microsoft.Default'
  }
}

output openAiEndpoint string = openAiAccount.properties.endpoint
output embeddingDeploymentName string = embeddingDeployment.name
output gpt4oDeploymentName string = gpt4oDeployment.name
