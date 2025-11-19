import React, { useState, useRef } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ImageEditIcon } from './icons/ImageEditIcon';
import type { EditableImage } from '../types';

interface ImageEditorProps {
    onEditImage: (image: EditableImage, prompt: string) => void;
    isEditing: boolean;
    editedImage: string | null;
    error: string | null;
}

const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [mimeString, base64] = result.split(',');
            const mimeType = mimeString.match(/:(.*?);/)?.[1];
            if (base64 && mimeType) {
                resolve({ base64, mimeType });
            } else {
                reject(new Error("Failed to parse file data."));
            }
        };
        reader.onerror = error => reject(error);
    });
};

export const ImageEditor: React.FC<ImageEditorProps> = ({ onEditImage, isEditing, editedImage, error }) => {
    const [image, setImage] = useState<EditableImage | null>(null);
    const [prompt, setPrompt] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const { base64, mimeType } = await fileToBase64(file);
                setImage({ base64, mimeType });
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleEditClick = () => {
        if (image && prompt.trim()) {
            onEditImage(image, prompt);
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    return (
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700">
            <h2 className="font-orbitron text-2xl font-bold text-cyan-400 mb-4 flex items-center">
               <ImageEditIcon className="w-7 h-7 mr-3" /> Nano Banana Image Editor
            </h2>
            <div className="space-y-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
                <div onClick={triggerFileSelect} className="cursor-pointer w-full h-48 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors">
                    {image ? <img src={`data:${image.mimeType};base64,${image.base64}`} alt="Uploaded preview" className="max-w-full max-h-full object-contain rounded" /> : <span>Click to upload an image</span>}
                </div>

                <div className="flex space-x-2">
                    <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEditClick()} placeholder="e.g., Add a retro filter" disabled={!image || isEditing} className="flex-grow bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors disabled:opacity-50" />
                    <button onClick={handleEditClick} disabled={!image || !prompt.trim() || isEditing} className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center w-36">
                        {isEditing ? <SpinnerIcon /> : <><span>Edit</span></>}
                    </button>
                </div>
                
                { (isEditing || editedImage || error) &&
                    <div className="mt-4">
                        <h3 className="font-orbitron text-lg font-bold text-cyan-300 mb-2">Result</h3>
                        <div className="w-full h-48 bg-gray-900/50 rounded-lg border border-gray-700 flex items-center justify-center">
                            {isEditing && <SpinnerIcon className="w-10 h-10 text-cyan-400" />}
                            {error && <p className="text-red-400 text-center p-4">{error}</p>}
                            {editedImage && <img src={editedImage} alt="Edited result" className="max-w-full max-h-full object-contain rounded" />}
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};
