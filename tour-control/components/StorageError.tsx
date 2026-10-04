'use client';

export default function StorageError({ message }: { message: string }) {
  if (!message) return null;
  return <p className="storage-error" role="alert">Supabase could not save or load your data: {message}</p>;
}
