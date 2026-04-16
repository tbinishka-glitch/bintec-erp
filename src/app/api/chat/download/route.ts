import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get('url');

  if (!fileUrl) {
    return new Response('Missing URL', { status: 400 });
  }

  try {
    if (!fileUrl.startsWith('/uploads/chat/')) {
       return new Response('Forbidden', { status: 403 });
    }

    const relativePath = fileUrl.replace(/^\//, '');
    const absolutePath = join(process.cwd(), 'public', relativePath);
    
    // 1. Get the PHYSICAL filename from the disk
    const diskFullName = basename(absolutePath);
    const fileExtension = extname(absolutePath).toLowerCase();
    
    // 2. RECONSTRUCT THE TRUE NAME
    // Our filenames follow the pattern: 36_CHAR_UUID + '-' + OriginalName.ext
    // We skip exactly 37 characters (UUID + dash)
    let finalDownloadName = diskFullName;
    
    if (diskFullName.length > 37 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/.test(diskFullName)) {
       finalDownloadName = diskFullName.substring(37);
    } else if (diskFullName.includes('-')) {
       // Fallback if the UUID format is slightly different but has a dash
       finalDownloadName = diskFullName.split('-').slice(1).join('-');
    }

    // 3. Ensuring we have a proper file extension
    if (fileExtension && !finalDownloadName.toLowerCase().endsWith(fileExtension)) {
       finalDownloadName = `${finalDownloadName}${fileExtension}`;
    }

    // 4. Read the file
    const fileBuffer = await readFile(absolutePath);

    // 5. Explicit MIME Mapping for Windows Shell Icons
    const mimeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.webm': 'audio/webm',
      '.mp4': 'video/mp4',
      '.zip': 'application/zip',
    };

    const contentType = mimeMap[fileExtension] || 'application/octet-stream';

    // 6. Return the response with strict naming headers
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        // The "filename" part is critical for Windows Download Folder identification
        'Content-Disposition': `attachment; filename="${encodeURIComponent(finalDownloadName)}"; filename*=UTF-8''${encodeURIComponent(finalDownloadName)}`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Download Fix Error:', error);
    return new Response('File not found or inaccessible', { status: 404 });
  }
}
