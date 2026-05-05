'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

const STATUS_FLOW: Record<string, string[]> = {
  open: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['closed'],
  closed: [],
};

export default function TicketDetailClient({ ticket, images, engineers, currentUser }: any) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState(ticket.status);
  const [assignedTo, setAssignedTo] = useState(ticket.assigned_to || '');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const canManage = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.id === ticket.assigned_to;
  const nextStatuses = STATUS_FLOW[status] || [];

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const updates: any = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        updates.resolution_notes = resolutionNotes;
      }

      const { error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticket.id);

      if (error) throw error;
      setStatus(newStatus);
      toast.success(`Status changed to ${newStatus.replace('_', ' ')}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assignedTo) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ assigned_to: assignedTo, updated_at: new Date().toISOString() })
        .eq('id', ticket.id);

      if (error) throw error;
      toast.success('Ticket assigned');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${ticket.company_id}/tickets/${ticket.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('ticket-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('ticket-images')
          .getPublicUrl(filePath);

        await supabase.from('ticket_images').insert({
          ticket_id: ticket.id,
          image_url: urlData.publicUrl,
          storage_path: filePath,
          uploaded_by: currentUser.id,
        });
      }
      toast.success('Images uploaded');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const priorityColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  return (
    <div>
      <Link href="/tickets" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to tickets
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm text-gray-500">Plant: {ticket.plants?.name}</span>
              <span className="text-sm text-gray-500">Category: {ticket.category}</span>
              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${priorityColors[ticket.priority]}`}>
                {ticket.priority}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[status]}`}>
            {status.replace('_', ' ')}
          </span>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{ticket.description || 'No description provided'}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <span className="text-gray-500">Created by: </span>
            <span className="text-gray-900">{ticket.created_by_user?.full_name}</span>
          </div>
          <div>
            <span className="text-gray-500">Created at: </span>
            <span className="text-gray-900">{format(new Date(ticket.created_at), 'PPpp')}</span>
          </div>
          {ticket.assigned_to_user && (
            <div>
              <span className="text-gray-500">Assigned to: </span>
              <span className="text-gray-900">{ticket.assigned_to_user.full_name}</span>
            </div>
          )}
          {ticket.resolved_at && (
            <div>
              <span className="text-gray-500">Resolved at: </span>
              <span className="text-gray-900">{format(new Date(ticket.resolved_at), 'PPpp')}</span>
            </div>
          )}
        </div>

        {/* Resolution Notes */}
        {ticket.resolution_notes && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-2">Resolution Notes</h3>
            <p className="text-green-700">{ticket.resolution_notes}</p>
          </div>
        )}

        {/* Images */}
        {images.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Images ({images.length})</h3>
            <div className="flex flex-wrap gap-3">
              {images.map((img: any) => (
                <a key={img.id} href={img.image_url} target="_blank" rel="noopener noreferrer">
                  <img src={img.image_url} alt="Ticket" className="h-32 w-32 object-cover rounded-lg border" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {canManage && (
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Manage Ticket</h3>

            {/* Status Changes */}
            {nextStatuses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((nextStatus) => (
                  <button
                    key={nextStatus}
                    onClick={() => handleStatusChange(nextStatus)}
                    disabled={loading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Mark as {nextStatus.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}

            {/* Resolution Notes */}
            {status === 'in_progress' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe how the issue was resolved..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}

            {/* Assign */}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign to</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Unassigned</option>
                  {engineers.map((eng: any) => (
                    <option key={eng.id} value={eng.id}>{eng.full_name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAssign}
                disabled={loading || !assignedTo}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
              >
                Assign
              </button>
            </div>

            {/* Upload Images */}
            <div>
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Images'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}