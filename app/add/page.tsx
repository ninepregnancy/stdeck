'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../services/db-client';
import { generateDescription } from '../../services/geminiService';
import { Button } from '../../components/Button';
import { useRouter } from 'next/navigation';
import { Wand2, Loader2, AlertCircle } from 'lucide-react';

interface FormData {
  title: string;
  url: string;
  category: string;
  description: string;
  image_url: string;
}

export default function AddPage() {
  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<FormData>();
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGenerate = async () => {
    const { title, category } = getValues();
    if (!title || !category) {
      setError('Please enter a name and category first.');
      return;
    }
    setError('');
    setGenerating(true);
    try {
      const description = await generateDescription(title, category);
      setValue('description', description);
    } catch (e) {
      setError('Failed to generate description. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    try {
      await api.createStartup(data);
      router.push('/browse');
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Submit Startup</h1>
        <p className="text-slate-400">Get your product in front of thousands of early adopters.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Website URL</label>
          <input 
            {...register('url', { required: true, pattern: /^https?:\/\/.+/ })}
            placeholder="https://example.com"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          {errors.url && <span className="text-red-400 text-xs">Valid URL required (start with http/https)</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Startup Name</label>
            <input 
              {...register('title', { required: true })}
              placeholder="e.g. Acme Corp"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
             {errors.title && <span className="text-red-400 text-xs">Name required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Category</label>
            <select 
              {...register('category', { required: true })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none"
            >
              <option value="">Select Category...</option>
              <option value="SaaS">SaaS</option>
              <option value="AI Tools">AI Tools</option>
              <option value="DevTools">DevTools</option>
              <option value="Fintech">Fintech</option>
              <option value="Health">Health</option>
              <option value="Consumer">Consumer</option>
            </select>
             {errors.category && <span className="text-red-400 text-xs">Category required</span>}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-300">Tagline / Description</label>
            <button 
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
              Generate with AI
            </button>
          </div>
          <textarea 
            {...register('description', { required: true, maxLength: 200 })}
            rows={3}
            placeholder="A short, punchy description of what you do..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
          />
          {errors.description && <span className="text-red-400 text-xs">Description required (max 200 chars)</span>}
        </div>

        <div className="space-y-2">
           <label className="text-sm font-medium text-slate-300">Cover Image URL (Optional)</label>
            <input 
            {...register('image_url')}
            placeholder="https://..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
           <p className="text-xs text-slate-500">Leave blank for random placeholder.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={submitting}
          className="w-full text-lg py-4 font-semibold"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...
            </>
          ) : (
            'Launch Startup'
          )}
        </Button>

      </form>
    </div>
  );
}