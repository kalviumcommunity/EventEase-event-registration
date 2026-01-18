import { NextRequest, NextResponse } from 'next/server';
import { generateUploadSasUrl } from '@/lib/azureStorage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const fileType = searchParams.get('fileType');

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required query parameters' },
        { status: 400 }
      );
    }

    const { sasUrl } = await generateUploadSasUrl(fileName, fileType);

    return NextResponse.json({ sasUrl });
  } catch (error) {
    console.error('Error generating SAS URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
