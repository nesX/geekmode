import { useState, useCallback } from 'react';

const MAX_FILES = 8;
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function useImageUpload() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState([]);

  const handleSelect = useCallback((e) => {
    const selected = Array.from(e.target.files || []);
    const newErrors = [];

    const valid = selected.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        newErrors.push(`${file.name}: solo JPG, PNG o WebP`);
        return false;
      }
      if (file.size > MAX_SIZE) {
        newErrors.push(`${file.name}: máximo 5MB`);
        return false;
      }
      return true;
    });

    setFiles((prev) => {
      const total = prev.length + valid.length;
      if (total > MAX_FILES) {
        newErrors.push(`Máximo ${MAX_FILES} imágenes`);
        const allowed = valid.slice(0, MAX_FILES - prev.length);
        const newPreviews = allowed.map((f) => URL.createObjectURL(f));
        setPreviews((p) => [...p, ...newPreviews]);
        setErrors(newErrors);
        return [...prev, ...allowed];
      }
      const newPreviews = valid.map((f) => URL.createObjectURL(f));
      setPreviews((p) => [...p, ...newPreviews]);
      setErrors(newErrors);
      return [...prev, ...valid];
    });

    e.target.value = '';
  }, []);

  const removeFile = useCallback((index) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return { files, previews, errors, handleSelect, removeFile };
}
