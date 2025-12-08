'use client'
import React, {ChangeEvent, FormEvent, useState} from 'react'
import FormField from "@/components/FormField";
import FileInput from "@/components/FileInput";
import {useFileInput} from "@/lib/hooks/useFileInput";
import {MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE} from "@/constants";
import {getVideoUploadUrl, getThumbnailUploadUrl, saveVideoDetails} from "@/lib/actions/video";
import {getVideoDuration} from "@/lib/utils";
import {useRouter} from "next/navigation";

const uploadFileToBunny = async (file: File, uploadUrl: string, accessKey: string): Promise<void> => {
    const response = await fetch(uploadUrl, {
        method: "PUT", // Changed from POST to PUT
        headers: {
            'Content-Type': file.type,
            AccessKey: accessKey,
        },
        body: file,
    });

    if(!response.ok) throw new Error('Upload failed');
}

const Page = () => {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: 'public' as 'public' | 'private',
    });

    const video = useFileInput(MAX_VIDEO_SIZE);
    const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE);

    const handleInputchange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData((prevState) => ({...prevState, [name]: value}));
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if(!video.file || !thumbnail.file) {
                setError('Please upload video and thumbnail');
                return;
            }
            if(!formData.title || !formData.description) {
                setError('Please fill in all the details');
                return;
            }

            // Get video upload credentials
            const videoUploadData = await getVideoUploadUrl();


            const { videoId, uploadUrl: videoUploadUrl, accessKey: videoAccessKey } = videoUploadData;

            if(!videoUploadData || !videoUploadData.uploadUrl || !videoUploadData.accessKey) {
                throw new Error('Failed to get video upload credentials');
            }
            // Upload video to Bunny
            // Get thumbnail upload credentials
            const thumbnailUploadData = await getThumbnailUploadUrl(videoId);
            if(!thumbnailUploadData || !thumbnailUploadData.uploadUrl || !thumbnailUploadData.accessKey) {
                throw new Error('Failed to get thumbnail upload credentials');
            }



            const { uploadUrl: thumbnailUploadUrl, accessKey: thumbnailAccessKey, cdnUrl } = thumbnailUploadData;

            // Upload thumbnail to Bunny
            await uploadFileToBunny(thumbnail.file, thumbnailUploadUrl, thumbnailAccessKey);

            // Get video duration
            const duration = video.previewUrl ? await getVideoDuration(video.previewUrl) : null;

            // Save video details to database
            await saveVideoDetails({
                videoId,
                title: formData.title,
                description: formData.description,
                thumbnailUrl: cdnUrl,
                visibility: formData.visibility,
                duration: duration || undefined,
            });

            // Redirect to home page
            router.push('/');

        } catch(err) {
            console.error('Error submitting form:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while uploading');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="wrapper-md upload-page">
            <h1>upload a video</h1>
            {error && <div className="error-field">{error}</div>}
            <form className="rounded-20 shadow-10 gap-6 w-full flex flex-col px-5 py-7.5" onSubmit={handleSubmit}>
                <FormField
                    id="title"
                    label="Title"
                    value={formData.title}
                    onChange={handleInputchange}
                    placeholder="Enter a clear and concise video title"
                />
                <FormField
                    id="description"
                    label="Description"
                    value={formData.description}
                    as="textarea"
                    onChange={handleInputchange}
                    placeholder="Describe what this video is about"
                />
                <FileInput
                    id="video"
                    label="Video"
                    accept="video/*"
                    file={video.file}
                    previewUrl={video.previewUrl}
                    inputRef={video.inputRef}
                    onChange={video.handleFileChange}
                    onReset={video.resetFile}
                    type="video"
                />

                <FileInput
                    id="thumbnail"
                    label="Thumbnail"
                    accept="image/*"
                    file={thumbnail.file}
                    previewUrl={thumbnail.previewUrl}
                    inputRef={thumbnail.inputRef}
                    onChange={thumbnail.handleFileChange}
                    onReset={thumbnail.resetFile}
                    type="image"
                />

                <FormField
                    id="visibility"
                    label="Visibility"
                    value={formData.visibility}
                    as="select"
                    options={[
                        {value: 'public', label: 'Public'},
                        {value: 'private', label: 'Private'},
                    ]}
                    onChange={handleInputchange}
                />
                <button type="submit" disabled={isSubmitting} className="submit-button">
                    {isSubmitting ? 'Uploading...' : 'Upload video'}
                </button>
            </form>
        </div>
    )
}
export default Page