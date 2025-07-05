'use client';

import React, { useState, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';

export default function CreateDebatesPage() {
  const { authenticated, login, ready } = usePrivy();
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authenticated) {
      login();
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Debate created successfully!');
      setQuestion('');
      setDescription('');
      removeImage();
    }, 2000);
  };

  const questionLength = question.length;
  const descriptionLength = description.length;

  return (
    <div className="min-h-screen pb-24">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Debate</h1>
          <p className="text-gray-600 text-lg">
            Share your perspective and spark meaningful discussions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question Input */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Debate Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Should billionaires exist?"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  maxLength={120}
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">Make it thought-provoking</span>
                  <span
                    className={`text-sm ${questionLength > 100 ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    {questionLength}/120
                  </span>
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Context & Background
                  <span className="text-gray-500 font-normal text-sm ml-2">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context, background, or key points to consider..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                  rows={4}
                  maxLength={300}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">Help others understand the stakes</span>
                  <span
                    className={`text-sm ${descriptionLength > 250 ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    {descriptionLength}/300
                  </span>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Visual Aid
                  <span className="text-gray-500 font-normal text-sm ml-2">(optional)</span>
                </label>

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="space-y-2">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-gray-600 font-medium">Click to upload an image</p>
                      <p className="text-gray-400 text-sm">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-full h-48 relative rounded-xl overflow-hidden border-2 border-gray-200">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!question.trim() || isSubmitting || !ready}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg text-white transition-all ${
                  !question.trim() || isSubmitting || !ready
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : authenticated
                      ? 'bg-indigo-500 hover:indigo-800 shadow-lg hover:shadow-xl'
                      : 'bg-indigo-500 hover:indigo-800 shadow-lg hover:shadow-xl'
                }`}
              >
                {!ready
                  ? 'Loading...'
                  : isSubmitting
                    ? 'Creating Debate...'
                    : !authenticated
                      ? 'Login to Create Debate'
                      : 'Create Debate'}
              </button>
            </form>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Preview</h2>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 space-y-4">
              {imagePreview && (
                <div className="w-full h-40 relative rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Debate preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
                  />
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {question || 'Your debate question will appear here'}
                </h3>
                {description && (
                  <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
                )}
              </div>

              {!question && !description && !imagePreview && (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg">Start typing to see your debate preview</p>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for great debates:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ask questions that don't have obvious answers</li>
                <li>• Be respectful and considerate of all viewpoints</li>
                <li>• Add context to help others understand the topic</li>
                <li>• Use images to make your debate more engaging</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
