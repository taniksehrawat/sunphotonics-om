'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  plants: { id: string; name: string }[];
  userId: string;
  companyId: string;
}

export default function DailyLogForm({ plants, userId, companyId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    plant_id: '',
    log_date: new Date().toISOString().split('T')[0],
    generation_kwh: '',
    peak_power_kw: '',
    downtime_minutes: '0',
    weather_condition: 'sunny',
    temperature_celsius: '',
    notes: '',
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

  const uploadImages = async (logId: string) => {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${companyId}/${logId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('log-images')
        .upload(filePath, image);

      if (uploadError) {
        toast.error(`Failed to upload image: ${image.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('log-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(urlData.publicUrl);

      // Save to log_images table
      await supabase.from('log_images').insert({
        log_id: logId,
        image_url: urlData.publicUrl,
        storage_path: filePath,
        uploaded_by: userId,
      });
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.plant_id) {
        toast.error('Please select a plant');
        setLoading(false);
        return;
      }

      if (!formData.generation_kwh) {
        toast.error('Generation is required');
        setLoading(false);
        return;
      }

      // Insert log
      const { data: log, error: logError } = await supabase
        .from('daily_logs')
        .insert({
          plant_id: formData.plant_id,
          company_id: companyId,
          created_by: userId,
          log_date: formData.log_date,
          generation_kwh: parseFloat(formData.generation_kwh),
          peak_power_kw: formData.peak_power_kw ? parseFloat(formData.peak_power_kw) : null,
          downtime_minutes: parseInt(formData.downtime_minutes) || 0,
          weather_condition: formData.weather_condition,
          temperature_celsius: formData.temperature_celsius ? parseFloat(formData.temperature_celsius) : null,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (logError) {
        if (logError.code === '23505') {
          toast.error('A log already exists for this plant on this date');
        } else {
          throw logError;
        }
        setLoading(false);
        return;
      }

      // Upload images
      if (images.length > 0) {
        await uploadImages(log.id);
      }

      toast.success('Daily log submitted successfully!');
      router.push('/logs/view');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Plant Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plant *
        </label>
        <select
          name="plant_id"
          value={formData.plant_id}
          onChange={handleChange}
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
        >
          <option value="">Select a plant</option>
          {plants.map((plant) => (
            <option key={plant.id} value={plant.id}>{plant.name}</option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date *
        </label>
        <input
          type="date"
          name="log_date"
          value={formData.log_date}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
        />
      </div>

      {/* Generation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Generation (kWh) *
        </label>
        <input
          type="number"
          name="generation_kwh"
          value={formData.generation_kwh}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
          placeholder="0.00"
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Peak Power (kW)
          </label>
          <input
            type="number"
            name="peak_power_kw"
            value={formData.peak_power_kw}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="0.00"
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Downtime (minutes)
          </label>
          <input
            type="number"
            name="downtime_minutes"
            value={formData.downtime_minutes}
            onChange={handleChange}
            min="0"
            placeholder="0"
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weather
          </label>
          <select
            name="weather_condition"
            value={formData.weather_condition}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="sunny">Sunny</option>
            <option value="partly_cloudy">Partly Cloudy</option>
            <option value="cloudy">Cloudy</option>
            <option value="rainy">Rainy</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temperature (°C)
          </label>
          <input
            type="number"
            name="temperature_celsius"
            value={formData.temperature_celsius}
            onChange={handleChange}
            step="0.1"
            placeholder="25.0"
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Any observations, issues, or remarks..."
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images (max 5)
        </label>
        <div className="flex flex-wrap gap-3 mb-3">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="h-24 w-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          Upload Images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/logs/view')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Log'}
        </button>
      </div>
    </form>
  );
}