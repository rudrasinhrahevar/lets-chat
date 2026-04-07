# Cloudinary Setup for File Uploads

To enable file uploads in the chat application, you need to create an unsigned upload preset in Cloudinary.

## Steps:

1. **Login to Cloudinary**
   - Go to https://cloudinary.com/console
   - Login with your account

2. **Create an Unsigned Upload Preset**
   - Go to Settings (gear icon)
   - Click on "Upload" tab
   - Scroll down to "Upload presets"
   - Click "Add upload preset"

3. **Configure the Preset**
   - **Preset name:** `chat_uploads`
   - **Signing Mode:** Select "Unsigned"
   - **Folder:** (optional) `lets-chat` or leave empty
   - **Access mode:** Public read
   - Click "Save"

4. **Alternative: Use Existing Preset**
   If you already have an unsigned preset, you can use it by updating the `CLOUDINARY_UPLOAD_PRESET` in:
   - File: `frontend/src/utils/FileUploader.js`
   - Line 3: Change `'chat_uploads'` to your preset name

## Supported File Types:
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, WebM
- Audio: MP3, WAV, OGG
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT

## File Size Limit:
- Maximum: 25MB per file (Cloudinary free tier limit)

## Current Configuration:
- Cloud Name: `dnucxmp2s`
- Upload Preset: `chat_uploads`

If you see upload errors, check the browser console for detailed error messages.
