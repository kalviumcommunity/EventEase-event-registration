import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';
import { env } from '../../env';

let blobServiceClient: BlobServiceClient;

function getBlobServiceClient(): BlobServiceClient {
  if (!blobServiceClient) {
    const account = env.AZURE_STORAGE_ACCOUNT;
    const accountKey = env.AZURE_STORAGE_ACCESS_KEY;
    const connectionString = env.AZURITE_CONNECTION_STRING;

    if (connectionString) {
      // Use Azurite for local development
      blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    } else if (account && accountKey) {
      // Use Azure Storage
      const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
      blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, sharedKeyCredential);
    } else {
      throw new Error('Azure Storage configuration is missing');
    }
  }
  return blobServiceClient;
}

export async function generateUploadSasUrl(fileName: string, fileType: string): Promise<{ uploadUrl: string; publicUrl: string }> {
  const blobServiceClient = getBlobServiceClient();
  const containerName = env.AZURE_STORAGE_CONTAINER_NAME || 'uploads';
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Ensure container exists
  await containerClient.createIfNotExists({ access: 'blob' });

  const blobClient = containerClient.getBlockBlobClient(fileName);

  const sasOptions = {
    containerName,
    blobName: fileName,
    permissions: BlobSASPermissions.parse('w c'), // Write and Create
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 15 * 60 * 1000), // 15 minutes
    contentType: fileType,
  };

  const sasToken = generateBlobSASQueryParameters(sasOptions, blobServiceClient.credential as StorageSharedKeyCredential).toString();

  const uploadUrl = `${blobClient.url}?${sasToken}`;
  const publicUrl = blobClient.url;

  return { uploadUrl, publicUrl };
}
