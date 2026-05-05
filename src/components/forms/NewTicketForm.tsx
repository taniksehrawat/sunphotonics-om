'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  plants: { id: string; name: string }[];
  engineers: { id: string; full_name: string }[];
  userId: string;
  companyId: string;
}

const inputClass = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm";
const selectClass = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm";

export default function NewTicketForm({ plants, engineers, userId, companyId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    plant_id: '',
    title: '',
    description: '',
    priority: 'medium',
    category: 'inverter',
    assigned_to: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title || !formData.plant_id) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          plant_id: formData.plant_id,
          company_id: companyId,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          category: formData.category,
          assigned_to: formData.assigned_to || null,
          created_by: userId,
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      if (images.length > 0 && ticket) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `${companyId}/tickets/${ticket.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('ticket-images')
            .upload(filePath, image);

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('ticket-images')
              .getPublicUrl(filePath);

            await supabase.from('ticket_images').insert({
              ticket_id: ticket.id,
              image_url: urlData.publicUrl,
              storage_path: filePath,
              uploaded_by: userId,
            });
          }
        }
      }

      toast.success('Ticket created successfully!');
      router.push('/tickets');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Plant *</label>
        <select name="plant_id" value={formData.plant_id} onChange={handleChange} required className={selectClass}>
          <option value="">Select plant</option>
          {plants.map((plant) => (
            <option key={plant.id} value={plant.id}>{plant.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Inverter failure at Plant Alpha" className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the issue in detail..." className={inputClass} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select name="category" value={formData.category} onChange={handleChange} className={selectClass}>
            <option value="inverter">Inverter</option>
            <option value="panel">Panel</option>
            <option value="wiring">Wiring</option>
            <option value="cleaning">Cleaning</option>
            <option value="monitoring">Monitoring</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
          <select name="priority" value={formData.priority} onChange={handleChange} className={selectClass}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
          <select name="assigned_to" value={formData.assigned_to} onChange={handleChange} className={selectClass}>
            <option value="">Unassigned</option>
            {engineers.map((eng) => (
              <option key={eng.id} value={eng.id}>{eng.full_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Images (max 5)</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative">
              <img src={preview} alt={`Preview ${index + 1}`} className="h-24 w-24 object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          Upload Images
          <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={() => router.push('/tickets')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Creating...' : 'Create Ticket'}
        </button>
      </div>
    </form>
  );
}