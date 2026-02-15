"use client";

import { useState } from 'react';

export function useEditableField<T = string>(
  initialValue: T,
  onSave: (value: T) => Promise<void>
) {
  const [value, setValue] = useState<T>(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = () => {
    setIsEditing(true);
  };

  const save = async () => {
    try {
      setIsSaving(true);
      await onSave(value);
      setIsEditing(false);
    } catch (error) {
      setValue(initialValue);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const cancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  return {
    value,
    setValue,
    isEditing,
    isSaving,
    startEdit,
    save,
    cancel,
  };
}
