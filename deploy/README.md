# 🚀 Azure Deployment Guide — Data Coffee Model Hub

This directory contains all the configuration and YAML files to deploy **Data Coffee Model Hub** to Microsoft Azure.

---

## 📁 Deployment Files Overview

| File | Purpose | Deployment Method |
| :--- | :--- | :--- |
| [`Dockerfile`](../Dockerfile) | Multi-stage standalone Next.js 15 container build | Docker / ACR |
| [`azure-container-app.yaml`](./azure-container-app.yaml) | Azure Container Apps full deployment specification | Azure CLI / Portal YAML editor |
| [`azure-openai-deployments.bicep`](./azure-openai-deployments.bicep) | Deploys `text-embedding-3-small` & `gpt-4o` in Azure OpenAI | Azure CLI / Portal Custom Template |
| [`.github/workflows/azure-deploy.yml`](../.github/workflows/azure-deploy.yml) | Automated CI/CD build & deploy pipeline | GitHub Actions |

---

## 🛠 Option 1: Deploy via Azure Portal (UI / YAML Import)

### 1. Deploy the Azure OpenAI Models (if not already created)
1. Go to [Azure Portal](https://portal.azure.com) → **Azure OpenAI** or **Azure AI Foundry**.
2. Select your resource (e.g. `data-coffee-persona`).
3. Click **Model Deployments** → **Manage Deployments**.
4. Deploy the following models:
   - **`text-embedding-3-small`** (Deployment name: `text-embedding-3-small`) for RAG Vector Embeddings.
   - **`gpt-4o`** (Deployment name: `gpt-4o`) for Chat Inference.

### 2. Deploy Container App in Azure Portal
1. In Azure Portal, search for **Container Apps** → click **Create**.
2. Fill in your Resource Group and Container App Name (`data-coffee-modelhub`).
3. Under the **Container** tab, or using the **Edit YAML** button in the portal overview, paste the contents of [`azure-container-app.yaml`](./azure-container-app.yaml).
4. Set your environment variables and secrets in the **Application** → **Environment variables** blade:
   - `AZURE_OPENAI_ENDPOINT`
   - `OPENAI_API_KEY`
   - `GOOGLE_AI_API_KEY`
   - `NEXTAUTH_SECRET`
5. Click **Create / Save**.

---

## ⚡ Option 2: Deploy via Azure CLI

```bash
# 1. Login to Azure
az login

# 2. Set your active subscription
az account set --subscription "<YOUR_SUBSCRIPTION_ID>"

# 3. Create Resource Group (if needed)
az group create --name rg-data-coffee --location eastus

# 4. Deploy Models to Azure OpenAI
az deployment group create \
  --resource-group rg-data-coffee \
  --template-file deploy/azure-openai-deployments.bicep \
  --parameters openAiAccountName=data-coffee-persona

# 5. Build & Push Image to Azure Container Registry (ACR)
az acr create --resource-group rg-data-coffee --name datacoffeeregistry --sku Basic --admin-enabled true
az acr build --registry datacoffeeregistry --image data-coffee-modelhub:latest .

# 6. Deploy Container App using YAML
az containerapp create \
  --name data-coffee-modelhub \
  --resource-group rg-data-coffee \
  --yaml deploy/azure-container-app.yaml
```
